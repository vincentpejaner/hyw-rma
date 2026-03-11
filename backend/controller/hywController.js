const db = require("../db");

function getHYW(req, res) {
  const query = "SELECT * FROM db_issue";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching HYW data:", err);
      return res.status(500).json({ error: "Failed to fetch HYW data" });
    }
    res.status(200).json(results);
  });
}

//FUNCTION TO INSERT DATA
function insertHYW(req, res) {
  console.log("insertHYW received body:", req.body);

  const {
    fullName,
    emailAddress,
    phoneNumber,
    productModel,
    serialNumber,
    issueType,
    purchaseDate,
    returnDate,
    preferredResolution,
    issueDescription,
    ticketNumber,
    accountid,
    companyName,
    companyAddress,
    companyPhone,
  } = req.body;

  if (!accountid) {
    return res.status(400).json({ error: "Account ID is missing" });
  }

  // Check if customer profile exists, if not create one
  const checkCustomerSql =
    "SELECT db_customerid FROM db_customer WHERE F_accountid = ? LIMIT 1";
  db.query(checkCustomerSql, [accountid], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking customer:", checkErr);
      return res.status(500).json({ error: "Customer check failed" });
    }

    const processRma = () => {
      const queryProduct =
        "INSERT INTO db_product (db_product_name, db_serial_number, db_purchase_date, db_return_date, db_ticket, ticket_id) VALUES (?, ?, ?, ?, ?, ?)";

      db.query(
        queryProduct,
        [
          productModel,
          serialNumber,
          purchaseDate,
          returnDate,
          ticketNumber,
          ticketNumber,
        ],
        (err, productResult) => {
          if (err) {
            console.error("Product insert failed:", err);
            return res.status(500).json({ error: "Product insert failed" });
          }

          const productId = productResult.insertId;
          const issueQuery =
            "INSERT INTO db_issue (db_issue_type, db_resolution, db_description, F_productid, F_accountid) VALUES (?, ?, ?, ?, ?)";

          db.query(
            issueQuery,
            [
              issueType,
              preferredResolution,
              issueDescription,
              productId,
              Number(accountid),
            ],
            (err) => {
              if (err) {
                console.error("Issue insert failed:", err);
                return res.status(500).json({ error: "Issue insert failed" });
              }

              res.status(200).json({
                message: "RMA submitted successfully",
              });
            },
          );
        },
      );
    };

    // If customer doesn't exist, create one first
    if (!checkResult || checkResult.length === 0) {
      const createCustomerSql =
        "INSERT INTO db_customer (db_fullname, db_phone_number, db_companyEmail, db_companyName, db_companyAddress, F_accountid) VALUES (?, ?, ?, ?, ?, ?)";
      db.query(
        createCustomerSql,
        [
          fullName || "",
          companyPhone || phoneNumber || "",
          emailAddress || "",
          companyName || "",
          companyAddress || "",
          Number(accountid),
        ],
        (err) => {
          if (err) {
            console.error("Customer creation failed:", err);
            return res.status(500).json({ error: "Customer creation failed" });
          }
          processRma();
        },
      );
    } else {
      processRma();
    }
  });
}

// FUNCTION TO HANDLE RMA TRACKING BY TICKET NUMBER FROM FRONTEND
function getMyRmaRequests(req, res) {
  const ticketId = (req.params.id || "").trim();

  if (!ticketId) {
    return res.status(400).json({ message: "Ticket id is required." });
  }

  const query = `
   SELECT * FROM db_customer c 
   LEFT JOIN db_account a ON c.F_accountid = a.account_id
   LEFT JOIN db_product p ON c.F_accountid = a.account_id
   LEFT JOIN db_issue i ON p.db_productid = i.F_productid
    WHERE p.ticket_id = ?
    
  `;

  db.query(query, [ticketId], (err, results) => {
    if (err) {
      console.error("My RMA query error:", err);
      return res
        .status(500)
        .json({ message: "Failed to fetch your RMA requests." });
    }

    console.log("Raw results for ticket", ticketId, ":", results);

    const requests = (results || [])
      .filter((row) => row.db_issue_type)
      .map((row) => ({
        ticketNumber: row.db_ticket,
        productModel: row.db_product_name,
        serialNumber: row.db_serial_number,
        purchaseDate: row.db_purchase_date,
        returnDate: row.db_return_date,
        issueType: row.db_issue_type,
        preferredResolution: row.db_resolution,
        issueDescription: row.db_description,
        fullName: row.db_fullname || "",
        emailAddress: row.db_companyEmail || "",
        phoneNumber: row.db_phone_number || "",
        status: "Submitted",
      }));

    console.log("Filtered RMA requests for ticket", ticketId, ":", requests);
    return res.status(200).json({ requests });
  });
}

