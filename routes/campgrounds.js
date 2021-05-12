const express = require('express');
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { campgroundSchema} = require("../schemas.js");
//isLoggedIn만 가져오도록 한것
const {isLoggedIn} = require('../middleware');

const ExpressError = require("../utils/ExpressError");
//모델
const Campground = require("../models/campground");

//joi 유효성, 모든 라우트에 쓸 것이 아니므로 use 미사용함
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(msg, 400);
    } else {
      next();
    }
  };


//인덱스
router.get(
    "/",
    catchAsync(async (req, res) => {
      const campgrounds = await Campground.find({});
      res.render("campgrounds/index", { campgrounds });
    })
  );
  
  //추가 페이지
  router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
  });
  
  //db에 추가
  router.post(
    "/", isLoggedIn,
    //위에서 정의한 joi 
    validateCampground,
    catchAsync(async (req, res, next) => {
      //폼이 비어있을 경우 에러 던짐
      // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
      const campground = new Campground(req.body.campground);
      await campground.save();
      req.flash('success', "Successfully made a new campground")
      res.redirect(`/campgrounds/${campground._id}`);
    })
  );
  
  //id로 페이지 뷰
  router.get(
    "/:id", 
    catchAsync(async (req, res) => {
      //populated로 리뷰참조
      const campground = await Campground.findById(req.params.id).populate(
        "reviews"
      );
      if(!campground){
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds');
      }
      res.render("campgrounds/show", { campground});
    })
  );
  
  //에딧페이지 가져오기
  router.get(
    "/:id/edit", isLoggedIn,
    catchAsync(async (req, res) => {
      const campground = await Campground.findById(req.params.id);
      res.render("campgrounds/edit", { campground });
    })
  );
  
  //db 업데이트
  router.put(
    "/:id", isLoggedIn,
    validateCampground,
    catchAsync(async (req, res) => {
      const { id } = req.params;
      const campground = await Campground.findByIdAndUpdate(id, {
        ...req.body.campground,
      });
      req.flash('success', "Successfully updated campground")
      res.redirect(`/campgrounds/${campground._id}`);
    })
  );
  
  //삭제
  router.delete(
    "/:id", isLoggedIn,
    catchAsync(async (req, res) => {
      const { id } = req.params;
      await Campground.findByIdAndDelete(id);
      req.flash('success', 'Successfully deleted campground')
      res.redirect("/campgrounds");
    })
  );

  module.exports = router;