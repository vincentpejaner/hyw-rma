const db = require("../db");

function formatDbError(err, fallbackMessage) {
  console.error(fallbackMessage, err);

  return {
    error: fallbackMessage,
    code: err?.code || "DB_QUERY_FAILED",
    details:
      process.env.NODE_ENV === "production"
        ? undefined
        : err?.sqlMessage || err?.message || "Unknown database error",
  };
}

function getHYW(req, res) {
  const query = "SELECT * FROM db_issue";
  db.query(query, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json(formatDbError(err, "Failed to fetch HYW data"));
    }
    res.status(200).json(results);
  });
}

function getHealthStatus(req, res) {
  db.query("SELECT 1 AS db_ok", (err) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        database: "unreachable",
        ...formatDbError(err, "Database health check failed"),
      });
    }

    return res.status(200).json({
      status: "ok",
      database: "reachable",
    });
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

    const processRma = (customerId) => {
      // Generate randomized ticket for db_ticket
      // Keep within db_ticket VARCHAR(15)
      const timestamp = Date.now().toString().slice(-6); // 6 digits
      const random = Math.random().toString(36).substr(2, 4).toUpperCase(); // 4 chars
      const randomTicket = `RMA-${timestamp}-${random}`; // 15 chars

      const queryProduct =
        "INSERT INTO db_product (db_product_name, db_serial_number, db_purchase_date, db_return_date, db_ticket, ticket_id, F_customerid) VALUES (?, ?, ?, ?, ?, ?, ?)";

      db.query(
        queryProduct,
        [
          productModel,
          serialNumber,
          purchaseDate,
          returnDate,
          randomTicket,
          ticketNumber,
          customerId,
        ],
        (err, productResult) => {
          if (err) {
            console.error("Product insert failed:", err);
            return res.status(500).json({ error: "Product insert failed" });
          }

          const productId = productResult.insertId;
          const issueQuery =
            "INSERT INTO db_issue (db_issue_type, db_resolution, db_description, F_productid) VALUES (?, ?, ?, ?)";

          db.query(
            issueQuery,
            [issueType, preferredResolution, issueDescription, productId],
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
        (err, createResult) => {
          if (err) {
            console.error("Customer creation failed:", err);
            return res.status(500).json({ error: "Customer creation failed" });
          }
          // Newly created customer; use the insertId from this insert
          processRma(createResult.insertId);
        },
      );
    } else {
      processRma(checkResult[0].db_customerid);
    }
  });
}

// FUNCTION TO HANDLE RMA REQUEST HISTORY FOR A LOGGED-IN ACCOUNT
function getMyRmaRequests(req, res) {
  const accountId = Number(req.params.accountId || req.query.accountId);

  if (!accountId) {
    return res.status(400).json({ message: "Account ID is required." });
  }

  const query = `
   SELECT
     c.F_accountid AS account_id,
     c.db_fullname,
     c.db_phone_number,
     c.db_companyEmail,
     c.db_companyName,
     c.db_companyAddress,
     p.db_productid,
     p.db_product_name,
     p.db_serial_number,
     p.db_purchase_date,
     p.db_return_date,
     p.db_ticket,
     p.ticket_id,
     i.db_issue_type,
     i.db_resolution,
     i.db_description
   FROM db_customer c
   INNER JOIN db_product p ON c.db_customerid = p.F_customerid
   LEFT JOIN db_issue i ON p.db_productid = i.F_productid
   WHERE c.F_accountid = ?
   ORDER BY p.ticket_id DESC, p.db_productid ASC
  `;

  db.query(query, [accountId], (err, results) => {
    if (err) {
      console.error("My RMA query error:", err);
      return res
        .status(500)
        .json({ message: "Failed to fetch your RMA requests." });
    }

    const groupedRequests = new Map();

    (results || []).forEach((row) => {
      const formTicketId = String(row.ticket_id || "").trim();
      if (!formTicketId) {
        return;
      }

      if (!groupedRequests.has(formTicketId)) {
        groupedRequests.set(formTicketId, {
          ticketId: formTicketId,
          status: row.db_resolution || "Submitted",
          submittedBy: {
            fullName: row.db_fullname || "",
            companyPhone: row.db_phone_number || "",
            companyEmail: row.db_companyEmail || "",
            companyName: row.db_companyName || "",
            companyAddress: row.db_companyAddress || "",
          },
          items: [],
        });
      }

      const currentRequest = groupedRequests.get(formTicketId);
      currentRequest.items.push({
        itemNo: currentRequest.items.length + 1,
        category: row.db_issue_type || "",
        itemDescription: row.db_product_name || "",
        serialNumber: row.db_serial_number || "",
        dateOfPurchase: row.db_purchase_date || "",
        returnDate: row.db_return_date || "",
        problem: row.db_description || "",
        resolution: row.db_resolution || "Pending",
        productTicket: row.db_ticket || "",
      });

      if (
        currentRequest.status === "Submitted" &&
        row.db_resolution &&
        row.db_resolution !== "Submitted"
      ) {
        currentRequest.status = row.db_resolution;
      }
    });

    const requests = Array.from(groupedRequests.values()).map((request) => ({
      ...request,
      totalItems: request.items.length,
    }));

    return res.status(200).json({ requests });
  });
}

