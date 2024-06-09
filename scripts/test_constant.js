// test if specific bird api value changes over time

const fs = require('fs');

const sconfig = require("./script_config.json");

const dir = sconfig.filepath;

var pairs = {};

function parseFile(file){
    console.log("loading "+file);
    var birdData;

    try{
        birdData = require(file);
    }catch (e){
        console.log("bad file");
        return;
    }
    
    for (bird in birdData.birds){
        const code = birdData.birds[bird].code.substring(0,3)
        const model= birdData.birds[bird].model

        if (!pairs[code]){
            pairs[code] = model;
        }
        else{
            if (pairs[code] !== model){
                console.log("!!! model is different for "+code+": old="+pairs[code]+" new="+model);
                throw new Error('^');
            }
        }
    }
}

fs.readdir(dir, (err, files) => {
    files.forEach(file => {
        parseFile(dir+file);
    });
    console.log(pairs);
    console.log(Object.keys(pairs).length);
});

