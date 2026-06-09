const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const mediaModel = require('../models/media-model')
const eventModel = require('../models/event-model')
const { isLoggedIn, isAdmin, isPhotographer } = require('../middlewares/isLoggedIn')
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: 'mempic',
        resource_type: 'auto'
    })
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } })

router.get('/', isLoggedIn, isPhotographer , async (req, res) => {
    try {
        let events;

if (req.user.role === "admin") {
    events = await eventModel.find();
} else {
    events = await eventModel.find({
        club: req.user.club
    });
}
        const myUploads = await mediaModel.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 }).limit(20)
        res.render('mediaPanel', { events, myUploads, user: req.user })
    } catch (err) {
        res.status(500).send(err.message)
    }
})

router.post('/upload', isLoggedIn, isPhotographer, upload.array('media', 50), async (req, res) => {
    try {
        const { eventId, visibility, caption } = req.body;

        if (!eventId) {
req.flash('error', 'Please select an event before uploading media.');
return res.redirect('/media');        }

        const event = await eventModel.findById(eventId);
        if (!event) {
        req.flash('error', 'The selected event could not be found.');
           return res.redirect('/media');        }

           if (
    req.user.role === 'photographer' &&
    event.club !== req.user.club
) {
    req.flash(
        'error',
        'You can only upload media for your club.'
    );
    return res.redirect('/media');
}
 
        if (!req.files || req.files.length === 0) {
req.flash('error', 'Please select at least one file to upload.');
return res.redirect('/media');        }

        const mediaDocuments = req.files.map(file => {
            const isVideo = file.mimetype.startsWith('video/');
            return {
                url: file.path,
                type: isVideo ? 'video' : 'image',
                eventId: event._id,
                uploadedBy: req.user._id,
                visibility: visibility || 'public',
                caption: caption || '',
                club: event.club,
                publicId: file.filename
            };
        });

        await mediaModel.insertMany(mediaDocuments);
        req.flash(
    'success',
    `${req.files.length} file(s) uploaded successfully.`
);
        res.redirect('/media');
    } catch (err) {
req.flash(
        'error',
        'Something went wrong while uploading media.'
    );

    return res.redirect('/media');    }
});

module.exports = router