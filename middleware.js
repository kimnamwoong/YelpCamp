const CampGround = require('./models/Campground');
const Review = require('./models/review');
const { campgroundSchema,reviewSchema } = require('./schemas');
const ExpressError = require('./Utils/ExpressError');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;     // 로그인 하지 않은 사용자가 로그인 직전에 요청한 경로
        req.flash('error', 'You must be login');
        return res.redirect('/login');
    } else {
        next();
    }
}

// data 유효성검사
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(element => element.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
// review data 유효성검사
module.exports.validateReview = (req,res,next)=> {
    const { error } = reviewSchema.validate(req.body);
    if (error){
        const msg = error.details.map(element=>element.message).join(',')
        throw new ExpressError(msg,400)
    } else{
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const foundCamp = await CampGround.findById(id);

    if (!foundCamp.author.equals(req.user._id)) {
        req.flash('error', "You don't have permission to do that");
        return res.redirect(`/campGrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id,reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review.author.equals(req.user._id)) {
        req.flash('error', "You don't have permission to do that");
        return res.redirect(`/campGrounds/${id}`);
    }
    next();
}