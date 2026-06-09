const mongoose = require('mongoose')

const mediaSchema = mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['image', 'video'],
        default: 'image'
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'event',
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    visibility: {
        type: String,
        enum: ['public', 'members'],
        default: 'public'
    },
    caption: String,
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    publicId: String,
    club: String   
}, { timestamps: true })

module.exports = mongoose.model('media', mediaSchema)