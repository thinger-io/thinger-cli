import './setup.js';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { defineIdentity, env, identity, loginHint } from '@thinger-io/cli-core/identity';
import { thingerIdentity } from '../lib/identity.js';

describe('identity', () => {
    it('is the thinger one in these tests', () => {
        assert.equal(identity().name, 'thinger');
        assert.equal(identity().configDir, 'thinger-cli');
        assert.equal(loginHint(), 'Run `thinger login` to sign in.');
    });

    it('reads environment variables under its own prefix', () => {
        process.env.THINGER_INSECURE = '1';
        process.env.THINR_INSECURE = '0';
        try {
            assert.equal(env('INSECURE'), '1');
        } finally {
            delete process.env.THINGER_INSECURE;
            delete process.env.THINR_INSECURE;
        }
    });

    it('rejects a token id the server would refuse', () => {
        assert.throws(
            () => defineIdentity({ ...thingerIdentity, token: { id: 'Thinger CLI', name: 'x' } }),
            /token id/,
        );
        // The failed definition must not replace the current one.
        assert.equal(identity().token.id, 'thinger_cli');
    });

    it('rejects a missing field', () => {
        assert.throws(() => defineIdentity({ ...thingerIdentity, configDir: '' }), /configDir/);
    });

    it('is frozen', () => {
        assert.throws(() => {
            'use strict';
            identity().name = 'other';
        });
    });
});
