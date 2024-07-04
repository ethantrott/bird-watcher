const config = require("../config.json");

const { Client } = require('pg');

const client = new Client({
    host: config.host,
    port: config.port,
    user: config.username,
    password: config.password
});

async function mainLoop(){
    // connect
    await client.connect();
    console.log('Connected.');

    console.log("HISTORY");
    var res = await client.query(`SELECT * FROM history`);
    console.log(res.rows);

    console.log("BIRDS");
    var res = await client.query(`SELECT * FROM birds`);
    console.log(res.rows);

    console.log("MOMENTS");
    res = await client.query(`SELECT * FROM moments`);
    console.log(res.rows);

    // exit
    await client.end(); 
}

mainLoop();