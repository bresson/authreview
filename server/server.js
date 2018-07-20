//npm modules
const express = require('express');
const uuid = require('uuid/v4')
const session = require('express-session')
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const axios = require('axios');
const bcrypt = require('bcrypt-nodejs');

// create the server
const app = express();


app.use(function (req, res, next) {
  console.log('Time:', Date.now())
  console.log('app middleware before passport')
  next()
})

// configure passport.js to use the local strategy
/**
   The local strategy uses a username and password to authenticate a user; however, our application uses an email address instead of a username, so we just alias the username field as ‘email’.
 */
// configure passport.js to use the local strategy
passport.use(new LocalStrategy(
    { usernameField: 'email' },
    (email, password, done) => {
      axios.get(`http://localhost:5000/users?email=${email}`)
      .then(res => {
        const user = res.data[0]
        if (!user) {
          return done(null, false, { message: 'Invalid credentials.\n' });
        }
        if (!bcrypt.compareSync(password, user.password)) {
          return done(null, false, { message: 'Invalid credentials.\n' });
        }
        return done(null, user);
      })
      .catch(error => done(error));
    }
  ));

app.use(function (req, res, next) {
  console.log('Time:', Date.now())
  console.log('app middleware after passport')
  next()
})

// tell passport how to serialize the user
passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser((id, done) => {
    axios.get(`http://localhost:5000/users/${id}`)
    .then(res => done(null, res.data) )
    .catch(error => done(error, false))
  });

// add & configure middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
// I had the same problem and I was able to fix it by chmod +x sessions
app.use(session({
  genid: (req) => {
    console.log('Inside session middleware genid function')
    console.log(`Request object sessionID from client: ${req.sessionID}`)
    return uuid() // use UUIDs for session IDs
  },
  store: new FileStore(),
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());

// create the homepage route at '/'
app.get('/', (req, res) => {
  console.log('Inside the homepage callback')
  console.log(req.sessionID)
  res.send(`You got home page!\-------------\n`)
})

// create the login get and post routes
app.get('/login', (req, res) => {
  console.log('Inside GET /login callback')
  console.log(req.sessionID)
  res.send(`You got the login page!-------------\n`)
})

/**
 * Custom passport authentcate() callback
 * http://www.passportjs.org/docs/authenticate/
  This example, note that authenticate() is called from within the route handler
  rather than being used as route middleware. This gives the callback access
  to the req and res objects through closure.

  If authentication failed, user will be set to false. If an exception occurred, err will be set. An optional info argument will be passed, containing additional details provided by the strategy's verify callback.

  The callback can use the arguments supplied to handle the authentication result as desired. Note that when using a custom callback, it becomes the application's responsibility to establish a session (by calling req.login()) and send a response.

______________

  After the done() [in Passport.LocalStartegy] method is called, we hop into to the passport.authenticate() callback function, where we pass the user object into the req.login() function (remember, the call to passport.authenticate() added the login() function to our request object). The req.login() function handles serializing the user id to the session store and inside our request object and also adds the user object to our request object.
 */
app.post('/login', (req, res, next) => {
  console.log('Inside POST /login callback')
  // 'local' is passed to Passport.LocalStrategy which call (err, user, info) on the callback 
  // how does err work with done() from Passport.LocalStartegy? since Passport.LocalStartegy has an 'else' if failed authentication
  passport.authenticate('local', (err, user, info) => {
    if(info) {return res.send(info.message)}
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.login(user, (err) => {
      if (err) { return next(err); }
      return res.redirect('/authrequired');
    })
  })(req, res, next);
})

app.get('/authrequired', (req, res) => {
  console.log('Inside GET /authrequired callback')
  console.log(`User authenticated? ${req.isAuthenticated()}`)
  if(req.isAuthenticated()) {
    res.send('you hit the authentication endpoint\n')
  } else {
    res.redirect('/')
  }
})

// tell the server what port to listen on
app.listen(3000, () => {
  console.log('Listening on localhost:3000')
})