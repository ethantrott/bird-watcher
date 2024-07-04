// COMPLETELY REMOVES TABLES IF THEY EXIST and generates from scratch

const { Client } = require('pg');

const config = require("../config.json");

const client = new Client({
    host: config.host,
    port: config.port,
    user: config.username,
    password: config.password
});

function waitKeyPressed() {
    return new Promise(resolve => {
        const wasRaw = process.stdin.isRaw;
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.once("data", (data) => {
            process.stdin.pause();
            process.stdin.setRawMode(wasRaw);
            resolve(data.toString());
        });
    });
}

async function main(){
    console.log("WARNING: THIS WILL ERASE THE DB CONTENTS. PRESS ANY KEY TO CONTINUE. PRESS Q to CANCEL.")
    var key = await waitKeyPressed();
    if (key === 'q'){
        return;
    }

    // connect
    await client.connect();
    console.log('Connected.');

    // setup
    await setup();

    // exit
    await client.end(); 
}

// Resets DB and creates tables from scratch
async function setup(){
    // Delete all tables (reset DB)
    await client.query(`DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA IF NOT EXISTS public;`);

    // Create types
    //await client.query(`CREATE TYPE interaction_type AS ENUM ('routine', 'emergency', 'other')`);

    // Create required tables
    await client.query(`CREATE TABLE birds (code TEXT PRIMARY KEY, model TEXT, vehicle_class TEXT)`);
    await client.query(`CREATE TABLE history (time_utc TIMESTAMP PRIMARY KEY, bird_moments UUID[])`);
    await client.query(`CREATE TABLE moments (moment_id UUID PRIMARY KEY, bird_id TEXT, location POINT, captive BOOLEAN, battery_level SMALLINT, estimated_range INT, has_helmet BOOLEAN,
        CONSTRAINT fk_interaction_bird_id
            FOREIGN KEY(bird_id) 
            REFERENCES birds(code)
            ON DELETE RESTRICT)`);

    // Output table list
    const res = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`);
    console.log("Tables created:");
    console.log(res.rows);

    console.log("Setup complete.");
}

main();