// FUNCTION TO TRACK FULL RMA FORM BY TICKET ID
function getRmaByTicket(req, res) {
  const ticketId = (req.params.ticketId || "").trim();

  if (!ticketId) {
    return res.status(400).json({ message: "Ticket ID is required." });
  }

  const normalizedTicket = ticketId.replace(
    /^RMA-(\d{4})-(\d{4})-(\d{6})-(\d{3})$/i,
    "RMA-$1$2-$3-$4",
  );
  const ticketCandidates = [...new Set([ticketId, normalizedTicket])];

  const placeholders = ticketCandidates.map(() => "?").join(", ");
  const itemsSql = `
    SELECT
      p.db_productid,
      p.db_ticket,
      p.db_product_name,
      p.db_serial_number,
      p.db_purchase_date,
      p.db_return_date,
      p.F_accountid,
      i.db_description,
      i.db_resolution
    FROM db_product p
    LEFT JOIN db_issue i ON p.db_productid = i.F_productid
    WHERE p.db_ticket IN (${placeholders})
    ORDER BY p.db_productid ASC
  `;

  db.query(itemsSql, ticketCandidates, (itemsErr, itemRows) => {
    if (itemsErr) {
      console.error("Track query error:", itemsErr);
      return res.status(500).json({ message: "Failed to fetch RMA details." });
    }

    if (!itemRows || itemRows.length === 0) {
      return res
        .status(404)
        .json({ message: "No RMA found for this Ticket ID." });
    }

    const accountId = itemRows[0].F_accountid;

    const profileSql = `
      SELECT
        db_fullname,
        db_phone_number,
        db_companyEmail,
        db_companyName,
        db_companyAddress
      FROM db_customer
      WHERE F_accountid = ?
      LIMIT 1
    `;

    db.query(profileSql, [accountId], (profileErr, profileRows) => {
      if (profileErr) {
        console.error("Track profile query error:", profileErr);
        return res
          .status(500)
          .json({ message: "Failed to fetch customer profile." });
      }

      const profile = profileRows?.[0] || {};

      const items = itemRows.map((row, index) => ({
        itemNo: index + 1,
        itemDescription: row.db_product_name || "",
        serialNumber: row.db_serial_number || "",
        dateOfPurchase: row.db_purchase_date || "",
        returnDate: row.db_return_date || "",
        problem: row.db_description || "",
        status: row.db_resolution || "Submitted",
      }));

      return res.status(200).json({
        ticketId,
        status: items[0]?.status || "Submitted",
        company: {
          fullName: profile.db_fullname || "",
          companyPhone: profile.db_phone_number || "",
          companyEmail: profile.db_companyEmail || "",
          companyName: profile.db_companyName || "",
          companyAddress: profile.db_companyAddress || "",
        },
        items,
      });
    });
  });
}

// FUNCTION TO HANDLE LOGIN REQUEST FROM FRONTEND
function getAccount(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  const query =
    "SELECT * FROM db_account WHERE account_username = ? AND account_password = ?";

  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error("Login query error:", err);
      return res
        .status(500)
        .json({ message: "Failed to fetch account details." });
    }
    if (!results || results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    return res
      .status(200)
      .json({ message: "Login successful.", account: results[0] });
  });
}

