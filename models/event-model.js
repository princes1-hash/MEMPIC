const mongoose = require('mongoose')

const eventSchema = mongoose.Schema({
    eventName: {
        type: String,
        required: true,
        trim: true
    },
    club: {
        type: String,
        enum: ['COGNIZANCE', 'THOMSO', 'MARS', 'CIG', 'SDSLabs', 'UBA', 'SocBiz', 'BlocSoc'],
        required: true
    },
    eventDate: {
        type: Date,
        required: true
    },
    eventTime: String,
    venue: String,
    category: {
        type: String,
        enum: ['cultural',"PhotoShoot","Farewell","Chapoo","Trip", 'technical', 'sports', 'workshop', 'fest', 'other'],
        default: 'other'
    },
    description: String,
    coverImage: String,
    tags: [String],
    maxPhotographers: {
        type: Number,
        default: 5
    },
    visibility: {
        type: String,
        enum: ['public', 'members'],
        default: 'public'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
}, { timestamps: true })

module.exports = mongoose.model('event', eventSchema)