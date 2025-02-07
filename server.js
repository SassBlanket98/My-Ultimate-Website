const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize SQLite Database
const db = new sqlite3.Database('journal.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');

        db.run(`CREATE TABLE IF NOT EXISTS journal_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            date TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error("Error creating table:", err.message);
            }
        });
    }
});

const corsOptions = {
    origin: 'http://localhost:3001', // Allow requests from your front-end
    methods: 'GET,POST', 
    allowedHeaders: 'Content-Type,Authorization'
};
app.use(cors(corsOptions));


// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Serve index.html for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API to Get All Journal Entries
app.get('/api/journal', (req, res) => {
    db.all("SELECT * FROM journal_entries ORDER BY id DESC", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// API to Add New Entry
app.post('/api/journal', (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    const date = new Date().toISOString();
    db.run("INSERT INTO journal_entries (title, content, date) VALUES (?, ?, ?)", 
        [title, content, date], 
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, title, content, date });
        }
    );
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
        console.error('Error fetching repositories:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: error.response ? error.response.data : 'Unknown error' });
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
        console.error('Error fetching languages:', error.message);
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
        console.error('Error fetching commits:', error.message);
        res.status(500).send('Error fetching commits');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});