//FUNCTION TO HANDLE INSERT DATA FOR PROFILE CREATION FROM FRONTEND
function insertProfile(req, res) {
  const {
    fullName,
    companyPhone,
    companyEmail,
    companyName,
    companyAddress,
    accountId,
  } = req.body;

  if (!accountId || isNaN(accountId)) {
    return res.status(400).json({ message: "Invalid account ID." });
  }

  const query = `
    INSERT INTO db_customer (
      db_fullname,
      db_phone_number,
      db_companyEmail,
      db_companyName,
      db_companyAddress,
      F_accountid
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      fullName,
      companyPhone,
      companyEmail,
      companyName,
      companyAddress,
      Number(accountId),
    ],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Failed to insert profile.",
          error: err.message,
        });
      }

      return res.status(201).json({
        message: "Profile inserted successfully.",
        results,
      });
    },
  );
}

//FUNCTION TO SELECT PROFILE BASED ON ACCOUNT ID
function selectProfile(req, res) {
  const id = req.params.id;

  const sql = "SELECT * FROM db_customer WHERE F_accountid = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    if (result.length > 0) {
      return res.json({ profile: result[0] });
    }

    res.json({ profile: null });
  });
}

// FUNCTION TO HANDLE RMA SUBMISSION FROM FRONTEND
async function submitRmaRequest(req, res) {
  let { items, accountId, ticketId } = req.body;

  console.log("Incoming request:", req.body);

  if (typeof accountId === "object" && accountId !== null) {
    accountId = accountId.account_id;
  }

  accountId = Number(accountId);

  if (!accountId) {
    return res.status(400).json({
      message: "Account ID missing or invalid",
    });
  }

  if (!ticketId) {
    return res.status(400).json({
      message: "Ticket ID missing or invalid",
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: "No items submitted",
    });
  }

  const query = (sql, params) =>
    new Promise((resolve, reject) => {
      db.query(sql, params, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

  try {
    // Check if customer profile exists, if not create one
    const customerCheck = await query(
      "SELECT db_customerid FROM db_customer WHERE F_accountid = ? LIMIT 1",
      [accountId],
    );

    if (!customerCheck || customerCheck.length === 0) {
      await query(
        "INSERT INTO db_customer (db_fullname, db_phone_number, db_companyEmail, db_companyName, db_companyAddress, F_accountid) VALUES (?, ?, ?, ?, ?, ?)",
        ["", "", "", "", "", accountId],
      );
    }

    const ticket =
      typeof ticketId === "string" && ticketId.trim()
        ? ticketId.trim()
        : "RMA-" + Date.now();

    for (const item of items) {
      const itemDescription = String(item.itemDescription || "");
      const serialNumber = String(item.serialNumber || "");
      const purchaseDate = item.dateOfPurchase || null;
      const returnDate = item.returnDate || null;
      const problem = String(item.problem || "");

      console.log("Saving item:", {
        itemDescription,
        serialNumber,
        purchaseDate,
        returnDate,
        problem,
      });

      const productSql = `
        INSERT INTO db_product
        (
          db_product_name,
          db_serial_number,
          db_purchase_date,
          db_return_date,
          db_ticket,
          F_accountid,
          ticket_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const productResult = await query(productSql, [
        itemDescription,
        serialNumber,
        purchaseDate,
        returnDate,
        ticket,
        accountId,
        ticketId,
      ]);

      const productId = productResult.insertId;

      const issueSql = `
        INSERT INTO db_issue
        (
          db_issue_type,
          db_resolution,
          db_description,
          F_productid
        )
        VALUES (?, ?, ?, ?)
      `;

      await query(issueSql, ["Hardware Issue", "Pending", problem, productId]);
    }

    res.json({
      message: "RMA submitted successfully",
      ticket: ticket,
    });
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      message: "Database error",
      error: error.message,
    });
  }
}

module.exports = {
  getHYW,
  insertHYW,
  getMyRmaRequests,
  getRmaByTicket,
  getAccount,
  insertProfile,
  selectProfile,
  submitRmaRequest,
};
