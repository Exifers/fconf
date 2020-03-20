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

function computeArgsConf(args) {
    if (args._) {
        for (const singleArg of args._) {
            if (!args.hasOwnProperty(singleArg)) {
                args[singleArg] = undefined;
            }
        }
        delete args._;
    }
    return args;
}

function computeFileConf(config) {
    let fileConf = {};
    if (typeof config.filename === 'string') {
        const filepath = path.join(process.cwd(), config.filename);
        try {
            if (fs.existsSync(filepath)) {
                fileConf = require(filepath);
            }
        } catch (err) {
            // fails silently
        }
    }
    return fileConf;
}

function computeEnvConf(defaultConf, fileConf, env) {
    let envConf = {};
    for (const [k, v] of Object.entries(env)) {
        if (isObject(defaultConf)) {
            const defaultConfKey = Object.keys(defaultConf).find(ck => Case.camel(ck) === Case.camel(k))
            if (defaultConfKey) {
                envConf[defaultConfKey] = maybeNumber(v, typeof defaultConf[defaultConfKey] === 'number');
            }
        }
        if (isObject(fileConf)) {
            const fileConfKey = Object.keys(fileConf).find(fk => Case.camel(fk) === Case.camel(k))
            if (fileConfKey) {
                envConf[fileConfKey] = maybeNumber(v, typeof fileConf[fileConfKey] === 'number');
            }
        }
    }
    return envConf;
}

function computeShortcuts(config, userShortcuts, conf) {
    let ret = {};
    let shortcuts = {};
    if (isObject(config.shortcuts)) {
        shortcuts = config.shortcuts;
    }
    shortcuts = {...shortcuts, ...userShortcuts};
    for (const [key, value] of Object.entries(conf)) {
        if (Object.keys(shortcuts).includes(value)) {
            ret[key] = shortcuts[value];
        } else {
            ret[key] = value;
        }
    }
    return ret;
}

function fconf(config, testHooks = {}) {
    if (!config) {return;}

    // default configuration
    let defaultConf = testHooks.defaults || config.defaults;

    // command line arguments
    // flatten argv, only key,value like command line arguments (non positional) are supported
    let args = argv;
    if (testHooks.argv) {
        args = testHooks.argv;
    }
    const argsConf = computeArgsConf(args);

    // configuration file
    let fileConf = {};
    if (testHooks.fileConf) {
        fileConf = testHooks.fileConf;
    }
    else {
        fileConf = computeFileConf(config);
    }
    let userShortcuts = {};
    if (isObject(fileConf.shortcuts)) {
        userShortcuts = fileConf.shortcuts;
        delete fileConf.shortcuts;
    }

    // environment variables
    // environment variables gets into final return value only if it overrides a similar key
    let env = process.env;
    if (testHooks.env) {
        env = testHooks.env;
    }
    let envConf = computeEnvConf(defaultConf, fileConf, env);

    let conf = {...defaultConf, ...fileConf, ...envConf, ...argsConf};

    // compute shortcuts
    let ret = computeShortcuts(config, userShortcuts, conf);

    return ret;
}

module.exports = fconf;