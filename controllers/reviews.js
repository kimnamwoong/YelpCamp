const CampGround = require('../models/Campground');
const Review = require('../models/review');

module.exports.createReview = async(req,res)=> {
    const campground = await CampGround.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success','Successfully made a new review')
    res.redirect(`/campGrounds/${campground._id}`);
}

module.exports.deleteReview = async(req,res)=> {
    const { id,reviewId } = req.params;
    await CampGround.findByIdAndUpdate(id,{ $pull:{ reviews:reviewId }});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully delete review')
    res.redirect(`/campGrounds/${id}`)
}