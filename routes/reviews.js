const express = require('express');
const router = express.Router({mergeParams:true});

//모델
const Campground = require("../models/campground");
const Review = require("../models/review");

const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');

const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");



//리뷰
router.post(
    "/", isLoggedIn,
    validateReview,
    catchAsync(async (req, res) => {
      //아이디 일치하는 캠프 하나
      const campground = await Campground.findById(req.params.id);
      //폼으로 넘어온 리뷰
      const review = new Review(req.body.review);
      review.author = req.user._id;
      //캠프그라운드 모델 reviews에 저장
      campground.reviews.push(review);
      //긱 저장
      await review.save();
      await campground.save();
      req.flash('success', 'Created new review')
      res.redirect(`/campgrounds/${campground._id}`);
    })
  );
  
  //리뷰 삭제
  router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res)=>{
    //$pull
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull:{reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`);
  }))
  
  module.exports = router;