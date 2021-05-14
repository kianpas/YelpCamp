const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

//모델
const Campground = require("../models/campground");

router
  .route("/")
  //인덱스
  .get(catchAsync(campgrounds.index))
  //db에 추가
  .post(
    isLoggedIn,
    upload.array("image"),
    //위에서 정의한 joi
    validateCampground,
    catchAsync(campgrounds.createCampground)
  );

//추가 페이지
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  //id로 페이지 뷰
  .get(catchAsync(campgrounds.showCampground))
  //db 업데이트
  .put(
    isLoggedIn,
    isAuthor,
    upload.array('image'),
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  )
  //삭제
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

//에딧페이지 가져오기
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
