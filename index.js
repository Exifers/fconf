const argv = require('yargs').argv;
const fs = require('fs');
const path = require('path');

function fconf(config) {
    // flatten argv, only key,value like arguments are supported
    for (const singleArg of argv._) {
        if (!argv.hasOwnProperty(singleArg)) {
            argv[singleArg] = undefined;
        }
    }
    delete argv._

    const argsConf = argv;

    let fileConf = {};
    const filepath = path.join(process.cwd(), config.filename);
    try {
        if (fs.existsSync(filepath)) {
            fileConf = require(filepath);
        }
    } catch(err) {
        // fails silently
    }

    return Object.assign(fileConf, argsConf)
}

module.exports = fconf;