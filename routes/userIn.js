const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieparser = require('cookie-parser')
const userModel = require('../models/user-model')
const { generateToken } = require('../utils/generateToken')
const { isLoggedIn } = require('../middlewares/isLoggedIn')

router.use(cookieparser())

router.get('/register', (req, res) => {
    res.render('register', { messages: req.flash ? req.flash() : {} })
})

router.post('/register', async (req, res) => {
    try {
        const existingPhotographer = await userModel.findOne({
            role: "photographer",
            club: req.body.club
        });
        
        if (existingPhotographer) {
            req.flash('error', 'A photographer is already assigned to this club');
            res.redirect('/users/register');
        }
        let { Fullname, email, password, confirmPass, role, isClubMember, club } = req.body

        if (password !== confirmPass) {
            req.flash('error', 'Incorrect Password');
            return res.redirect('/users/register');
        }

        let existingUser = await userModel.findOne({ email })
if (existingUser) {
    req.flash('error', 'Account with this email already exists');
    return res.redirect('/users/register');
}
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)

        let user = await userModel.create({
            Fullname,
            email,
            password: hash,
            role: role || 'user',
            isClubMember: isClubMember === 'yes',
            club: isClubMember === 'yes' ? club : ''
        })

        let token = generateToken(user)
        res.cookie('token', token, { httpOnly: true })
        res.redirect('/main')
    } catch (err) {
        console.error(err)
        res.status(500).send('Registration failed: ' + err.message)
    }
})

router.get('/login', (req, res) => {
    res.render('login', { messages: req.flash ? req.flash() : {} })
})

router.post('/login', async (req, res) => {
    try {
        let { email, password } = req.body
        let user = await userModel.findOne({ email })
    if (!user) {
    req.flash('error', 'No account found with this email');
    return res.redirect('/users/login');
}
        const result = await bcrypt.compare(password, user.password)
        if (result) {
            let token = generateToken(user)
            res.cookie('token', token, { httpOnly: true })
            req.flash('success', 'Welcome back!');
            res.redirect('/main')
        } else {
            req.flash('error', 'Incorrect password');
            return res.redirect('/users/login');
        }
    } catch (err) {
        res.status(500).send('Login failed: ' + err.message)
    }
})


router.get('/profile',isLoggedIn, async (req,res)=>{
 let user = await userModel.findOne({email:req.user.email})
 res.render('Profile',{user})

})

router.get('/logout', (req, res) => {
    res.clearCookie('token')
    res.redirect('/')
})

module.exports = router