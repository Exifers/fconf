module.exports = {
    cli:
`#! /usr/bin/env node

const fconf = require('fconf');

const configuration = fconf({
    filename: 'theCli.conf.js',
    defaults: {
        value: 1,
        value2: 2,
        value3: 3
    }
});

console.log(configuration);
`,
    user: {
        file: {
            name: 'theCli.conf.js',
            content:
`
module.exports = {
    value: 2
};
`
        },
        env: {
            VALUE: 3
        },
        args: '--value=4'
    },
    expected:
`{
  value: 4,
  value2: 2,
  value3: 3,
  '$0': 'node_modules/cli/bin/index.js'
}
`
};