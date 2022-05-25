if(process.env.NODE_ENV !=="production"){
    require('dotenv').config();
}
require('dotenv').config();

const express = require('express');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const flash = require('connect-flash');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");

const User = require('./models/user');

const expressError = require('./Utils/ExpressError');

// routes
const userRoute = require('./routes/users');
const campgroundRoute = require('./routes/campgrounds');
const reviewRoute = require('./routes/reviews');

const mongoose = require('mongoose');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'; 
// const dbUrl = 'mongodb://localhost:27017/yelp-camp';
// 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl)
    .then( () => {
        console.log('MONGO CONNECTION')
    })
    .catch( error => {
        console.log('OH NO MONGO ERROR');
        console.log(error)
    })


const app = express();

app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
app.engine('ejs',ejsMate);

app.use(express.urlencoded({ extended:true }));
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,'public')));

const secret = process.env.SECRET || 'thisshouldbebettersecret';

const store = new MongoStore({
    mongoUrl:dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
})
store.on("error",function(e){
    console.log("SESSTION STORE ERROR!",e);
})

const sess = {
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie:{
        name:'session',
        httpOnly:true,
        // secure:true,
        expires:Date.now() + 1000 * 60 * 60 * 24 * 7,       // 유효기간 - 7days
        maxAge:1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sess));
app.use(flash());
app.use(helmet());

passport.use(new LocalStrategy(User.authenticate()));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(mongoSanitize({
    replaceWith: '_',
  }));

// 연결할 mapbox api,fontawesome,google font ... 의 url 정의
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
// helmet의 컨텐츠 보안 정책 사용하기 
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dl2dxsf1w/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);
app.use((req,res,next)=>{
    // net::ERR_BLOCKED_BY_RESPONSE.NotSameOriginAfterDefaultedToSameOriginByCoep 20
    // 오류 해결 
    res.header("Cross-Origin-Embedder-Policy", "credentialless");
    res.header("Cross-Origin-Opener-Policy", "same-origin");
    // 모든탬플릿에서 접근가능하도록
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// make fakeuser information
app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'aaa@gmail.com', username: "aaa" });
    const newUser = await User.register(user,'chicken');
    res.send(newUser);
})

app.use('/',userRoute);
app.use('/campgrounds',campgroundRoute);
app.use('/campgrounds/:id/reviews',reviewRoute);

app.get('/',(req,res) => {
    res.render('home')
})

app.all('*', (req,res,next) => {
    next(new expressError('Page Not Found',404));
})


app.use((err,req,res,next) => {
    const { status=500 } = err;
    if (!err.message) err.message='Something is wrong!!!'
    res.status(status).render('error',{ err });
})

const port = process.env.PORT || 3000;

app.listen(port,() => {
    console.log(`App is listening on PORT ${port}`)
})