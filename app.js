const express = require('express')
const app = express()
const path = require('path')
const cookieparser = require('cookie-parser')
const expressSession = require('express-session')
const flash = require('connect-flash')
require('dotenv').config()
const bcrypt = require('bcrypt')
const { generateToken } = require('./utils/generateToken')
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require('fs')


const db = require('./config/mongoose-connection')
const eventModel = require('./models/event-model')
const mediaModel = require('./models/media-model')
const userModel = require('./models/user-model')

app.set('view engine', 'ejs')

app.use(cookieparser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.EXPRESS_SESSION_SECRET || 'mempic_secret'
}))
app.use(flash())
app.use(express.static(path.join(__dirname, 'public')))
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))

const { isLoggedIn, isMember, isAdmin } = require('./middlewares/isLoggedIn')

app.use((req, res, next) => {
    const token = req.cookies.token
    res.locals.isLoggedIn = !!token
    if (req.user) {
        res.locals.user = req.user;
    } else if (!res.locals.user) {
        res.locals.user = null;
    }
    next()
})

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success');
    res.locals.error_msg = req.flash('error');
    next();
});

const notificationRouter = require('./routes/notification');
const usersRouter = require('./routes/userIn')
const mainRoute = require('./routes/main')
const membersRoute = require('./routes/members')
const eventRouter = require('./routes/event')
const mediaRouter = require('./routes/media')
const profileRoute = require('./routes/profile')
const commentRouter = require('./routes/comment')

app.use(mainRoute)
app.use(membersRoute)
app.use(profileRoute)
app.use(notificationRouter);
app.use('/admin', eventRouter)
app.use('/media', mediaRouter)
app.use('/users', usersRouter)
app.use('/comments', commentRouter)

app.get('/', (req, res) => {
    res.render('home')
})


app.get('/adminLogin', isLoggedIn, (req,res)=>{ res.render('adminLogin') })
app.post('/adminLogin', isLoggedIn, async (req,res)=>{
    try {
        let { email, password } = req.body
        let user = await userModel.findOne({ email })
        if (!user) return res.status(400).send('No account found with this email')

        const result = await bcrypt.compare(password, user.password)
        if (result) {
            let token = generateToken(user)
            res.cookie('token', token, { httpOnly: true })
            res.redirect('/admin')
        } else { res.status(401).send('Incorrect password') }
    } catch (err) { res.status(500).send('Login failed: ' + err.message) }
})

app.get('/photographerLogin', isLoggedIn, (req,res)=>{ res.render('adminLogin') })
app.post('/photographerLogin', isLoggedIn, async (req,res)=>{
    try {
        let { email, password } = req.body
        let user = await userModel.findOne({ email })
        if (!user) return res.status(400).send('No account found with this email')

        const result = await bcrypt.compare(password, user.password)
        if (result) {
            let token = generateToken(user)
            res.cookie('token', token, { httpOnly: true })
            res.redirect('/admin')
        } else { res.status(401).send('Incorrect password') }
    } catch (err) { res.status(500).send('Login failed: ' + err.message) }
})

const userSocketMap = new Map(); 

io.on('connection', (socket) => {
   socket.on('register-user-session', (userId) => {
        if (userId) {
            const cleanId = userId.toString().trim();
            socket.join(cleanId);

            if (!userSocketMap.has(cleanId)) {
                userSocketMap.set(cleanId, new Set());
            }
            userSocketMap.get(cleanId).add(socket.id);
        }
    });

    socket.on('disconnect', () => {
        for (const [uid, sockets] of userSocketMap.entries()) {
            sockets.delete(socket.id);
            if (sockets.size === 0) userSocketMap.delete(uid);
        }
    });
});

global.triggerLiveNotification = async function(payload) {
    try {
        const Notification = require('./models/live-notifications');

        if (!payload.recipient) {
            console.warn('triggerLiveNotification: no recipient provided, skipping.');
            return;
        }

        const log = new Notification({
            recipient: payload.recipient,
            sender: payload.sender,
            type: payload.type,
            title: payload.title,
            message: payload.message
        });
        await log.save();
        const recipientId = payload.recipient.toString();
        io.to(recipientId).emit('incoming-notification', {
            _id: log._id,
            type: log.type,
            title: log.title,
            message: log.message,
            isRead: false,
            createdAt: log.createdAt
        });


    } catch (err) {
    }
};

const uploadsDir = path.join(__dirname, 'public/uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const PORT = process.env.PORT || 3000;
http.listen(PORT);