// loads json files from dir, parses them, and populates db with info

const sconfig = require("./script_config.json");

const dir = sconfig.filepath;
const filename = sconfig.test_file;

function parseFile(file){
    const birdData = require(file);

    for (bird in birdData.birds){
        console.log(birdData.birds[bird].location);
    }
}

parseFile(dir+filename);