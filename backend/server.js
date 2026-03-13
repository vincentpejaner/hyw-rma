require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

/* CORS configuration */
const corsOptions = {
  origin: ["https://hyw-rma.vercel.app", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
app.options("/", cors(corsOptions)); // FIXED

app.use(express.json());
app.use("/api/hyw", require("./routes/hywRoutes"));
app.use("/api/hyw", require("./routes/hywRoutes"));
