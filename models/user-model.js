const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    Fullname: {
        type: String,
        minLength: 3,
        trim: true,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'photographer', 'member'],
        default: 'user'
    },
    isClubMember: {
        type: Boolean,
        default: false
    },
    club: {
        type: String,
        enum: ['COGNIZANCE', 'THOMSO', 'MARS', 'CIG', 'SDSLabs', 'UBA', 'SocBiz', 'BlocSoc', ''],
        default: ''
    },
    profilePic: {
        type: String,
        default: ''
    }
}, { timestamps: true })

module.exports = mongoose.model('user', userSchema)