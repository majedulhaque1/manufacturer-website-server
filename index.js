const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.get('/',async (req, res) =>{
    res.send('manufacturer website is runing');
})

app.listen(port, () =>{
    console.log('app is runing on port', port);
})