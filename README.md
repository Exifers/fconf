# fconf

[![npm version](https://img.shields.io/npm/v/fconf.svg?style=flat-square)](https://www.npmjs.com/package/fconf)
[![install size](https://badgen.net/packagephobia/install/fconf)](https://packagephobia.now.sh/result?p=fconf)
[![downloads](https://img.shields.io/npm/dm/fconf.svg?style=flat-square)](https://npm-stat.com/charts.html?package=fconf)

This is a hierarchical configuration loader for node.js, meant to be used in a CLI.

This one is quite small, it *handles javascript functions as configuration options*, with an alias system to eventually choose which function to use from command line arguments.

## Hierarchy system
- default configuration *you hard-code it*
- user configuration file
- user ENV
- user command line arguments

The latter overrides the preceding one, etc.

## Install

```bash
// with yarn
yarn add fconf

// with npm
npm install fconf
```

## Usage

The CLI tool :
```javascript
#! /usr/bin/env node

const fconf = require('fconf');

const configuration = fconf({
  filename: 'clitoolname.conf.js',
  defaults: {
    inputQty: 1,
    outputFile: 'out.json',
    transformQty: qty => qty *  2
  }
});

console.log(configuration);
console.log(configuration.transformQty(configuration.inputQty));
```
This makes each options to be configurable by configuration file, environment variables and command line arguments.
```bash
$ cliToolName
{
  inputQty: 1,
  outputFile: 'out.json',
  transformQty: [Function: transformQty],
  '$0': 'cliToolName'
}
2

$ OUTPUT_FILE='data.json' cliToolName --input-qty=3
{
  inputQty: 3,
  outputFile: 'data.json',
  transformQty: [Function: transformQty],
  '$0': 'cliToolName'
}
6
```

Let's say the user have a file ```clitoolname.conf.js``` now in his/her project directory :
```bash
// clitoolname.conf.js
module.exports = {
  inputQty: 2,
  transformQty: qty => qty * 4
}

$ cliToolName
{
  inputQty: 2,
  outputFile: 'out.json',
  transformQty: [Function: transformQty], // this will multiply by 4 now
  '$0': 'cliToolName'
}
8
```

## Shortcut system
The only way the user can provide functions in through the configuration file. We can't provide javascript functions through environment or command line arguments.

To make functions arguments still flexible we made a simple shortcut system. You can hard-code it the CLI:
```javascript
#! /usr/bin/env node

const fconf = require('fconf');

const configuration = fconf({
  filename: 'clitoolname.conf.js',
  defaults: {
    inputQty: 1,
    outputFile: 'out.json',
    transformQty: 'double' // it will be replaced by the matching shortcut function
  },
  shortcuts: {
    double: qty => qty *  2,
    triple: qty => qty *  3,
    quadruple: qty => qty * 4
  }
});

console.log(configuration);
console.log(configuration.transformQty(configuration.inputQty));
```
The user can also use it :
```bash
$ cliToolName
{
  inputQty: 1,
  outputFile: 'out.json',
  transformQty: [Function: transformQty], // this will multiply by 2
  '$0': 'cliToolName'
}
2

$ cliToolName --transform-qty=triple
{
  inputQty: 1,
  outputFile: 'out.json',
  transformQty: [Function: transformQty], // this will multiply by 3
  '$0': 'cliToolName'
}
3
```
The user can make his own shortcuts in the configuration file :
```bash
// clitoolname.conf.js
module.exports = {
  inputQty: 2,
  transformQty: 'quintuple'
}
module.exports.shortcuts = {
  quintuple: qty => qty * 5
}

$ cliToolName
{
  inputQty: 2,
  outputFile: 'out.json',
  transformQty: [Function: transformQty], // this will multiply by 5
  '$0': 'cliToolName'
}
10
```

## Todo
Generate help display.