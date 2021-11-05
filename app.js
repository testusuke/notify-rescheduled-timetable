const HOST = '127.0.0.1';
const PORT = 3000;

const express = require('express');
const mysql = require('mysql');
const e = require("express");
const moment = require("moment");
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
    const listSql = "create table if not exists table_list\n" +
        "(\n" +
        "\tid int auto_increment,\n" +
        "\tname VARCHAR(256) null,\n" +
        "\tdescription TEXT null,\n" +
        "\tconstraint tables_pk\n" +
        "\t\tprimary key (id)\n" +
        ")";
    const dataSql = "create table if not exists table_data\n" +
        "(\n" +
        "\tid int auto_increment,\n" +
        "\ttable_id int not null,\n" +
        "\tname VARCHAR(256) null,\n" +
        "\tdescription TEXT null,\n" +
        "\tdate DATE null,\n" +
        "\tconstraint table_data_pk\n" +
        "\t\tprimary key (id)\n" +
        ")";
    //  create table
    connection.query(
        listSql,
        (err, result) => {
            if (err) throw err
            console.log('success create `table_list` table');
        }
    );
    connection.query(
        dataSql,
        (err, result) => {
            if (err) throw err
            console.log('success create `table_data` table');
        }
    );
});

//  redirect
app.get('/', (req, res) => {
    res.redirect('/index');
});

app.get('/index', (req, res) => {
    connection.query(
        'SELECT * FROM table_list',
        (error, results) => {
            console.log(results);
            res.render('index.ejs', {tables: results});
        }
    );
});

// TODO parameterにidを追加して、複数のtableを表示する
app.get('/table/view/:id', (req, res) => {
    connection.query(
        'SELECT * FROM table_data WHERE table_id=? ORDER BY date ASC',
        [req.params.id],
        (error, results) => {
            console.log(results);
            res.render('table.ejs', {contents: results, tableId: req.params.id});
        }
    );
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
        'INSERT INTO table_list (name, description) VALUES (?, ?)',
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
        'DELETE FROM table_list WHERE id=?',
        [req.params.id],
        (error, results) => {
            if (error) throw error
            res.redirect('/index');
        }
    );
    //  TODO low priority: add process of removing table data.
});


/**
 * @description Creating Content Menu
 */
app.get('/table/content/create/:id', (req, res) => {
    res.render('content-creator.ejs', {tableId: req.params.id});
});

/**
 * @description Create Column
 */
app.post('/table/content/create/:id', (req, res) => {
    console.log('receive create column request');
    //  exception
    console.log(moment(req.body.date, "YYYY/MM/DD", true).isValid());
    if (moment(req.body.date, "YYYY/MM/DD", true).isValid() === false){
        res.redirect('/table/view/' + req.params.id);
        return
    }
    console.log("clear");
    connection.query(
        'INSERT INTO table_data (table_id, name, description, date) VALUES (?, ?, ?, ?)',
        [req.params.id, req.body.name, req.body.description, req.body.date],
        (error, results) => {
            if (error) throw error
            res.redirect('/table/view/' + req.params.id);
        }
    );
});

/**
 * @description Delete Table
 * @param id[int] content id
 */
app.post('/table/content/delete/:id', (req, res) => {
    connection.query(
        'DELETE FROM table_data WHERE id=?',
        [req.body.id],
        (error, results) => {
            if (error) throw error
            res.redirect('/table/view/' + req.params.id);
        }
    );
});

//  start app
app.listen(PORT, HOST, () => {
    //  output url
    console.log(`url: http://${HOST}:${PORT}`);
});