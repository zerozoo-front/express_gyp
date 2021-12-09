const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, 'uploads/');
    },
    filename(req, file, done) {
      const name = file.originalname;
      const ext = path.extname(name);
      done(null, path.basename(name, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024 },
});
try {
  fs.readdirSync('uploads');
} catch (error) {
  console.log('no uploads dir make it');
  fs.mkdirSync('uploads');
}

dotenv.config();
const app = express();
app.set('port', process.env.PORT || 3000);

// app.use(morgan('dev'));
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    morgan('combined')(req, res, next);
    console.log('here!');
  } else morgan('dev')(req, res, next);
});
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
    name: 'session-cookie',
  })
);

app.use((req, res, next) => {
  console.log('fire at any event');
  console.log('req: ', req.sessionID);
  req.session.name = 'zerozoo';
  req.data = 'hello next middleware?';
  console.log('session check', req.session);

  next();
});
app.use((req, res, next) => {
  console.log('req.data', req.data);
  next();
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/multipart.html'));
});
app.post('/upload', upload.single('image'), (req, res) => {
  console.log(req.file, req.body);
  res.send('ok');
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'));
});
