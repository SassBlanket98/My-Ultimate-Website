const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Serve index.html for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/repos', async (req, res) => {
    const username = "SassBlanket98";
    try {
        const response = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated`, {
            headers: {
                Authorization: `token ${process.env.GITHUB_TOKEN}`
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).send('Error fetching repositories');
    }
});

app.get('/api/languages', async (req, res) => {
    const { url } = req.query;
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `token ${process.env.GITHUB_TOKEN}`
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).send('Error fetching languages');
    }
});

app.get('/api/commits', async (req, res) => {
    const { url } = req.query;
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `token ${process.env.GITHUB_TOKEN}`
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).send('Error fetching commits');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});