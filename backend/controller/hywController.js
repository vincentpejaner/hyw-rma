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
  } = req.body;

  if (!accountid) {
    return res.status(400).json({ error: "Account ID is missing" });
  }

  
  const queryProduct =
    "INSERT INTO db_product (db_product_name, db_serial_number, db_purchase_date, db_return_date, db_ticket) VALUES (?, ?, ?, ?, ?)";

  db.query(
    queryProduct,
    [productModel, serialNumber, purchaseDate, returnDate, ticketNumber],
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

          const customerQuery =
            "INSERT INTO db_customer (db_fullname, db_email, db_phone_number, F_productid, F_accountid) VALUES (?, ?, ?, ?, ?)";

          db.query(
            customerQuery,
            [fullName, emailAddress, phoneNumber, productId, Number(accountid)],
            (err) => {
              if (err) {
                console.error("Customer insert failed:", err);
                return res
                  .status(500)
                  .json({ error: "Customer insert failed" });
              }

              res.status(200).json({
                message: "RMA submitted successfully",
              });
            },
          );
        },
      );
    },
  );
}


function getMyRmaRequests(req, res) {
  const accountEmail = (req.params.email || "").trim();

  if (!accountEmail) {
    return res.status(400).json({ message: "Account email is required." });
  }

  const query = `
    SELECT
      p.db_ticket,
      p.db_product_name,
      p.db_serial_number,
      p.db_purchase_date,
      i.db_issue_type,
      i.db_resolution,
      i.db_description,
      c.db_fullname,
      c.db_email,
      c.db_phone_number
    FROM db_product p
    LEFT JOIN db_issue i ON p.db_productid = i.F_productid
    LEFT JOIN db_customer c ON p.db_productid = c.F_productid
    WHERE c.db_email = ?
    ORDER BY p.db_productid DESC;
  `;

  db.query(query, [accountEmail], (err, results) => {
    if (err) {
      console.error("My RMA query error:", err);
      return res
        .status(500)
        .json({ message: "Failed to fetch your RMA requests." });
    }

    const requests = (results || []).map((row) => ({
      ticketNumber: row.db_ticket,
      productModel: row.db_product_name,
      serialNumber: row.db_serial_number,
      purchaseDate: row.db_purchase_date,
      issueType: row.db_issue_type,
      preferredResolution: row.db_resolution,
      issueDescription: row.db_description,
      fullName: row.db_fullname,
      emailAddress: row.db_email,
      phoneNumber: row.db_phone_number,
      status: "Submitted",
    }));

    return res.status(200).json({ requests });
  });
}

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


async function submitRmaRequest(req, res) {
  let { items, accountId } = req.body;

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
    const ticket = "RMA-" + Date.now();

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
          F_accountid
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const productResult = await query(productSql, [
        itemDescription,
        serialNumber,
        purchaseDate,
        returnDate,
        ticket,
        accountId,
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

      await query(issueSql, [
        "Hardware Issue",
        "Pending",
        problem,
        productId,
      ]);
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
  //trackHYWByTicket,
  getMyRmaRequests,
  getAccount,
  insertProfile,
  selectProfile,
  submitRmaRequest,
};
