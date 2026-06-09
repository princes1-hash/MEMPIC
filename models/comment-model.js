const mongoose = require('mongoose')

const commentSchema = mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true,
        maxLength: 500
    },
    mediaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'media',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('comment', commentSchema)