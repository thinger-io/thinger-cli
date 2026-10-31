import './setup.js';
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import api from '@thinger-io/cli-core/api';
import { buildProgram } from '@thinger-io/cli-core/cli';
import { checkGrammar } from '@thinger-io/cli-core/commands/grammar';
import { setJsonMode } from '@thinger-io/cli-core/output';
import { mcpInstructions } from '../lib/identity.js';

// The grammar and its checker live in cli-core; these check that the tree
// `thinger` runs (the core's commands under the thinger identity) follows
// it, and that its commands reach the server as the docs show them.
const build = () => buildProgram({ version: '0.0.0', mcpInstructions, strict: true });

/** A token whose user is `acme`, for the environment profile. */
const jwt = `x.${Buffer.from(JSON.stringify({ usr: 'acme' })).toString('base64url')}.y`;

before(() => {
    process.env.THINGER_TOKEN = jwt;
    process.env.THINGER_SERVER = 'http://stub';
});
after(() => {
    delete process.env.THINGER_TOKEN;
    delete process.env.THINGER_SERVER;
});

/** Throw instead of exiting on a parse error, in the whole tree. */
function throwing(cmd) {
    cmd.exitOverride();
    for (const sub of cmd.commands) throwing(sub);
    return cmd;
}

/** Run `thinger …` against a stubbed server answering `data`: the requests made. */
async function run(argv, data = {}) {
    const calls = [];
    const saved = { adapter: api.defaults.adapter, log: console.log };
    api.defaults.adapter = async (config) => {
        calls.push(config);
        return { data, status: 200, statusText: 'OK', headers: {}, config };
    };
    console.log = () => {};
    try {
        await throwing(build()).parseAsync(['node', 'thinger', ...argv]);
    } finally {
        api.defaults.adapter = saved.adapter;
        console.log = saved.log;
        setJsonMode(false);
    }
    return calls;
}

describe('thinger command grammar', () => {
    it('follows the grammar of cli-core', () => {
        assert.deepEqual(checkGrammar(build()), []);
    });

    it('sets a device property and updates a device through the generated commands', async () => {
        const set = await run(['device', 'property', 'set', 'boiler', 'setpoint', '21']);
        assert.equal(set[0].method, 'put');
        assert.match(set[0].url, /\/devices\/boiler\/properties\/setpoint$/);
        assert.deepEqual(JSON.parse(set[0].data), { value: 21 });

        const update = await run(['device', 'update', 'boiler', '-n', 'Boiler', '-s', 'x=1']);
        assert.equal(update[0].method, 'put');
        assert.deepEqual(JSON.parse(update[0].data), { x: 1, name: 'Boiler' });
    });

    it('reads the guides with doc list and doc get', async () => {
        const log = console.log;
        const printed = async (argv) => {
            const out = [];
            console.log = (line) => out.push(String(line));
            try {
                await throwing(build()).parseAsync(['node', 'thinger', ...argv]);
            } finally {
                console.log = log;
            }
            return out.join('\n');
        };
        assert.match(await printed(['doc', 'list']), /concepts/);
        assert.match(await printed(['doc', 'get', 'concepts']), /bucket/i);
    });

    it('no longer knows the 0.3 forms', async () => {
        const err = process.stderr.write;
        // @ts-ignore -- commander's error line
        process.stderr.write = () => true;
        try {
            for (const argv of [
                ['device', 'info', 'd1'],
                ['device', 'property-set', 'd1', 'p', '1'],
                ['device', 'property', 'd1'],
                ['device', 'resource', 'd1'],
                ['product', 'property-list', 'p1'],
                ['product', 'info', 'p1'],
            ]) {
                await assert.rejects(run(argv), /unknown command/, argv.join(' '));
            }
        } finally {
            process.stderr.write = err;
        }
    });
});
