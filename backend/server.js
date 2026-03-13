require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* Root test route */
app.get("/", (req, res) => {
  res.send("HYW RMA API is running");
});

/* API routes */
app.use("/api/hyw", require("./routes/hywRoutes"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});