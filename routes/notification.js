const express = require('express');
const router = express.Router();
const Notification = require('../models/live-notifications');

const { isLoggedIn } = require('../middlewares/isLoggedIn');

router.get('/api/notifications', isLoggedIn, async (req, res) => {
    console.log("REQ USER:", req.user._id);

    const history = await Notification.find({
        recipient: req.user._id
    });

    console.log("FOUND:", history.length);

    res.json({
        success: true,
        notifications: history
    });
});

router.post('/api/notifications/mark-read', isLoggedIn, async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false });
        
        await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.delete('/api/notifications/clear', isLoggedIn, async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false });
        
        await Notification.deleteMany({ recipient: req.user._id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/api/debug-me', isLoggedIn, (req, res) => {
    res.json({
        hasReqUser: !!req.user,
        reqUserField: req.user ? req.user : "EMPTY",
        message: "This endpoint checks if your isLoggedIn middleware actually exposes your exact MongoDB property fields."
    });
});

module.exports = router;