if(process.env.NODE_ENV !== "production"){
  require('dotenv').config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require('express-session')
const flash = require('connect-flash');
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require("./models/user");
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

//라우팅모델
const userRoutes = require('./routes/users');
const campgroundRoutes = require("./routes/campgrounds")
const reviewRoutes = require("./routes/reviews")

const MongoStore = require("connect-mongo");

const dbUrl = process.env.DB_URL||"mongodb://localhost:27017/yelp-camp";

//몽구스 연결
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify:false
});

//db연결 확인
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  
  console.log("Database connected");
});

const app = express();

//익스프레스세팅
//ejsmate
app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


//use
//포스트로 보낸 값을 파싱함
app.use(express.urlencoded({ extended: true }));
//메소드 오버라이딩
app.use(methodOverride("_method"));
//퍼블릭 폴더
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize());

const secret = process.env.SECRET || 'thisshouldbeabettersecret';

const store = MongoStore.create({
  mongoUrl:dbUrl,
  touchAfter:24*60*60,
  crypto:{
    secret
  }
})

store.on("error", function (e) {
  console.log("session store error", e);
  })

//익스프레스 세션
const sessionConfig = {
  store,
  name:'session',
  secret,
  resave:false,
  saveUninitialized:true,
  cookie:{
    //httponly 설정
    httpOnly:true,
    //secure:true,
    //쿠키 생존 기간 설정
    expires:Date.now()+1000 * 60 * 60 * 24 *7,
    maxAge: 1000 * 60 * 60 * 24 *7
  }
}
app.use(session(sessionConfig))
app.use(flash());
app.use(helmet());

//헬멧 설정
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/",
  
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
  
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
      directives: {
          defaultSrc: [],
          connectSrc: ["'self'", ...connectSrcUrls],
          scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
          styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          workerSrc: ["'self'", "blob:"],
          objectSrc: [],
          imgSrc: [
              "'self'",
              "blob:",
              "data:",
              "https://res.cloudinary.com/dasyrpts0/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
              "https://images.unsplash.com/",
          ],
          fontSrc: ["'self'", ...fontSrcUrls],
      },
  })
);

//패스포트
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//모든 리퀘스트에 플래시
app.use((req, res, next)=>{
  //로그인 여부에 따른 페이지 이동
  if(!['/login','/register', '/'].includes(req.originalUrl)){
    req.session.returnTo = req.originalUrl;
  }
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error')
  next();
})


//캠프그라운드로 시작하는 모든 라우트
app.use("/campgrounds", campgroundRoutes);
//리뷰 라우트
app.use('/campgrounds/:id/reviews', reviewRoutes)
//유저 라우트
app.use('/', userRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No Something Went Wrong!";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
