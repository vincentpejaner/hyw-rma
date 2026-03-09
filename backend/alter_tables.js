const db = require("./db");

db.query("ALTER TABLE db_product ADD COLUMN db_return_date VARCHAR(15)", (err) => {
  if (err) {
    console.error("Error adding db_return_date:", err);
  } else {
    console.log("Added db_return_date to db_product");
  }
});

db.query("ALTER TABLE db_issue ADD COLUMN F_accountid INT(11)", (err) => {
  if (err) {
    console.error("Error adding F_accountid to db_issue:", err);
  } else {
    console.log("Added F_accountid to db_issue");
  }
});

db.query("ALTER TABLE db_customer ADD COLUMN F_accountid INT(11)", (err) => {
  if (err) {
    console.error("Error adding F_accountid to db_customer:", err);
  } else {
    console.log("Added F_accountid to db_customer");
  }
  db.end();
});