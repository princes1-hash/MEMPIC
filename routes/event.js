const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const eventModel = require('../models/event-model')
const mediaModel = require('../models/media-model')
const userModel = require('../models/user-model')
const { isLoggedIn, isAdmin, isPhotographer } = require('../middlewares/isLoggedIn')
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');


const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: 'mempic/events',
        resource_type: 'auto'
    })
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }
});

// AdminPanel
router.get('/', isLoggedIn, isPhotographer, async (req, res) => {
    try {
        const userClub = req.user.club;
        const userRole = req.user.role;

        let events;
        let mediaQuery = {};
        if (userRole === 'admin') {
            events = await eventModel.find().sort({ eventDate: -1 });
        } else {
            events = await eventModel.find({ club: userClub }).sort({ eventDate: -1 });
            
            mediaQuery.club = userClub; 
        }
        
        const recentMedia = await mediaModel.find(mediaQuery)
            .populate('uploadedBy', 'Fullname')
            .populate('eventId', 'eventName')
            .sort({ createdAt: -1 })
            .limit(20);

        const photographerQuery = userRole === 'admin' ? { role: 'photographer' } : { role: 'photographer', club: userClub };
        const photographers = await userModel.find(photographerQuery);
                res.render('adminPanel', { 
            events, 
            recentMedia, 
            photographers, 
            user: req.user 
        });

    } catch (err) {
        res.status(500).send("Internal Server Error: " );
    }
});

router.post('/create/event', isLoggedIn, isPhotographer, upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 50 }
]), async (req, res) => {
    try {
        const { eventName, club, eventDate, eventTime, venue, category, description, visibility, tags, maxPhotographers } = req.body;
        let coverImage = '';
        if (req.files && req.files['coverImage'] && req.files['coverImage'].length > 0) {
          coverImage = req.files['coverImage'][0].path;        }
        const event = await eventModel.create({
            eventName, 
            club, 
            eventDate, 
            eventTime, 
            venue, 
            category, 
            description,
            visibility: visibility || 'public',
            coverImage, 
            tags: tags ? tags.split(',').map(t => t.trim()) : [],
            maxPhotographers: parseInt(maxPhotographers, 10) || 5,
            createdBy: req.user._id
        });

        if (req.files && req.files['galleryImages'] && req.files['galleryImages'].length > 0) {
            
            const mediaDocuments = req.files['galleryImages'].map(file => {
                const isVideo = file.mimetype.startsWith('video/');
                return {
                   url: file.path,
                   publicId: file.filename,
                    type: isVideo ? 'video' : 'image',
                    eventId: event._id,
                    uploadedBy: req.user._id,
                    visibility: visibility || 'public',
                    club: club
                };
            });

            await mediaModel.insertMany(mediaDocuments);
            req.flash(
    'success',
    'Event created successfully.'
);

        }
       
        res.redirect('/admin');
    } catch (err) {
            req.flash(
        'error',
        'Failed to create event. Please try again.'
    );

    return res.redirect('/admin/create/event');
    }
});

router.get('/create/event',isLoggedIn,isPhotographer,async (req,res)=>{
    let event = await eventModel.find()
    res.render('eventCreate',{event,user: req.user})
})

router.post('/event/delete/:id', isLoggedIn, isPhotographer, async (req, res) => {
    try {
        await eventModel.findByIdAndDelete(req.params.id)
        await mediaModel.deleteMany({ eventId: req.params.id })
        res.redirect('/admin')
    } catch (err) {
        res.status(500).send(err.message)
    }
})

module.exports = router