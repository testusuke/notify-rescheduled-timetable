const express = require('express');
const app = express();

app.use(express.static('public'));

app.get('/index', (req, res) => {
    res.render('index.ejs');
});

app.listen(3000);