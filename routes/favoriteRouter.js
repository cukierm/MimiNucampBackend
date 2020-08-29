const express = require('express');
const cors = require('./cors');
const authenticate = require('../authenticate');
const Favorite = require('../models/favorite');
const user = require('../models/user');
const Campsite = require('../models/campsite');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus = 200)
.get(cors.cors,  authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id}) 
    .populate('user')
    .populate('campsites')
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    })
    .catch(err => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user_id})
    .then(favorite => {
        if(favorite) {
            console.log(`there is an existing favorite with user._id ${req.user_id}`)
            req.body.campsites.forEach( campsite => {
                if(!favorite.campsites.includes(campsite._id)) {
                    console.log(`the campsite ${campsite.id} already exists`);
                    favorite.campsites.push(campsite._id);
                }
            });
        } else {
            Favorite.create({
                user: req.user._id,
                campsites: req.body
            })
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
        }
    })
    .catch(err => next(err))
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites')
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if(favorite) {
        favorite.remove()
        .then(favorite => {
            res.statusCode = 200; 
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        })
        .catch(err => next(err))
    }   else {
            res.send('No favorites to delete')
        }
    })
    .catch(err => next(err));
})


favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => res.sendStatus = 200)
.get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})  
    .then(favorite => {
        if(favorite) {
            if(!favorite.campsites.includes(req.params.campsiteId)) {
                favorite.campsites.push(req.params.campsiteId)
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200; 
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(error))
            } else {
                res.send("That campsite is already in the list of favorites!")
            }
        } else {
            Favorite.create({
                user: req.user._id,
                campsites: [req.params.campsiteId]
            })
            .then(favorite => {
                res.statusCode = 200; 
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(error))
        }
    })
    .catch(err => next(err))
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`)
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if(favorite) {
            let index = favorite.campsites.indexOf(req.params.campsiteId)
            if (index !== -1) {
                favorite.campsites.splice(index, 1);
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200; 
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(error))
            }
            else {
                res.send('That campsite is not in your list of favorites.')
            }
        }
        else {res.send('Could not locate favorites for this user.')}
    })
    .catch(err => next(err))
})

module.exports = favoriteRouter;