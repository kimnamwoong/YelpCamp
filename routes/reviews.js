const express = require('express');
const router = express.Router({mergeParams:true});

const catchAsync = require('../Utils/catchAsync');
const ExpressError = require('../Utils/ExpressError');

const CampGround = require('../models/Campground');
const Review = require('../models/review');

const { validateReview,isLoggedIn,isReviewAuthor } = require('../middleware');

const reviews = require('../controllers/reviews');  // add controller

// add review route 
router.post('/',isLoggedIn,validateReview,catchAsync(reviews.createReview));

// delete review route 
router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(reviews.deleteReview));

module.exports = router