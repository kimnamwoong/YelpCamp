const express = require('express');
const router = express.Router();

const catchAsync = require('../Utils/catchAsync');
const ExpressError = require('../Utils/ExpressError');

const CampGround = require('../models/Campground');

const { isLoggedIn,validateCampground,isAuthor } = require('../middleware');

const campgrounds = require('../controllers/campgrounds');      // add controllers

const {storage} = require('../cloudinary/');
const multer  = require('multer');
const upload = multer({ storage});

router.route('/')
    .get(campgrounds.index)     // show all campgrounds route   
    .post(isLoggedIn, upload.array('campground[img]'),validateCampground,catchAsync(campgrounds.createCampground));    // add new campground route

// add camp
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))    // show campground 특정 캠핑장 표시
    .put(isLoggedIn, isAuthor, upload.array('campground[img]'),validateCampground,catchAsync(campgrounds.editCampground)) // edit campground 
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));    // delete campground

// render update form 
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router