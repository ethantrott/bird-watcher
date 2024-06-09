const express = require('express');

const app = express();
const PORT = 80;

app.use(express.static('public'));

app.listen(PORT, (error) =>{
    if(!error)
        console.log("web server running on port "+ PORT)
    else 
        console.log("Error starting server: ", error);
    }
);