const express = require('express');
const router = express.Router();

//Bring in Article Models
let Article = require('../models/article');
//Bring in User Models
let User = require('../models/user');



//Add Route
router.get('/add', ensureAuthenticated, async (req, res) => {
    res.render('add_article', {
        title: 'Add Article'
    });
});

// Add article- POST Route
router.post('/add', function (req, res) {
    req.checkBody('title', 'Title is required').notEmpty();
    //req.checkBody('author', 'Author is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();
    //Get errors
    const errors = req.validationErrors(req);
    if (errors) {
        res.render('add_article', {
            title: 'Add Article',
            errors: errors
        });
    } else {
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;

        article.save((err) => {
            if (err) {
                console.log(err);
                return;
            } else {
                req.flash('success', 'Article Added');
                res.redirect('/');
            }
        });
    }

});

//Load edit Form
router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        if (article.author != req.user._id) {
            req.flash('danger', 'Not Authorized');
            res.redirect('/');
        }
        res.render('edit_article', {
            title: 'Edit Article',
            article: article
        });
    });
}
);

//Update Submit POST Route
router.post('/edit/:id', (req, res) => {
    //submitting to db
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;
    let query = { _id: req.params.id }
    Article.updateOne(query, article, function (err) {
        if (err) {
            console.log(err);
            return;

        } else {
            req.flash('success', 'Article Updated');
            res.redirect('/');
        }
    });
});

//Delete
router.delete('/:id', (req, res) => {
    if (!req.user._id) {
        res.status(500).send();
    }
    let query = { _id: req.params.id }
    Article.findById(req.params.id, function (err, article) {
        if (article.author != req.user._id) {
            res.status(500).send();
        } else {
            Article.deleteOne(query, err => {
                if (err) {
                    console.log(err);
                }
                res.send('Success');
            });
        }
    });
});

//Get Single Article
router.get('/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        User.findById(article.author, function (err, user) {
            res.render('article', {
                article: article,
                author: user.name
            });
        });
    });
});

// Access Control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}
module.exports = router;
