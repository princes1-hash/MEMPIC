const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('connected')
})
.catch((err) => {
    process.exit(1);
});

module.exports = mongoose.connection;
