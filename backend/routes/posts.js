const express = require('express');
const User = require('../models/user');
const Post = require('../models/post');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const router = express.Router();

router.post('/newPost', (req, res) => {
    if (!req.body.title) {
        res.json({success: false, message: 'Post title is requested!'});
    } else {
        if (!req.body.body) {
            res.json({success: false, message: 'Post body is required!'});
        } else {
            if (!req.body.createdBy) {
                res.json({success: false, message: 'Post creator is required!'});
            } else {
                const post = new Post({
                    title: req.body.title,
                    body: req.body.body,
                    createdBy: req.body.createdBy
                });

                post.save((err) => {
                    if (err) {
                        if (err.errors) {
                            if (err.errors.title) {
                                res.json({success: false, message: err.errors.title.message});
                            } else {
                                res.json({success: false, message: err});
                            }
                        } else {
                            res.json({success: false, message: err});
                        }
                    } else {
                        res.json({success: true, message: 'Post saved successfully!'});
                    }
                });
            }
        }
    }
});

router.get('/allPosts', (req, res) => {
    Post.find({}, (err, posts) => {
        if (err) {
            res.json({success: false, message: err});
        } else {
            if (!posts) {
                res.json({success: false, message: 'No posts found.'});
            } else {
                res.json({success: true, posts: posts});
            }
        }
    }).sort({'_id': -1});
});

router.put('/updatePost', (req, res) => {
    if (!req.body._id) {
        res.json({success: false, message: 'No post id provided'});
    } else {
        Post.findOne({_id: req.body._id}, (err, post) => {
            if (err) {
                res.json({success: false, message: 'Not a valid post id'});
            } else {
                if(!post) {
                    res.json({success: false, message: 'Post id was not found'});
                } else {
                    User.findOne({_id: req.decoded.userId}, (err, user) => {
                        if (err) {
                            res.json({success: false, message: err});
                        } else {
                            if (!user) {
                                res.json({success: false, message: 'Unable to authenticate user'})
                            } else {
                                if (user.username !== post.createdBy) {
                                    res.json({success: false, message: 'You are not authorized to edit this blog post.'})
                                } else {
                                    post.title = req.body.title;
                                    post.body = req.body.body;
                                    post.save((err) => {
                                        if (err) {
                                            if(err.errors) {
                                                res.json({success: false, message: 'Please ensure the form is filled out properly'});
                                            } else {
                                                res.json({success: false, message: err});
                                            }
                                        } else {
                                            res.json({success: true, message: 'Your post was updated successfully!'})
                                        }
                                    });
                                }
                            }
                        }
                    });
                }
            }
        })
    }
});

router.delete('/deleteBlog/:id', (req, res) => {
    if (!req.params.id) {
        res.json({success: false, message: 'No id provided'});
    } else {
        Post.findOne({_id: req.params.id}, (err, post) => {
            if (err) {
                res.json({success: false, message: 'Invalid id'});
            } else {
                if (!post) {
                    res.json({success: false, message: 'Blog was not found'});
                } else {
                    User.findOne({_id: req.decoded.userId}, (err, user) => {
                        if (err) {
                           res.json({success: false, message: err});
                        } else {
                            if (!user) {
                                res.json({success: false, message: 'Unable to authenticate user'});
                            } else {
                                if (user.username !== post.createdBy) {
                                    res.json({success: false, message: 'You are not authorized to delete this post'});
                                } else {
                                    post.remove((err) => {
                                        if (err) {
                                            res.json({success: false, message: err});
                                        } else {
                                            res.json({success: true, message: 'Post deleted successfully!'});
                                        }
                                    })
                                }
                            }
                        }
                    })
                }
            }
        })
    }
})

module.exports = router;