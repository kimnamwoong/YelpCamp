const User = require('../models/user');

module.exports.renderRegister =(req, res) => {
    res.render('users/register');
}

module.exports.createUser = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registerUser = await User.register(user, password);
        req.login(registerUser, err => {
            if (err) next(err);
            req.flash('success', 'Welcome to yelp-camp!!');
            res.redirect('/campGrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back');
    const redirectUrl = req.session.returnTo || '/campGrounds';
    delete req.session.returnTo;    // url 세션은 계속 사용할게 아니니 제거!!
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logOut();
    req.flash('success', 'Log out success');
    res.redirect('campGrounds');
}