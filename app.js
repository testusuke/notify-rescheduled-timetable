const HOST = '127.0.0.1';
const PORT = 3000;

const express = require('express');
const mysql = require('mysql');
const e = require("express");
// const session = require('express-session');
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_DB
});

//  initialize tables
connection.connect((err) => {
    if (err) throw err;
    console.log('success connect db');
    const sql = "create table if not exists tables\n" +
        "(\n" +
        "\tid int auto_increment,\n" +
        "\tname VARCHAR(64) null,\n" +
        "\tdescription VARCHAR(128) null,\n" +
        "\tconstraint tables_pk\n" +
        "\t\tprimary key (id)\n" +
        ")";
    //  create table
    connection.query(
        sql,
        (err, result) => {
            if (err) throw err
            console.log('success create table');
        }
    );
});

//  redirect
app.get('/', (req, res) => {
    res.redirect('/index');
});

app.get('/index', (req, res) => {
    connection.query(
        'SELECT * FROM tables',
        (error, results) => {
            console.log(results);
            res.render('index.ejs', {tables: results});
        }
    );
});

// TODO parameterにidを追加して、複数のtableを表示する
app.get('/table/view/:id', (req, res) => {
    res.render('table.ejs');
});

/**
 * @description Creating Table Menu
 */
app.get('/table/create', (req, res) => {
    res.render('table-creator.ejs');
});

/**
 * @description Create Table
 */
app.post('/table/create', (req, res) => {
    console.log('receive create table request');
    connection.query(
        'INSERT INTO tables (name, description) VALUES (?, ?)',
        [req.body.name, req.body.description],
        (error, results) => {
            if (error) throw error
            res.redirect('/index');
        }
    );
});

/**
 * @description Delete Table
 */
app.post('/table/delete/:id', (req, res) => {
    connection.query(
        'DELETE FROM tables WHERE id=?',
        [req.params.id],
        (error, results) => {
            if (error) throw error
            res.redirect('/index');
        }
    );
});

//  start app
app.listen(PORT, HOST, () => {
    //  output url
    console.log(`url: http://${HOST}:${PORT}`);
});