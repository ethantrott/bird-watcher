const express = require('express');
const db = require('./db-interact');

const app = express();
const PORT = 80;

// host everything in public dir
app.use(express.static('public'));

// formatting for json responses
app.set('json spaces', 2);

// respond with "hello world" when a GET request is made to the homepage
app.get('/api/history/latest', async(req, res) => {
    const data = await db.getLatestData();
    res.json(data);
});

// start server
app.listen(PORT, (error) =>{
    if(!error)
        console.log("web server running on port "+ PORT)
    else 
        console.log("Error starting server: ", error);
    }
);