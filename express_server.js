const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { userCheck } = require('./helpers');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['lamb', 'couch', 'good'],
  maxAge: 24 * 60 * 60 * 1000
}));

app.set('view engine', 'ejs');

//generated random 6 character string
let randomStringGenerator = function() {
  let randomString = '';
  const alphanumericChoices = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let min = Math.ceil(0);
  let max = Math.floor(62);

  for (let i = 0; i < 6; i++) {
    randomString += alphanumericChoices[Math.floor(Math.random() * (max - min)) + min];
  }
  return randomString;
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", id: "hrdcdd" },
  "9sm5xK": { longURL: "http://www.google.com", id: "hrdcdd" }
};

//user database

const users = {};

//Filters urlsDatabase for user created tinyURLs

const urlsForUserId = function(urlDatabase, id) {
  let userCreatedURLs = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].id === id) {
      userCreatedURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userCreatedURLs;
};


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//registration

app.get('/register', (req, res) => {
  if (req.session['user_id'] === 'undefined') {
    let templateVars = { error: 'Please register or login to access your URLs' };
    res.render('urls_login', templateVars);
  }
  let templateVars = { error: null };
  res.render('urls_register', templateVars);

});

app.post('/register', (req, res) => {

  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    let templateVars = { error: 'Please enter an email and password' };
    res.render('urls_register', templateVars);
  } else if (userCheck(users, req.body.email)) {
    res.status(400);
    let templateVars = { error: 'That email already exists.  Try logging in.', urls: urlDatabase, user: req.session["user_id"] };
    res.render('urls_register', templateVars);
  } else {

    let user = new Object;
    user.id = randomStringGenerator();
    user.email = req.body.email;
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    user.password = hashedPassword;
    users[user.id] = user;

    req.session['user_id'] = user.id;

    const filteredList = urlsForUserId(urlDatabase, req.session['user_id']);

    let templateVars = { error: null, urls: filteredList, user: user };

    res.render('urls_index', templateVars);
  }
});

//Login

app.get('/login', (req, res) => {

  let templateVars = { error: null };
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {

  if (!userCheck(users, req.body.email)) {
    let templateVars = { error: 'You need to register an account' };
    res.render('urls_register', templateVars);

  } else if (!bcrypt.compareSync(req.body.password, userCheck(users, req.body.email).password)) {
    let templateVars = { error: 'The email address or password is incorrect' };
    res.render('urls_login', templateVars);
  } else {

    let user = userCheck(users, req.body.email);

    const filteredList = urlsForUserId(urlDatabase, user.id);

    req.session['user_id'] = user.id;
    let templateVars = { error: null, urls: filteredList, user: user };
    res.render('urls_index', templateVars);
  }
});

//Logout

app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/login');
});

app.get('/urls', (req, res) => {

  if (typeof req.session['user_id'] === 'undefined') {

    res.redirect('/main');
  } else {
    const filteredList = urlsForUserId(urlDatabase, req.session['user_id']);
    let templateVars = { error: null, urls: filteredList, user: users[req.session["user_id"]] };
    res.render('urls_index', templateVars);
  }
});

app.get('/new', (req, res) => {
  if (typeof req.session['user_id'] === 'undefined') {
    let templateVars = { error: 'Please login to make a new tinyURL' };
    res.render('urls_login', templateVars);
  } else {

    let templateVars = { error: null, user: users[req.session["user_id"]] };

    res.render('urls_new', templateVars);
  }
});

app.post('/urls', (req, res) => {

  if (req.body.longURL === '') {
    let templateVars = { error: 'Please enter a URL' };
    res.render('urls_new', templateVars);

  } else {

    //modify urlDatabase here
    let shortURL;
    shortURL = randomStringGenerator();

    urlDatabase[shortURL] = new Object;
    urlDatabase[shortURL].longURL = req.body.longURL;
    urlDatabase[shortURL].id = req.session['user_id'];

    const filteredList = urlsForUserId(urlDatabase, req.session['user_id']);

    let templateVars = { error: null, urls: filteredList, user: users[req.session["user_id"]] };

    res.render('urls_index', templateVars);
  }
});

app.get('/urls/:shortURL', (req, res) => {

  if (typeof req.session['user_id'] === 'undefined') {
    let templateVars = { error: 'Please login to modify your URL', urls: urlDatabase };
    res.render('urls_index', templateVars);
  } else {

    let templateVars = { error: null, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session["user_id"]] };
    res.render('urls_show', templateVars);
  }
});

app.post('/urls/:shortURL', (req, res) => {

  const filteredList = urlsForUserId(urlDatabase, req.session['user_id']);

  urlDatabase[req.params.shortURL].longURL = req.body.longURL;

  let templateVars = { error: null, user: users[req.session['user_id']], urls: filteredList };

  res.render('urls_index', templateVars);
});

app.get('/u/:shortURL', (req, res) => {

  const longURL = urlDatabase[req.params.shortURL].longURL;

  res.redirect(longURL);
});

app.get('/urls/:shortURL', (req, res) => {

  // const filteredList = urlsForUserId(urlDatabase, req.session['user_id']);

  // let currentUserId = userCheck(urlDatabase, req.session['user_id'].email);


  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) => {


  if (req.session['user_id'] === 'undefined') {
    let templateVars = { error: 'You must be registered and logged in to edit or delete your own URL' };
    res.render('urls_index', templateVars);
  } else if (req.session['user_id'] !== urlDatabase[req.params.shortURL].id) {
    let templateVars = { error: 'You can only edit or delete your own URL' };
    res.render('urls_index', templateVars);

  } else {

    delete urlDatabase[req.params.shortURL];

    res.redirect('/main');
  }
});

app.get('/main', (req, res) => {


  let templateVars = { error: null, urls: urlDatabase, user: users[req.session['user_id']] };
  res.render('urls_main', templateVars);
});

app.post('/main', (req, res) => {

  let templateVars = { error: null, urls: urlDatabase };
  res.render('urls_main', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});
