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
    it('are the eight resource tools, with the thinger_ prefix', () => {
        assert.deepEqual(
            tools.map((t) => t.name).sort(),
            ['call', 'clone', 'create', 'delete', 'describe', 'get', 'list', 'update'].map(
                (v) => `thinger_resource_${v}`,
            ),
        );
    });

    // Descriptions are what the model reads: a leftover placeholder or a
    // reference to another CLI's tools sends it after tools it doesn't have.
    it('describe only this CLI', () => {
        assert.doesNotMatch(listed, /\{(tool|family):/);
        assert.doesNotMatch(listed, /thinr|ThinRemote/i);
    });

    // Clients that load every tool up front (Claude Desktop, claude.ai,
    // Cursor) pay for tools/list in every conversation: keep it well under
    // 5,000 tokens (about 20,000 characters of JSON).
    it('fit in the tools/list budget', () => {
        assert.ok(listed.length < 20_000, `tools/list is ${listed.length} characters`);
    });

    it('instructions name tools that exist', () => {
        const names = new Set(tools.map((t) => t.name));
        for (const ref of mcpInstructions.match(/thinger_[a-z_]+/g) || []) {
            assert.ok(names.has(ref), `instructions mention ${ref}`);
        }
    });

    it('instructions name types and actions that exist', () => {
        const schema = (name) => tools.find((t) => t.name === name).inputSchema.properties;
        const types = new Set(schema('thinger_resource_describe').type.enum);
        const actions = new Set(schema('thinger_resource_call').action.enum);
        const named = [...mcpInstructions.matchAll(/type "([a-z_]+)"/g)].map((m) => m[1]);
        named.push(...[...mcpInstructions.matchAll(/is "([a-z_]+)"/g)].map((m) => m[1]));
        assert.ok(named.length > 5);
        for (const type of named) assert.ok(types.has(type), `instructions mention type ${type}`);
        for (const [, action] of mcpInstructions.matchAll(/action "([a-z_]+)"/g)) {
            assert.ok(actions.has(action), `instructions mention action ${action}`);
        }
        assert.doesNotMatch(mcpInstructions, /\b(parent|id) "/);
    });
});
