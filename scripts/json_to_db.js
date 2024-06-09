// loads json files from dir, parses them, and populates db with info

const sconfig = require("./script_config.json");

const dir = sconfig.filepath;
const filename = sconfig.test_file;

function parseFile(filepath, filename){    
    const birdData = require(filepath);

    //filename:             1999-01-08T04:05:06.429Z.json
    //proper (postgres):    1999-01-08 04:05:06
    var timestamp = filename.replace(".json","").replace("T" ," ").split('.')[0];;

    for (bird in birdData.birds){
        console.log(birdData.birds[bird].location);
    }
}

parseFile(dir+filename, filename);
console.log(filename);