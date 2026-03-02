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

          const customerQuery =
            "INSERT INTO db_customer (db_fullname, db_email, db_phone_number, F_productid) VALUES (?, ?, ?, ?)";

          db.query(
            customerQuery,
            [fullName, emailAddress, phoneNumber, productId],
            (err) => {
              if (err) {
                console.error("Customer insert failed:", err);
                return res.status(500).json({ error: "Customer insert failed" });
              }

              res.status(200).json({
                message: "RMA submitted successfully",
              });
            }
          );
        }
      );
    }
  );
}

/**
 * ✅ NEW: Track RMA Summary by Ticket
 * GET /api/hyw/track/:ticket
 */
function trackHYWByTicket(req, res) {
  const ticket = (req.params.ticket || "").trim();

  if (!ticket) {
    return res.status(400).json({ message: "Ticket is required." });
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
    WHERE p.db_ticket = ?
    LIMIT 1;
  `;

  db.query(query, [ticket], (err, results) => {
    if (err) {
      console.error("Track query error:", err);
      return res.status(500).json({ message: "Failed to fetch RMA details." });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    const row = results[0];

    // Return clean JSON keys that match your frontend fields
    return res.status(200).json({
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
    });
  });
}

module.exports = { getHYW, insertHYW, trackHYWByTicket };