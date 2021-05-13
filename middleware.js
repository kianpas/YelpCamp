const {campgroundSchema, reviewSchema} = require("./schemas.js");
const ExpressError =require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    //store the url theu are requesting
    req.flash("error", "you must be signed in first");
    return res.redirect("/login");
  }
  next();
};

//joi 유효성, 모든 라우트에 쓸 것이 아니므로 use 미사용함
module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

//권한 여부
module.exports.isAuthor = async(req, res, next)=>{
const { id } = req.params;
const campground = await Campground.findById(id);
   //로그인, 수정 여부
   if(!campground.author.equals(req.user._id)){
    req.flash('error', 'You do not have permission to do that!')
    return res.redirect(`/campgrounds/${id}`)
  }
  next();
}


//댓글 권한 여부
module.exports.isReviewAuthor = async(req, res, next)=>{
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
     //로그인, 수정 여부
     if(!review.author.equals(req.user._id)){
      req.flash('error', 'You do not have permission to do that!')
      return res.redirect(`/campgrounds/${id}`)
    }
    next();
  }

//리뷰 유효성 검사
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};