// FUNCTION TO TRACK FULL RMA FORM BY TICKET ID
function getRmaByTicket(req, res) {
  const ticketId = (req.params.ticketId || "").trim();
  const accountId = req.query.accountId;

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
      p.ticket_id,
      p.db_product_name,
      p.db_serial_number,
      p.db_purchase_date,
      p.db_return_date,
      c.F_accountid AS account_id,
      i.db_issue_type,
      i.db_description,
      i.db_resolution
    FROM db_product p
    LEFT JOIN db_issue i ON p.db_productid = i.F_productid
    LEFT JOIN db_customer c ON p.F_customerid = c.db_customerid
    WHERE p.ticket_id IN (${placeholders})
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

    const rmaAccountId = itemRows[0].account_id;

    // If accountId was provided, verify ownership
    if (accountId && rmaAccountId != accountId) {
      return res
        .status(403)
        .json({ message: "Access denied. You can only view your own RMAs." });
    }

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

    const profileLookupId = rmaAccountId || accountId;

    db.query(profileSql, [profileLookupId], (profileErr, profileRows) => {
      if (profileErr) {
        console.error("Track profile query error:", profileErr);
        return res
          .status(500)
          .json({ message: "Failed to fetch customer profile." });
      }

      const profile = profileRows?.[0] || {};

      const items = itemRows.map((row, index) => ({
        itemNo: index + 1,
        category: row.db_issue_type || "",
        itemDescription: row.db_product_name || "",
        serialNumber: row.db_serial_number || "",
        dateOfPurchase: row.db_purchase_date || "",
        returnDate: row.db_return_date || "",
        problem: row.db_description || "",
        status: row.db_resolution || "Submitted",
        productTicket: row.db_ticket || "",
        formTicket: row.ticket_id || "",
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
const crypto = require("crypto");

function getAccount(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  const query =
    "SELECT * FROM db_account WHERE account_username = ? AND account_password = ?";

  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error("Login query failed:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (!results || results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const account = results[0];

    // generate new session token
    const token = crypto.randomBytes(32).toString("hex");

  const updateQuery =
    "UPDATE db_account SET db_session_token=? WHERE account_id=?";

    db.query(updateQuery, [token, account.account_id]);

    return res.status(200).json({
      message: "Login successful.",
      account: account,
      token: token,
    });
  });
}

function logOut(req, res) {
  const { account_id, accountId } = req.body || {};
  const resolvedAccountId = Number(account_id || accountId);

  if (!resolvedAccountId) {
    return res.status(400).json({ message: "Missing account_id" });
  }

  const query = "UPDATE db_account SET db_session_token=NULL WHERE account_id=?";

  db.query(query, [resolvedAccountId], (err) => {
    if (err) {
      console.error("Logout query failed:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json({ message: "Logged out successfully" });
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

    let customerId;

    if (!customerCheck || customerCheck.length === 0) {
      const insertResult = await query(
        "INSERT INTO db_customer (db_fullname, db_phone_number, db_companyEmail, db_companyName, db_companyAddress, F_accountid) VALUES (?, ?, ?, ?, ?, ?)",
        ["", "", "", "", "", accountId],
      );
      customerId = insertResult.insertId;
    } else {
      customerId = customerCheck[0].db_customerid;
    }

    const ticket =
      typeof ticketId === "string" && ticketId.trim()
        ? ticketId.trim()
        : "RMA-" + Date.now();

    function generateProductTicket() {
      // Keep within db_ticket VARCHAR(15)
      const timestamp = Date.now().toString().slice(-6); // 6 digits
      const random = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 chars
      return `RMA-${timestamp}-${random}`; // 15 chars
    }

    for (const item of items) {
      const category = String(item.category || "Others");
      const itemDescription = String(item.itemDescription || "");
      const serialNumber = String(item.serialNumber || "");
      const purchaseDate = item.dateOfPurchase || null;
      const returnDate = item.returnDate || null;
      const problem = String(item.problem || "");

      const productTicket = generateProductTicket();

      console.log("Saving item:", {
        itemDescription,
        serialNumber,
        purchaseDate,
        returnDate,
        problem,
        productTicket,
      });

      const productSql = `
        INSERT INTO db_product
        (
          db_product_name,
          db_serial_number,
          db_purchase_date,
          db_return_date,
          db_ticket,
          F_customerid,
          ticket_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const productResult = await query(productSql, [
        itemDescription,
        serialNumber,
        purchaseDate,
        returnDate,
        productTicket,
        customerId,
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

      await query(issueSql, [category, "Pending", problem, productId]);
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

function updateProfile(req, res) {
  const { id } = req.params;
  const { fullName, companyPhone, companyEmail, companyName, companyAddress } =
    req.body;

  const sql = `
    UPDATE db_customer
    SET
     db_fullname = ?,
     db_phone_number = ?,
     db_companyEmail = ?,
    db_companyName = ?,
    db_companyAddress = ?
    WHERE F_accountid = ?
  `;

  db.query(
    sql,
    [fullName, companyPhone, companyEmail, companyName, companyAddress, id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }

      res.json({
        message: "Profile updated successfully",
        affectedRows: result.affectedRows,
      });
    },
  );
}

function checkSession(req, res) {
  const { account_id, token } = req.body;

  const query = "SELECT db_session_token FROM db_account WHERE account_id=?";

  db.query(query, [account_id], (err, results) => {
    if (err) {
      console.error("Session check query failed:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (!results.length || results[0].db_session_token !== token) {
      return res.status(401).json({
        message: "Account logged in on another device.",
      });
    }

    res.status(200).json({ message: "Session valid" });
  });
}

module.exports = {
  getHYW,
  getHealthStatus,
  insertHYW,
  getMyRmaRequests,
  getRmaByTicket,
  getAccount,
  insertProfile,
  selectProfile,
  submitRmaRequest,
  updateProfile,
  checkSession,
  logOut
};
