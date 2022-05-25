const CampGround = require('../models/Campground');
const cloudinary = require('../cloudinary');

const mbxStyles = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxStyles({ accessToken: mapBoxToken });

// show all campgrounds
module.exports.index = async (req, res) => {
    const campGrounds = await CampGround.find({});
    res.render('campGrounds/index', { campGrounds })
}
// render add form
module.exports.renderNewForm = (req, res) => {
    res.render('campGrounds/new')
}
// 입력폼 작성 후 제출 -> 캠핑장 새로 추가
module.exports.createCampground = async (req, res, next) => {
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit:1
    }).send();
    
    const campground = new CampGround(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.author = req.user._id;
    campground.images = req.files.map(f=> ({url:f.path,filename:f.filename}));
    await campground.save();
    req.flash('success', 'Successfully made a new campground')
    res.redirect(`campGrounds/${campground._id}`)
}
// 특정 캠핑장 정보 표시
module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const foundCamp = await CampGround.findById(id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author'); //리뷰,유저 db와 관계설정 후 필요정보 연결
    if (!foundCamp) {
        req.flash('error', 'Cannot find the campgrond');
        return res.redirect('/campGrounds');
    }
    res.render('campGrounds/show', { foundCamp })
}
// render 캠핑장 수정 폼 
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const foundCamp = await CampGround.findById(id)
    if (!foundCamp) {
        req.flash('error', 'Cannot find the campgrond');
        return res.redirect('/campGrounds');
    }
    res.render('campGrounds/edit', { foundCamp })
}
// 수정사항 입력 폼 제출 -> 캠핑장정보 업데이트 됨
module.exports.editCampground = async (req, res) => {
    // const { id } = req.params;
    // const foundCamp = await CampGround.findByIdAndUpdate(id, { ...req.body.campground })
    // const imgs = req.files.map(f => ({url:f.path,filename:f.filename}));
    // console.log(req.body.deleteImages);
    // foundCamp.images.push(...imgs);
    // await foundCamp.save();
    // if(req.body.deleteImages){  //삭제할 이미지가 있는 경우
    //     console.log("dddddddddd");
    //     await foundCamp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    //     for(let img of foundCamp.images){
    //         console.log(img);
    //     }
    // }
    // req.flash('success', 'Successfully edit campground')
    // res.redirect(`/campGrounds/${foundCamp._id}`)

     const { id } = req.params;
    console.log(req.body);
    const foundCamp = await CampGround.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    foundCamp.images.push(...imgs);
    await foundCamp.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await foundCamp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${foundCamp._id}`)
}
// delete campground
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await CampGround.findByIdAndDelete(id);
    req.flash('success', 'Successfully delete campground');
    res.redirect('/campGrounds');
}