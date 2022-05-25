const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then( () => {
        console.log('MONGO CONNECTION')
    })
    .catch( error => {
        console.log('OH NO MONGO ERROR');
        console.log(error)
    })
    
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 100; i++) {
        const randomCities = Math.floor(Math.random() * 62);
        const price = (Math.floor(Math.random() * 20)+10)*1000;
        const camp = new Campground({
            // My user ID
            author: "62457f733d031c812e249361",
            location: `${cities[randomCities].city}, ${cities[randomCities].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque quos dicta veniam provident ullam aperiam, soluta corporis blanditiis hic dolorum magnam assumenda eos quidem, possimus tenetur. Minus soluta magni fuga.",
            price,
            geometry : {
                type : "Point", 
                coordinates : [ 
                    cities[randomCities].longitude, 
                    cities[randomCities].latitude 
                ] 
            },
            images: [
                {
                    url:'https://res.cloudinary.com/dl2dxsf1w/image/upload/v1649239758/YelpCamp/d9imtoxnijcn5owfqyka.jpg',
                    filename:'YelpCamp/d9imtoxnijcn5owfqyka'
                },
                {
                    url: 'https://res.cloudinary.com/dl2dxsf1w/image/upload/v1649137627/YelpCamp/rmarrgjvqex3sqgt0hgi.jpg',
                    filename: 'YelpCamp/rmarrgjvqex3sqgt0hgi'
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})