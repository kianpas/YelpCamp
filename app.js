const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");


const campgrounds = require("./routes/campgrounds")
const reviews = require("./routes/reviews")

//몽구스 연결
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
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




//캠프그라운드로 시작하는 모든 라우트
app.use("/campgrounds", campgrounds);
//리뷰 라우트
app.use('/campgrounds/:id/reviews', reviews)


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
