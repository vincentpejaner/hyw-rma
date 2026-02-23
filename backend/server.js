const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => res.send("Server is running!"));

app.use('/api/hywForm', require('./routes/hywRoutes.js'));

app.listen(3001, () => console.log("Listening on port 3001"));