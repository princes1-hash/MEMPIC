const jwt = require('jsonwebtoken')
const userModel = require('../models/user-model')

const isLoggedIn = async (req, res, next) => {
    try {
        const token = req.cookies.token
        if (!token) return res.redirect('/users/login')
        const decoded = jwt.verify(token, process.env.JWT_KEY)
        const user = await userModel.findById(decoded.id).select('-password')
        if (!user) return res.redirect('/users/login')
        req.user = user
        res.locals.user = user
        res.locals.isLoggedIn = true
        next()
    } catch (err) {
        res.clearCookie('token')
        res.redirect('/users/login')
    }
}

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') return next()
    res.status(403).send('Access denied: Admins only')
}

const isPhotographer = (req, res, next) => {
    if (req.user && (req.user.role === 'photographer' || req.user.role === 'admin')) return next()
    res.status(403).send('Access denied: Photographers only')
}

const isMember = (req, res, next) => {
    if (req.user && (req.user.isClubMember || req.user.role === 'admin')) return next()
    res.status(403).send('Access denied: Club members only')
}

module.exports = { isLoggedIn, isAdmin, isPhotographer, isMember }