import './setup.js';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTools } from '@thinger-io/cli-core/mcp/registry';
import { mcpInstructions } from '../lib/identity.js';

// The registry itself is tested in cli-core; these check what the thinger
// identity serves.
const tools = buildTools();
const listed = JSON.stringify({ tools: tools.map(({ handler: _h, ...t }) => t) });

describe('thinger MCP tools', () => {
    it('carry the thinger_ prefix, once each', () => {
        const names = tools.map((t) => t.name);
        assert.equal(new Set(names).size, names.length, 'duplicate tool name detected');
        for (const name of names) assert.match(name, /^thinger_[a-z0-9_]+$/);
    });

    // Descriptions are what the model reads: a leftover placeholder or a
    // reference to another CLI's tools sends it after tools it doesn't have.
    it('describe only this CLI', () => {
        assert.doesNotMatch(listed, /\{(tool|family):/);
        assert.doesNotMatch(listed, /thinr|ThinRemote/i);
    });

    // Clients that load every tool up front (Claude Desktop, claude.ai,
    // Cursor) pay for tools/list in every conversation: keep it well under
    // 10,000 tokens (about 36,000 characters of JSON).
    it('fit in the tools/list budget', () => {
        assert.ok(listed.length < 36_000, `tools/list is ${listed.length} characters`);
    });

    it('instructions name tools that exist', () => {
        const names = new Set(tools.map((t) => t.name));
        for (const ref of mcpInstructions.match(/thinger_[a-z_]+/g) || []) {
            assert.ok(names.has(ref), `instructions mention ${ref}`);
        }
    });
});
