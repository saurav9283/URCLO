require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors");
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const bodyParser = require('body-parser');
const UserRouter = require('./routes/User/userAuth/auth.router.js');
const UserCartRouter = require('./routes/User/UserCart/user.cart.router.js');
const ProviderRouter = require('./routes/Provider/providerAuth/providerAuth.router.js');
const UserNoifyRouter = require('./routes/User/userNotification/user.notification.router.js');
const userMasterCatRouter = require('./routes/User/userService/user.service.router.js');
const ProviderOdditRouter = require('./routes/Provider/providerOddit/provider.oddit.router.js');

var app = express();
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static(path.join(__dirname, 'public/images')));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/user-auth', UserRouter);
app.use('/api/checkout/cart' , UserCartRouter);
app.use('/api', UserNoifyRouter);
app.use('/api/provider-auth', ProviderRouter);
app.use('/api/provider', ProviderOdditRouter);
app.use('/api/get/mastercat', userMasterCatRouter);

app.get('/api', (req, res) => {
  res.send("Api is working fine")
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})

module.exports = app;