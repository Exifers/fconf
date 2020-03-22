const { execSync } = require('child_process');
const fs = require('fs');
const glob = require('glob');

beforeEach(() => {
    execSync('yarn link 2>/dev/null');
    execSync('[ -d workbench ] || mkdir workbench');
    process.chdir('workbench');
});

afterEach(() => {
    process.chdir('..');
    execSync('rm -rf workbench');
});

test('integration', () => {
    // create cli package
    {
        execSync('[ -d cli ] || mkdir cli');
        process.chdir('cli');

        // create npm package
        execSync('yarn init -y 2>&1 1>/dev/null');

        // adding dependency
        execSync('yarn link fconf');

        execSync('yarn link 2>&1 1>/dev/null');

        process.chdir('..');
    }

    // create user package
    {
        execSync('[ -d user ] || mkdir user');
        process.chdir('user');

        // create npm package
        execSync('yarn init -y 2>/dev/null');

        execSync('yarn link cli');

        process.chdir('..');
    }

    // test
    {
        const datas = glob.sync('../__tests__/*.integration.data.js').map(filename => require(filename));

        process.chdir('user');

        for (const data of datas) {
            // create cli
            execSync('[ -d ../cli/bin ] || mkdir ../cli/bin');
            fs.writeFileSync('../cli/bin/index.js', data.cli);
            execSync('chmod +x ../cli/bin/index.js');

            // user file
            fs.writeFileSync(data.user.file.name, data.user.file.content);

            // user command
            const envString = Object.entries(data.user.env).map(([key,value]) => key + '=' + value).join(' ') + ' ';
            const output = execSync(envString + './node_modules/cli/bin/index.js ' + data.user.args).toString();

            expect(output).toBe(data.expected);
        }

        process.chdir('..');
    }
});