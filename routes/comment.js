const express = require('express')
const router = express.Router()
const commentModel = require('../models/comment-model')
const mediaModel = require('../models/media-model')
const { isLoggedIn } = require('../middlewares/isLoggedIn')

router.get('/:mediaId', isLoggedIn, async (req, res) => {
    try {
        const media = await mediaModel.findById(req.params.mediaId)
            .populate('uploadedBy', 'Fullname role club')
            .populate('eventId', 'eventName')
        if (!media) return res.status(404).send('Media not found')

        if (media.visibility === 'members') {
            if (!req.user || req.user.club !== media.club) {
                return res.status(403).render('error', { message: 'This content is for club members only.' })
            }
        }

        const comments = await commentModel.find({ mediaId: req.params.mediaId })
            .populate('userId', 'Fullname role club')
            .sort({ createdAt: -1 })

        res.render('comments', { media, comments, user: req.user, isLoggedIn: true })
    } catch (err) {
        res.status(500).send(err.message)
    }
})

router.post('/:mediaId', isLoggedIn, async (req, res) => {
    try {
        const { comment } = req.body
        if (!comment || !comment.trim()) return res.redirect('back')

        const media = await mediaModel.findById(req.params.mediaId)
        if (!media) return res.status(404).send('Media not found')

        await commentModel.create({
            text: comment.trim(),
            mediaId: req.params.mediaId,
            userId: req.user._id
        })

        const ownerId = media.uploadedBy ? media.uploadedBy.toString() : null;
        const commenterId = req.user._id.toString();

        if (ownerId && ownerId !== commenterId) {
            await global.triggerLiveNotification({
                recipient: media.uploadedBy,
                sender: req.user._id,
                type: 'comment',
                title: 'New Comment on Your Post',
                message: `${req.user.Fullname || 'Someone'} commented: "${comment.trim().substring(0, 50)}"`
            });
        }

        res.redirect('/comments/' + req.params.mediaId)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

router.post('/delete/:commentId', isLoggedIn, async (req, res) => {
    try {
        const comment = await commentModel.findById(req.params.commentId)
        if (!comment) return res.status(404).send('Not found')
        if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).send('Unauthorized')
        }
        const mediaId = comment.mediaId
        await commentModel.findByIdAndDelete(req.params.commentId)
        res.redirect('/comments/' + mediaId)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

router.post('/media/:id/like', isLoggedIn, async (req, res) => {
    try {
        const mediaId = req.params.id;
        const userId = req.user._id;
        const media = await mediaModel.findById(mediaId);
        if (!media) {
            return res.status(404).json({ success: false, message: 'Media not found' });
        }
        
        const hasLiked = media.likes.includes(userId);
        
        if (hasLiked) {
            await mediaModel.findByIdAndUpdate(mediaId, { $pull: { likes: userId } });
            return res.json({ success: true, liked: false, count: media.likes.length - 1 });
        } else {
            await mediaModel.findByIdAndUpdate(mediaId, { $addToSet: { likes: userId } });

            const ownerId = media.uploadedBy ? media.uploadedBy.toString() : null;
            const likerId = userId.toString();

            if (ownerId && ownerId !== likerId) {
                await global.triggerLiveNotification({
                    recipient: media.uploadedBy,
                    sender: userId,
                    type: 'like',
                    title: 'Someone Liked Your Post!',
                    message: `${req.user.Fullname || 'Someone'} liked your photo.`
                });
            }

            return res.json({ success: true, liked: true, count: media.likes.length + 1 });
        }
    } catch (err) {
        
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

module.exports = router;