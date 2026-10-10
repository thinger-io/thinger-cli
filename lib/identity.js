// @ts-check

/**
 * Identity of the `thinger` CLI. This is the only Thinger-specific piece:
 * everything else comes from @thinger-io/cli-core, shared with other CLIs
 * built on it (thinr), which pass their own identity.
 *
 * Profiles live apart from thinr's (~/.config/thinr-cli, THINR_*) on
 * purpose, so neither CLI's MCP server operates on the other's servers.
 *
 * @type {import('@thinger-io/cli-core/identity').CliIdentity}
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

- Server resources (devices, products, buckets, dashboards, tokens, alarms, properties…) are reached through thinger_resource_list / _get / _create / _update / _delete / _clone with a \`type\`. Start with thinger_resource_describe without arguments: it lists the types and, on servers that publish it, explains the platform's concepts (which data source fits each need, recipes). With a type it gives its fields and examples: call it before writing one for the first time.
- List before acting to discover ids (thinger_resource_list with type "device", "product", "bucket"…); never guess them.
- Device resources (the API a connected device's firmware exposes) are a different thing: thinger_device_resource_list / thinger_device_resource_call.
- Custom dashboards are HTML apps using the server's dashboard SDK: publish them with thinger_dashboard_publish (thinger_resource_describe type "dashboard" has the SDK reference).
- Every tool takes an optional \`profile\` (another configured server, see thinger_profile_list) and most take \`user\` (another account, admin only).
- Destructive tools (delete, overwrite) act immediately: confirm with the user first.`;
