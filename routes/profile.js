const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieparser = require('cookie-parser')
const userModel = require('../models/user-model')
const eventModel = require('../models/event-model')
const mediaModel = require('../models/media-model')
const { generateToken } = require('../utils/generateToken')
const { isLoggedIn } = require('../middlewares/isLoggedIn')

router.use(cookieparser())



router.get('/profile', isLoggedIn, async (req, res) => {
    try {
        const uploadCount = await mediaModel.countDocuments({ uploadedBy: req.user._id })
        const commentCount = await require('./models/comment-model').countDocuments({ userId: req.user._id })
        const myMedia = await mediaModel.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 }).limit(12)
        res.render('Profile', { user: req.user, uploadCount, commentCount, eventCount: 0, myMedia })
    } catch (err) {
        res.status(500).send(err.message)
    }
})

module.exports = router;