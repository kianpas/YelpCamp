const express = require('express');
const router = express.Router();

//모델
const Campground = require("../models/campground");

const { campgroundSchema} = require("../schemas.js");

const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");

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
  router.get("/new", (req, res) => {
    //const campground = Campground.findById(req.params.id);
    res.render("campgrounds/new");
  });
  
  //db에 추가
  router.post(
    "/",
    //위에서 정의한 joi
    validateCampground,
    catchAsync(async (req, res) => {
      //폼이 비어있을 경우 에러 던짐
      // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
      const campground = new Campground(req.body.campground);
      await campground.save();
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
      res.render("campgrounds/show", { campground });
    })
  );
  
  //에딧페이지 가져오기
  router.get(
    "/:id/edit",
    catchAsync(async (req, res) => {
      const campground = await Campground.findById(req.params.id);
      res.render("campgrounds/edit", { campground });
    })
  );
  
  //db 업데이트
  router.put(
    "/:id",
    validateCampground,
    catchAsync(async (req, res) => {
      const { id } = req.params;
      const campground = await Campground.findByIdAndUpdate(id, {
        ...req.body.campground,
      });
      res.redirect(`/campgrounds/${campground._id}`);
    })
  );
  
  //삭제
  router.delete(
    "/:id",
    catchAsync(async (req, res) => {
      const { id } = req.params;
      await Campground.findByIdAndDelete(id);
      res.redirect("/campgrounds");
    })
  );

  module.exports = router;