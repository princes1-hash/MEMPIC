const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieparser = require('cookie-parser')
const userModel = require('../models/user-model')
const eventModel = require('../models/event-model')
const mediaModel = require('../models/media-model')
const { generateToken } = require('../utils/generateToken')
const { isLoggedIn } = require('../middlewares/isLoggedIn')

router.use(cookieparser())

router.get('/main', isLoggedIn, async (req, res) => {
    try {
        const events = await eventModel.find({ visibility: 'public' }).sort({ eventDate: -1 });
        if (events.length === 0) {
            return res.render('main', { clubGalleries: [], clubs: [], user: req.user });
        }

        const eventIds = events.map(event => event._id);
        const allMedia = await mediaModel.find({ 
            eventId: { $in: eventIds }, 
            visibility: 'public' 
        });

        const clubDescriptions = {
'COGNIZANCE': 'Cognizance is IIT Roorkee’s annual technical festival, inspiring innovation and creativity through competitions, workshops, lectures, and events that connect students with technology, research, and industry leaders.',

'THOMSO': 'Thomso is IIT Roorkee’s annual cultural festival, celebrating music, dance, arts, and entertainment while bringing together talented students from across India for an unforgettable experience.',

'CIG': 'The CIG club at IIT Roorkee promotes innovation, entrepreneurship, and leadership by connecting students with industry experts, startups, and opportunities that encourage problem-solving, collaboration, and professional growth.',

'SDSLabs': 'SDSLabs is IIT Roorkee’s premier student-run technology group, fostering software development, open-source contributions, and innovative digital solutions through projects, mentorship, and technical learning opportunities.',

'UBA': 'Unnat Bharat Abhiyan at IIT Roorkee works towards rural development by engaging students in community-driven initiatives, sustainable solutions, and social impact projects that address real-world challenges.',

'SocBiz': 'SocBiz at IIT Roorkee bridges business and strategy, providing students opportunities to explore consulting, finance, marketing, and entrepreneurship through competitions, workshops, and industry interactions.',

'BlocSoc': 'BlocSoc is IIT Roorkee’s blockchain and Web3 community, dedicated to exploring decentralized technologies, fostering innovation, and empowering students through projects, events, workshops, and collaborative learning.',

'MARS': 'MARS at IIT Roorkee encourages robotics, automation, and advanced engineering innovation through hands-on projects, technical challenges, and research-driven activities that inspire creativity and practical problem-solving.'
        };

        const groupedByClub = {};
        events.forEach(event => {
            const clubName = event.club;
            if (!groupedByClub[clubName]) {
                groupedByClub[clubName] = {
                    clubName: clubName,
                    description: clubDescriptions[clubName] || `The official event hub for ${clubName}.`,
                    events: []
                };
            }

            const eventMedia = allMedia
                .filter(media => media.eventId.toString() === event._id.toString())
                .slice(0, 10);

            groupedByClub[clubName].events.push({
                ...event.toObject(),
                media: eventMedia
            });
        });

        const clubGalleries = Object.values(groupedByClub);
        const uniqueClubs = Object.keys(groupedByClub).sort();

        res.render('main', { 
            clubGalleries, 
            clubs: uniqueClubs, 
            user: req.user 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error: " + err.message);
    }
});

module.exports = router