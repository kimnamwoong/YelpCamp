const mongoose = require('mongoose');
const Review = require('./review');

const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url:String,
    filename:String
})

// https://res.cloudinary.com/dl2dxsf1w/image/upload/w_300/v1649144088/YelpCamp/tuil9kqug8myttfwvufy.jpg
ImageSchema.virtual('thumnail').get(function(){
    return this.url.replace('/upload','/upload/w_300');
})

const opts = { toJSON: { virtuals: true } };

const CampGroundSchema = new Schema({
    title:String,
    images:[ImageSchema],
    geometry: {
        type: {
          type: String, 
          enum: ['Point'], 
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
    },
    price:Number,
    description:String,
    location:String,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review"
        }
    ]
}, opts);


CampGroundSchema.virtual('properties.popupText').get(function(){
    const popupText = `<a href="/campgrounds/${this._id}">${this.title}</a><p>${this.description.substring(0,20)}</p>`;

    return popupText;
})

CampGroundSchema.post('findOneAndDelete',async function(doc){
    if(doc){
        await Review.deleteMany({
            _id:{
                $in:doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('CampGround',CampGroundSchema);
