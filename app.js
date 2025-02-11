require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var http = require('http');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var jwt = require('jsonwebtoken');
var cors = require("cors");
const socketIO = require('socket.io');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const bodyParser = require('body-parser');
const SubProviderRouter = require('./routes/Provider/sub-provider/sub-provider.router.js');
const UserBuyerRouter = require('./routes/User/userBuyer/user.buyer.router.js');
const UserRouter = require('./routes/User/userAuth/auth.router.js');
const UserCartRouter = require('./routes/User/UserCart/user.cart.router.js');
const ProviderRouter = require('./routes/Provider/providerAuth/providerAuth.router.js');
const UserNoifyRouter = require('./routes/User/userNotification/user.notification.router.js');
const userMasterCatRouter = require('./routes/User/userService/user.service.router.js');
const ProviderOdditRouter = require('./routes/Provider/providerOddit/provider.oddit.router.js');
const ProviderNotificationRouter = require('./routes/Provider/providerNotify/provider.notify.router.js');

var app = express();
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  }
})

app.set('io', io);


app.use(cors("*"));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static(path.join(__dirname, 'public/images')));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

io.use((socket, next) => {
  const token = socket.handshake.query.providerid;
  // console.log('socket.handshake: ', socket.handshake);
  console.log(token, "token");

  if (!token) {
    return next(new Error("Authentication error"));
  }

    socket.userId = token;
    next();



  // jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
  //   if (err) {
  //     return next(new Error("Authentication error"));
  //   }
    
  //   // Successfully authenticated
  //   console.log('decoded: ', decoded);
  //   socket.userId = decoded.provider.id;
  //   console.log(socket.userId, "id of user");
  //   next();
  // });
});

io.on('connection', (socket) => {
  console.log('A client connected:', socket.userId);
  const userId = socket.userId;
  console.log(userId, "userId");

  // socket.user = userId;

  socket.join(userId.toString());

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.userId);
  });
});

// app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/api/user-auth', UserRouter);
app.use('/api/user', UserBuyerRouter);
app.use('/api/checkout/cart', UserCartRouter);
app.use('/api', UserNoifyRouter);
app.use('/api/provider-auth', ProviderRouter);
app.use('/api/provider/sms', ProviderNotificationRouter);
app.use('/api/provider', ProviderOdditRouter);
app.use('/api/sub-provider', SubProviderRouter)
app.use('/api/get/mastercat', userMasterCatRouter);

app.get('/api', (req, res) => {
  res.send("Api is working fine")
})
app.use(express.static(path.join(__dirname, "build")));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/*", function (req, res) {
  // console.log("HEREEE");
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
const PORT = "4956";
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})

module.exports = app;