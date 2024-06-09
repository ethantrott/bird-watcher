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
        const id = birdData.birds[bird].id
        const code = birdData.birds[bird].code
        
        if (!pairs[id]){
            pairs[id] = code;
        }
        else{
            if (pairs[id].substring(0,3) !== code.substring(0,3)){
                console.log("!!! code is different for "+id+": old="+pairs[id]+" new="+code);
                throw new Error('^');
            }
        }
    }
}

fs.readdir(dir, (err, files) => {
    files.forEach(file => {
        parseFile(dir+file);
    });
    console.log(Object.keys(pairs).length);
});

