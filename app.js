const express = require('express');
const mysql = require('mysql');
const app = express();

app.use(express.static('public'));

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_DB
});

app.get('/index', (req, res) => {
    res.render('index.ejs');
});

app.listen(3000);