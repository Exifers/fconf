const fconf = require('../index');

test('runs without crashing', () => {
    fconf();
    fconf({});
    fconf(true);
    fconf('foo');
});

test('argv wins', () => {
    const conf = fconf({}, {
        defaults: {c: 1},
        fileConf: {c: 2},
        env: {c: 3},
        argv: {_: ['a', 'b'], c: 4}
    });

    expect(conf.c).toBe(4);
});

test('env wins', () => {
    const conf = fconf({}, {
        defaults: {c: 1},
        fileConf: {c: 2},
        env: {c: 3}
    });

    expect(conf.c).toBe(3);
});

test('config file wins', () => {
    const conf = fconf({}, {
        defaults: {c: 1},
        fileConf: {c: 2}
    });

    expect(conf.c).toBe(2);
});

test('default wins', () => {
    const conf = fconf({}, {
        defaults: {c: 1}
    });

    expect(conf.c).toBe(1);
});

test('env to used case', () => {
    const conf = fconf({}, {
        defaults: {HelloWorld: 1},
        env: {HELLO_WORLD: 3}
    });

    expect(conf.HelloWorld).toBe(3);
});

test('shortcuts', () => {
    const conf = fconf(
        {
            shortcuts: {
                mustBeOne: 1,
                mustBeTwo: 2
            }
        },
        {
            defaults: {a: 'mustBeOne',b:'mustBeTwo'}
        });

    expect(conf.a).toBe(1);
    expect(conf.b).toBe(2);
});

test('user shortcuts', () => {
    const conf = fconf(
        {
            shortcuts: {
                mustBeOne: 1,
                mustBeTwo: 2
            }
        },
        {
            fileConf: {
                shortcuts: {
                    mustBeThree: 3,
                    mustBeFour: 4
                }
            },
            defaults: {a: 'mustBeThree',b:'mustBeFour'}
        });

    expect(conf.a).toBe(3);
    expect(conf.b).toBe(4);
});

test('user shortcuts override builtin shortcuts', () => {
    const conf = fconf(
        {
            shortcuts: {
                mustBeOne: 1,
                mustBeTwo: 2
            }
        },
        {
            fileConf: {
                shortcuts: {
                    mustBeOne: 3,
                    mustBeTwo: 4
                }
            },
            defaults: {a: 'mustBeOne',b:'mustBeTwo'}
        });

    expect(conf.a).toBe(3);
    expect(conf.b).toBe(4);
});

test('shortcuts and user shortcuts from command line', () => {
    const conf = fconf(
        {
            shortcuts: {
                mustBeOne: 1
            }
        },
        {
            fileConf: {
                shortcuts: {
                    mustBeTwo: 2
                }
            },
            argv: {a: 'mustBeOne',b:'mustBeTwo'}
        });

    expect(conf.a).toBe(1);
    expect(conf.b).toBe(2);
});

test('non positional arguments are undefined', () => {
    const conf = fconf({}, {argv: {_: ['a', 'b'], c: 1}});
    expect(conf.a).toBe(undefined);
    expect(conf.b).toBe(undefined);
});
