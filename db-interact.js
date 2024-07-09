const { Client } = require('pg');

const config = require("./config.json");

async function connectDB(){
    var client = new Client({
        host: config.host,
        port: config.port,
        user: config.username,
        password: config.password
    });

    // connect
    await client.connect();

    return client;
}

async function disconnectDB(client){
    // exit
    await client.end(); 
}

// gets latest bird data and returns it
async function getLatestData(){
    const client = await connectDB();
    const res = await client.query(`SELECT * FROM history WHERE time_utc = (SELECT MAX(time_utc) FROM history) AT TIME ZONE 'UTC';`);
    
    var dataToReturn = res.rows[0];
    dataToReturn.birds = [];

    for (const moment of dataToReturn.bird_moments){
        const momentRes = await client.query(`SELECT * FROM moments WHERE moment_id = '${moment}';`);
        const data = momentRes.rows[0];

        //remove unneeded data
        delete data['moment_id'];

        dataToReturn.birds.push(data);
    }

    delete dataToReturn['bird_moments'];

    disconnectDB(client);
    return dataToReturn;
}

module.exports = { getLatestData }