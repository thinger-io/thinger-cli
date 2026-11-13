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
        'CLI for Thinger.io servers — devices, products, buckets, dashboard apps, with an MCP server for AI clients',
    configDir: 'thinger-cli',
    npmPackage: '@thinger-io/cli',
    envPrefix: 'THINGER',
    token: { id: 'thinger_cli', name: 'Thinger CLI' },
    // "Thinger CLI", the OAuth client Thinger 7.5.0 and later create on
    // every install. Older servers lack it: the login then offers username
    // and password or a token.
    oauth: { clientId: '3b40164d28730e416cbe' },
    defaultServer: null,
    mcp: { serverName: 'thinger', toolPrefix: 'thinger' },
};

/** Server-level guidance sent to MCP clients on `initialize`. */
export const mcpInstructions = `Tools to operate a Thinger.io IoT server with the permissions of the token stored in the CLI profile.

- Everything is a resource type behind eight tools: thinger_resource_list / _get / _create / _update / _delete / _clone, and thinger_resource_call for actions. Start with thinger_resource_describe without arguments: it lists the types with their ids, operations and actions and explains the platform's concepts (which data source fits each need, recipes). Each type's ids, filter, bodies, actions and ready-to-send examples are in thinger_resource_describe with that type: read it before the first call on a type.
- A record is located by \`ids\`, one key per level: {"device": "d1"}, {"device": "d1", "property": "setpoint"}, {"product": "p1", "resource": "temp"}. The records the tools answer carry their ids: pass them back as they are.
- List before acting to discover ids (thinger_resource_list with type "device", "product", "bucket"…); never guess them.
- Data and files are types too: a bucket's time series is "bucket_data" (list reads it, create writes samples), a storage's files "storage_file". Device resources (the API a connected device's firmware exposes) are "device_resource": list them, and run one with thinger_resource_call action "call".
- Guides: thinger_resource_list type "doc", then thinger_resource_get type "doc" with ids {"doc": <id>} (concepts, product-code, server-admin, dashboard-sdk…). Read the relevant one before building something new.
- Custom dashboards are web apps on the dashboard SDK, the npm package @thinger-io/dashboard-sdk (reference: thinger_resource_describe type "dashboard", or the guide "dashboard-sdk"). thinger_resource_call on type "dashboard": action "init" starts one (a TypeScript project from a template of the SDK), "dev" develops it on its own dev server (start the dev server first; the link opens the local app against the server with a temporary token: open it with browser tools to see it and read its console), and "publish" uploads the build folder once it works.
- Every tool takes an optional \`profile\` (another configured server or account, see thinger_resource_list type "profile"; read what each profile is for in its description before using one other than the default) and most take \`user\` (another account, admin only).
- Deletes and most actions act immediately: confirm with the user before deleting, overwriting, or running an action that changes, removes or notifies. Actions that change a lot at once (replace_all, a host's settings or restart, removing a plugin) answer a plan first: show it to the user and repeat the call with confirm: true only if they agree.`;
