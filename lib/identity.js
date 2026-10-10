// @ts-check

/**
 * Identity of the `thinger` CLI. This is the only Thinger-specific piece:
 * everything under lib/core is shared with other CLIs built on the same
 * core (thinr), which pass their own identity.
 *
 * Profiles live apart from thinr's (~/.config/thinr-cli, THINR_*) on
 * purpose, so neither CLI's MCP server operates on the other's servers.
 *
 * @type {import('./core/identity.js').CliIdentity}
 */
export const thingerIdentity = {
    name: 'thinger',
    displayName: 'Thinger.io',
    description:
        'CLI for Thinger.io servers — devices, products, buckets, with an MCP server for AI clients',
    configDir: 'thinger-cli',
    envPrefix: 'THINGER',
    token: { id: 'thinger_cli', name: 'Thinger CLI' },
    // No OAuth client ships with Thinger servers yet: the browser login asks
    // for one registered on the instance.
    oauth: { clientId: null },
    defaultServer: null,
    mcp: { serverName: 'thinger', toolPrefix: 'thinger' },
};

/** Server-level guidance sent to MCP clients on `initialize`. */
export const mcpInstructions = `Tools to operate a Thinger.io IoT server with the permissions of the token stored in the CLI profile.

- Start with thinger_devices / thinger_products / thinger_buckets to discover ids; never guess them.
- Every tool takes an optional \`profile\` (another configured server, see thinger_profiles) and most take \`user\` (another account, admin only).
- Destructive tools (delete, overwrite) act immediately: confirm with the user first.`;
