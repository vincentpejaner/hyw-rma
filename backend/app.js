const express = require('express');
const app = express();

app.use(express.json());
app.use("api/hywForm", require('./routes/hywRoutes.js'))

app.get("/")
app.listen(3000, () => console.log("Listening on port 3000"));