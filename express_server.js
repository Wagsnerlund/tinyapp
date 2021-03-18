const { request, response } = require('express');
const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "user1": {
    id: "user1ID",
    email: "user1@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2": {
    id: "user2ID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const generateRandomString = function () {
  return Math.random().toString(36).slice(2, 8);
};

const getUser = function (pEmail) {
  for (const user in users) {
    if (users[user].email === pEmail) {
      return users[user];
    }
  }
  return undefined;
};

const emailExists = function (pEmail) {
  for (const user in users) {
    console.log(users[user].email);
    if (users[user].email === pEmail) {
      return true;
    }
  }
  return false;
};

console.log(emailExists());


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

// app.get('/', (request, response) => {
//   response.send('Hello!');
// });

// app.get('/urls.json', (request, response) => {
//   response.json(urlDatabase);
// });

app.get('/urls', (request, response) => {
  const templateVars = { urls: urlDatabase, user: users[request.cookies["user_id"]] };
  response.render('urls_index', templateVars);
});

app.get('/urls/new', (request, response) => {
  response.render('urls_new', { user: users[request.cookies["user_id"]] });
});

app.get('/urls/:shortURL', (request, response) => {
  const shortURL = request.params.shortURL;
  const longURL = urlDatabase[request.params.shortURL];
  const templateVars = { shortURL, longURL, user: users[request.cookies["user_id"]] };
  response.render('urls_show', templateVars);
});

app.get("/register", (request, response) => {
  const templateVars = { user: users[request.cookies["user_id"]] };
  response.render('register', templateVars);
});

app.get("/login", (request, response) => {
  const templateVars = { user: users[request.cookies["user_id"]] };
  response.render('login', templateVars);
});

app.get("/u/:shortURL", (request, response) => {
  const longURL = urlDatabase[request.params.shortURL];
  response.redirect(longURL);
});

// app.get('/hello', (request, response) => {
//   response.send('<html><body>Hello <b>World</b></body></html>\n');
// });

app.post('/urls', (request, response) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = request.body.longURL;
  response.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (request, response) => {
  const url = request.params.shortURL
  delete urlDatabase[url];
  response.redirect('/urls');
});

app.post('/urls/:shortURL/edit', (request, response) => {
  urlDatabase[request.params.shortURL] = request.body.longURL;
  response.redirect(`/urls`);
});

app.post('/urls/:id', (request, response) => {
  const url = request.params.id
  response.redirect(`/urls/${url}`);
});

app.post('/login', (request, response) => {
  const email = request.body.email;
  const password = request.body.password;
  if (!email || !password) {
    response.send('400: You cannot leave the email/password fields empty.');
  } else if (emailExists(email) === false) {
    response.send('403: User does not exist!')
  } else {
    const user = getUser(email);
    if (user.password !== password) {
      response.send('403: invalid credentials.')
    } else {
      response.cookie('user_id', user.id);
      response.redirect('/urls');
    }
  }
});

app.post('/logout', (request, response) => {
  response.clearCookie('user_id');
  response.redirect('/urls');
});

app.post('/register', (request, response) => {
  let userID = generateRandomString();
  const email = request.body.email;
  const password = request.body.password;
  if (!email || !password) {
    response.send('400: You cannot leave the email/password fields empty.');
    // } else if (users, 'email', email) {
  } else if (emailExists(email) === true) {
    response.send('400: Email address already exists!')
  } else {
    users[userID] = { id: userID, email: email, password: password }
    response.cookie('user_id', userID);
    response.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});