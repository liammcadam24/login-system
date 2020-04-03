var mysql = require("mysql");
var express = require("express");
var session = require("express-session");
var bodyParser = require("body-parser");
var path = require("path");

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodelogin'
});

var app = express();

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/auth', function (request, response) {
    var username = request.body.username;
    var password = request.body.password;

    if (username && password) {
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
            if (results.length > 0) {
                request.session.loggedin = true;
                request.session.username = username;
                response.redirect('/home');
            } else {
                response.send('Invalid username or password');
            }
            response.end();
        });
    } else {
        response.send('Please enter a username and password');
        response.end();
    }
});

app.post('/reg', function (req, response) {
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;

    /* 
      TODO: 
    - Checks for existing username / passwords
    - Automatically log user in after creation account
    - Possibly email verification
    - Password encryption 
    */

    //Password validation
    if (password.length < 6) {
        response.send('Password must be greater than 6 characters.');
        response.end();
    }

    //Add credentials to database
    let sql = `INSERT INTO accounts (username, password, email) VALUES ('${username}', '${password}', '${email}')`;

    connection.query(sql, function (err, result) {
        if (err) throw err;
        response.send('Registration was successful.');
        response.end();
    });
});

app.get('/home', function (request, response) {
    if (request.session.loggedin) {
        response.send(`Successfully logged in as: ${request.session.username}`);
    } else {
        response.send(`You must be logged in to view this page.`);
    }
    response.end();
});

app.listen(1337);