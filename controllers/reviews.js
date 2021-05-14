//모델
const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
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
  }

  module.exports.deleteReview = async (req, res)=>{
    //$pull
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull:{reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`);
  }