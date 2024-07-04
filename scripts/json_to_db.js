// loads json files from dir, parses them, and populates db with info

const sconfig = require("./script_config.json");
const config = require("../config.json");

const fss = require('fs');
const fs = require('fs/promises');
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

const client = new Client({
    host: config.host,
    port: config.port,
    user: config.username,
    password: config.password
});

const dir = sconfig.filepath;
const filename = sconfig.test_file;

async function parseFile(filepath, filename){    
    var data = fss.readFileSync(filepath,{ encoding: 'utf8', flag: 'r' });
    birdData = JSON.parse(data);
    if (birdData.birds.length == 0) throw new Error('no birds here');

    //filename:             1999-01-08T04:05:06.429Z.json
    //proper (postgres):    1999-01-08 04:05:06
    var timestamp = filename.replace(".json","").replace("T" ," ").split('.')[0];;

    var dataToInsert = {
        history: {
            time_utc: timestamp,
            bird_moments: []
        },
        birds: [],
        moments: []
    }

    for (bird in birdData.birds){
        const scooter = birdData.birds[bird]
        const bird_code = scooter.code.substring(0,3)
        //TODO: add checks
        var birdsInsert = {
            code: bird_code,
            model: scooter.model,
            vehicle_class: scooter.vehicle_class
        }
        
        var m_uuid = uuidv4();
        var momentsInsert = {
            moment_id: m_uuid,
            bird_id: bird_code,
            location: [scooter.location.latitude, scooter.location.longitude],
            captive: scooter.captive,
            battery_level: scooter.battery_level,
            estimated_range: scooter.estimated_range,
            has_helmet: scooter.has_helmet
        }

        dataToInsert.history.bird_moments.push(m_uuid);

        dataToInsert.birds.push(birdsInsert);
        dataToInsert.moments.push(momentsInsert);
    }

    return dataToInsert;
}

async function insertFileData(dataToInsert){
    // check if this timestamp is in our DB before inserting
    const res = await client.query(`SELECT exists (SELECT 1 FROM history WHERE time_utc = '${dataToInsert.history.time_utc}' LIMIT 1)`);

    if (res.rows[0].exists){
        console.log("Timestamp "+dataToInsert.history.time_utc+" already exists. Skipping...")
        return;
    }

    // insert bird table data
    for (i in dataToInsert.birds){
        const scooter = dataToInsert.birds[i];

        // check if this bird code is in our DB before inserting
        const res = await client.query(`SELECT exists (SELECT 1 FROM birds WHERE code = '${scooter.code}' LIMIT 1)`);

        if (!res.rows[0].exists){
            // birds (code TEXT PRIMARY KEY, model TEXT, vehicle_class TEXT)
            await client.query(`INSERT INTO birds VALUES ( '${scooter.code}', '${scooter.model}', '${scooter.vehicle_class}')`);
        }
    }
    
    // insert moment table data
    for (i in dataToInsert.moments){
        const moment = dataToInsert.moments[i];

        // moments (moment_id UUID PRIMARY KEY, bird_id TEXT, location POINT, 
        //              captive BOOLEAN, battery_level SMALLINT, estimated_range INT, has_helmet BOOLEAN
        // YES using latiude as x and longitude as y is WRONG, I'm doing it that way anyway bc I'll be confused otherwise
        await client.query(`INSERT INTO moments VALUES ( '${moment.moment_id}', '${moment.bird_id}', '(${moment.location[0]},${moment.location[1]})',
            ${moment.captive}, ${moment.battery_level}, ${moment.estimated_range}, ${moment.has_helmet})`);
    }

    // history (time_utc TIMESTAMP PRIMARY KEY, bird_moments UUID[])
    const momentIDs = "ARRAY ['" + dataToInsert.history.bird_moments.join("','") + "']::uuid[]";
    await client.query(`INSERT INTO history VALUES ('${dataToInsert.history.time_utc}', ${momentIDs})`);
}

async function mainLoop(){
    // connect
    await client.connect();
    console.log('Connected.');

    const files = await fs.readdir(dir);
    console.log("Found "+files.length + " files to import..");

    for (const filename of files) {
        var data;
        try{
            // parse data from file
            data = await parseFile(dir+filename, filename);
            console.log(filename + " parsed.");
        }
        catch(e){
            console.log(filename+": Error encountered, not inserting data to db");
        }
        if (data){
            // insert data to db
            await insertFileData(data);
            console.log(filename + " data inserted.");
        }
    }

    // exit
    await client.end(); 
}

mainLoop();