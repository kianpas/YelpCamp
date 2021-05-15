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
const mongoSanitize = require('express-mongo-sanitize');

//라우팅모델
const userRoutes = require('./routes/users');
const campgroundRoutes = require("./routes/campgrounds")
const reviewRoutes = require("./routes/reviews")

//몽구스 연결
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
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

//익스프레스 세션
const sessionConfig = {
  secret:'thisshouldbeabettersecret',
  resave:false,
  saveUninitialized:true,
  cookie:{
    //httponly 설정
    httpOnly:true,
    //쿠키 생존 기간 설정
    expires:Date.now()+1000 * 60 * 60 * 24 *7,
    maxAge: 1000 * 60 * 60 * 24 *7
  }
}
app.use(session(sessionConfig))
app.use(flash());

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
