const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieparser = require('cookie-parser')
const userModel = require('../models/user-model')
const eventModel = require('../models/event-model')
const mediaModel = require('../models/media-model')
const { generateToken } = require('../utils/generateToken')
const { isLoggedIn, isMember, isAdmin } = require('../middlewares/isLoggedIn')

router.use(cookieparser())


router.get('/members', isLoggedIn, isMember, async (req, res) => {
    try {
        const userClub = req.user.club;
        const events = await eventModel.find({ club: userClub }).sort({ eventDate: -1 });
        
        const memberEvents = await Promise.all(events.map(async (event) => {
            const media = await mediaModel.find({ 
                eventId: event._id, 
                visibility: { $in: ['members', 'public'] } 
            });
            return { 
                ...event.toObject(), 
                media, 
                mediaCount: media.length 
            };
        }));
        
        res.render('members', { memberEvents, user: req.user });
    } catch (err) {
        console.error("Members Vault Fetch Error:", err);
        res.status(500).send("Database Error: " + err.message);
    }
});

module.exports = router;