const db = require("../db");

function getAccount(req, res) {
  const { email, password } = req.body;

  const query = `
    SELECT * 
    FROM db_account 
    WHERE account_username = ? 
    AND account_password = ?
  `;

  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Server error" });
    }

 
    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }


    res.status(200).json({
      message: "Successfully login!",
      user: results[0], 
    });
  });
}

function getHYW(req, res) {
  const query = "SELECT * FROM db_issue";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching HYW data:", err);
      res.status(500).json({ error: "Failed to fetch HYW data" });
    } else {
      res.status(200).json(results);
      console.log("Fetched HYW data:", results);
    }
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
    preferredResolution,
    issueDescription,
    ticketNumber,
  } = req.body;

  const queryProduct =
    "INSERT INTO db_product (db_product_name, db_serial_number, db_purchase_date, db_ticket) VALUES (?, ?, ?, ?)";

  db.query(
    queryProduct,
    [productModel, serialNumber, purchaseDate, ticketNumber],
    (err, productResult) => {
      if (err) {
        console.error(err);
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
            console.error(err);
            return res.status(500).json({ error: "Issue insert failed" });
          }

          const customerQuery =
            "INSERT INTO db_customer (db_fullname, db_email, db_phone_number, F_productid) VALUES (?, ?, ?, ?)";

          db.query(
            customerQuery,
            [fullName, emailAddress, phoneNumber, productId],
            (err) => {
              if (err) {
                console.error(err);
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

module.exports = { getHYW, insertHYW, getAccount };
