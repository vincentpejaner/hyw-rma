require("dotenv").config();


const express = require("express");
const app = express();
const cors = require("cors");
const PORT = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json());

console.log("MYSQLHOST:", process.env.MYSQLHOST);
console.log("MYSQLPORT:", process.env.MYSQLPORT);
app.get("/", (req, res) => res.send("Server is running!"));

app.use("/api/hyw", require("./routes/hywRoutes.js"));

app.listen(PORT, "0.0.0.0", () => console.log(`Listening on port ${PORT}`));
