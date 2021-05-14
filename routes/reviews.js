const express = require("express");
const router = express.Router({ mergeParams: true });

//모델
const Campground = require("../models/campground");
const Review = require("../models/review");

const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");

//컨트롤러
const reviews = require("../controllers/reviews");

//리뷰
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

//리뷰 삭제
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
