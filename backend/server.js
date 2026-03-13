require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const corsOptions = {
  origin: ["https://hyw-rma.vercel.app", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
app.options("/", cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("HYW RMA API is running");
});
app.use("/api/hyw", require("./routes/hywRoutes"));

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
