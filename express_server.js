const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require('body-parser');

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

//generated random 6 character string
function generateRandomString() {
  let randomString = '';
  const alphanumericChoices = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let min = Math.ceil(0);
  let max = Math.floor(62);

  for (let i = 0; i < 6; i++) {
    randomString += alphanumericChoices[Math.floor(Math.random() * (max - min)) + min];
  }
  return randomString;
}

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", id: "hrdcdd" },
  "9sm5xK": { longURL: "http://www.google.com", id: "hrdcdd" }
};

// //user database 

const users = {};

// checks the users database for current users and returns user info if registered

const userCheck = function (users, email) {

  for (let id in users) {
    let user = users[id];
    if (email === user.email) {
      return user;
    }
  }
  return false;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//registration

app.get('/register', (req, res) => {
  let templateVars = { error: null }
  res.render('urls_register', templateVars);
})

app.post('/register', (req, res) => {

  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    let templateVars = { error: 'Please enter an email and password' }
    res.render('urls_register', templateVars);
  } else if (userCheck(users, req.body.email)) {
    res.status(400);
    let templateVars = { error: 'That email already exists.  Try logging in.', urls: urlDatabase, user: req.cookies["user_id"] }
    res.render('urls_register', templateVars);
  } else {

    userId = generateRandomString();

    let user = new Object;
    user.id = userId;
    user.email = req.body.email;
    user.password = req.body.password;

    users[userId] = user;
    res.cookie('user_id', user);
    res.redirect('/urls');
  }
});

//Login

app.get('/login', (req, res) => {
  let templateVars = { error: null }
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {

  if (!userCheck(users, req.body.email)) {
    let templateVars = { error: 'You need to register an account' };
    res.render('urls_register', templateVars);

  } else if (userCheck(users, req.body.email).password !== req.body.password) {
    let templateVars = { error: 'The email address or password is incorrect' };

    res.render('urls_login', templateVars)
  } else {
    let user = userCheck(users, req.body.email);
    let templateVars = { error: null, urls: urlDatabase, user: user }
    res.render('urls_index', templateVars);
  }
});

//Logout

app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/login');
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase, user: req.cookies["user_id"] };
  res.render('urls_index', templateVars);
});

app.get('/new', (req, res) => {

  if (typeof req.cookies['user_id'] === 'undefined') {
    let templateVars = { error: 'Please register or login to make a new tinyURL' }
    res.render('urls_login', templateVars);
  } else {
    let templateVars = { error: null, user: req.cookies["user_id"] }

    res.render('urls_new', templateVars);
  }
});

app.post('/urls', (req, res) => {
  // console.log(req.body.longURL);
  //fix this later
  if (req.body.longURL === '') {

    res.redirect('/new');
  }

  //modify urlDatabase here
  let shortURL;
  shortURL = generateRandomString();

  urlDatabase[shortURL] = new Object;
  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].userId = req.cookies['user_id'].id;
  console.log(urlDatabase);
  res.redirect('/urls');

});

app.get('/urls/:shortURL', (req, res) => {

  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: req.cookies["user_id"] };
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL', (req, res) => {

  urlDatabase[req.params.shortURL].longURL = req.body.longURL;

  res.redirect('/urls');
});

app.get('/u/:shortURL', (req, res) => {

  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.render(longURL);
});

app.get('/urls/:shortURL', (req, res) => {

  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) => {

  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});


//homepage
app.get('/', (req, res) => {
  res.send('Hello!');
});