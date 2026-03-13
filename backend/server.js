const express = require("express");
const app = express();
const cors = require("cors");
const PORT = Number(process.env.PORT || 3001);

app.use(cors());
app.use(
  cors({
    origin: [
      "https://hyw-rma.vercel.app",
      "http://localhost:5173"
    ],
    methods: ["GET","POST","PUT","DELETE","OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization"],
    credentials: true
  })
);
app.use(express.json());


app.get("/", (req, res) => res.send("Server is running!"));

app.use("/api/hyw", require("./routes/hywRoutes.js"));

app.listen(PORT, "0.0.0.0", () => console.log(`Listening on port ${PORT}`));
