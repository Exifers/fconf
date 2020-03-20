const argv = require('yargs').argv;
const fs = require('fs');
const path = require('path');
const Case = require('case');

function isObject(v) {
    return typeof v === 'object' && v !== null;
}

function maybeNumber(v, b) {
    if (!b) {
        return v;
    }
    try {
        const n = Number(v);
        return Number.isNaN(n) ? v : n;
    }
    catch (err) {
        return v;
    }
}

function fconf(config) {
    // default configuration
    let defaultConf = config.defaults;

    // command line arguments
    // flatten argv, only key,value like command line arguments (non positional) are supported
    for (const singleArg of argv._) {
        if (!argv.hasOwnProperty(singleArg)) {
            argv[singleArg] = undefined;
        }
    }
    delete argv._;
    const argsConf = argv;

    // configuration file
    let fileConf = {};
    const filepath = path.join(process.cwd(), config.filename);
    try {
        if (fs.existsSync(filepath)) {
            fileConf = require(filepath);
        }
    } catch(err) {
        // fails silently
    }
    let userShortcuts = {};
    if (isObject(fileConf.shortcuts)) {
        userShortcuts = fileConf.shortcuts;
        delete fileConf.shortcuts;
    }
    if (!isObject(fileConf)) {
        throw config.filename + ' must export a javascript object'
    }

    // environment variables
    // environment variables gets into final return value only if it overrides a similar key
    let envConf = {};
    for (const [k,v] of Object.entries(process.env)) {
        const defaultConfKey = Object.keys(defaultConf).find(ck => Case.camel(ck) === Case.camel(k))
        if (defaultConfKey) {
            envConf[defaultConfKey] = maybeNumber(v, typeof defaultConf[defaultConfKey] === 'number');
        }
        const fileConfKey = Object.keys(fileConf).find(fk => Case.camel(fk) === Case.camel(k))
        if (fileConfKey) {
            envConf[fileConfKey] = maybeNumber(v, typeof fileConf[fileConfKey] === 'number');
        }
    }

    let conf = {...defaultConf, ...fileConf, ...envConf, ...argsConf};

    // compute shortcuts
    let ret = {};
    let shortcuts = {};
    if (isObject(config.shortcuts)) {
        shortcuts = config.shortcuts;
    }
    shortcuts = {...shortcuts, ...userShortcuts};
    for (const [key,value] of Object.entries(conf)) {
        if (Object.keys(shortcuts).includes(value)) {
            ret[key] = shortcuts[value];
        }
        else {
            ret[key] = value;
        }
    }

    return ret;
}

module.exports = fconf;