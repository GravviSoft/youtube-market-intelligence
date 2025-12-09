require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const {
    getAnalyticsStats,
    getAnalyticsChannels,
    getAnalyticsNiches,
    getOpportunities,
    getAllChannels,
    getAllVideos,
    getNewChannels
} = require('./controllers/analyticsController');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send({ status: 'OK', message: 'Server is running' });
});

// Analytics endpoints
app.get('/analytics/stats', getAnalyticsStats);
app.get('/analytics/channels', getAnalyticsChannels);
app.get('/analytics/niches', getAnalyticsNiches);
app.get('/analytics/opportunities', getOpportunities);

// General data endpoints
app.get('/allchannels', getAllChannels);
app.get('/allvideos', getAllVideos);
app.get('/newchannels', getNewChannels);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
