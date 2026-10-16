# thinger — Thinger.io CLI

A command-line tool for any [Thinger.io](https://thinger.io) server, and an
MCP server that lets AI assistants (Claude Code, Claude Desktop, Cursor…)
operate it with the permissions of your token.

- **CLI** — devices, products, buckets, dashboard apps and profiles from a
  shell, with `--json` output for scripts.
- **MCP server** — `thinger mcp` serves 25 `thinger_*` tools over
  stdio.

Both share the same profiles and API layer: sign in once, use either.

> Interim tool. The long-term Thinger MCP is built into the server itself;
> until then this CLI gives every Thinger server an MCP today.

## Installation

```bash
npm install -g @thinger-io/cli
# or, from source
git clone https://github.com/thinger-io/thinger-cli.git && cd thinger-cli && npm install && npm link
```

Requires Node.js 20 or newer.

## Signing in

```bash
thinger login                       # interactive: username/password, token or OAuth
thinger login --server acme.aws.thinger.io --username alice --token <API token>
```

- **Username and password** — creates (or replaces) an API token named
  _Thinger CLI_ (id `thinger_cli`) on your account and stores it. `thinger
logout` revokes it.
- **Token** — paste an existing API token; it is validated and stored as is.
- **OAuth** — browser device flow. Needs an OAuth client registered on the
  server (`--client-id`); Thinger servers ship none by default yet.

The server is a host (`acme.aws.thinger.io`, HTTPS) or a full URL for plain
HTTP or custom ports (`http://localhost:8080`). Self-signed certificates are
accepted for `localhost`, or anywhere with `THINGER_INSECURE=1`.

## Profiles

Each profile is a server plus its credentials, stored in
`~/.config/thinger-cli/config.json` (mode 600).

```bash
thinger profile add staging        # sign in to another server
thinger profile list
thinger profile use staging        # change the default
thinger --profile staging device list
THINGER_PROFILE=staging thinger device list
```

`-u, --user <account>` addresses another account on the same server when
your profile has admin rights.

`THINGER_TOKEN` (an access token) and `THINGER_SERVER` stand for a profile
in every command and in the MCP server, for CI: they replace the saved
profile unless `--profile` or `THINGER_PROFILE` names one, and
`thinger login` warns while `THINGER_TOKEN` is set.

## Commands

```bash
thinger device list [pattern]                  # regex on id/name
thinger device info <id>
thinger device create <id> [-t Generic|MQTT|HTTP|Virtual|Subdevice] [-p product]
thinger device delete <id> [-y]
thinger device set-product <id> <product>
thinger device property <id> [property] [-f dot.path]
thinger device property-set <id> <property> <json>
thinger device resource <id> [resource] [-i key=value …]

thinger product list | info <id> | delete <id>
thinger product create <id> [--from product.json]   # { config, profile }
thinger product property-list <id>
thinger product property-get <id> <property>
thinger product property-set <id> <property> <json>
thinger product property-delete <id> <property>

thinger bucket list
thinger bucket read <bucket> [-d device] [-n 10] [-m minutes] [--agg 5m --agg-type mean]
```

Every command takes `-j, --json` and then prints `{ ok, data }` or
`{ ok: false, error: { message, code } }`.

## Dashboard apps

Custom dashboards are web apps (React, Angular…) built on the dashboard SDK,
[`@thinger-io/dashboard-sdk`](https://www.npmjs.com/package/@thinger-io/dashboard-sdk).
Create one from a template, develop it on its own dev server against a real
server, and publish it when it works:

```bash
thinger dashboard init greenhouse --to device:gh_01   # --template angular, --ci, --install
cd greenhouse && npm install
npm run dev                     # Angular: npm start. Leave it running
thinger dashboard dev --open    # in another terminal
npm run build && thinger dashboard publish
```

`dashboard init` copies a template of the SDK package (`react` by default,
`angular`) from its latest release on npm (offline, the copy the CLI
installs; `--from` takes another version or tag, or a folder or .tgz of it) into a new
folder, with the SDK as a dependency, a `thinger.json` for the commands
below (storage `app_<folder>_<random>` unless `--storage`), and an `AGENTS.md`
(with a `CLAUDE.md` pointing at it) with the rules of the console's frame
for the agents that work on it. `--ci` adds a GitHub workflow that
publishes it.

`dashboard dev` prints (or opens) a link to your local app that runs it as a
standalone page against the server, in the context you pick (`--device`,
`--product`, `--asset-type`, `--asset-group`, `--project`, or
`--to device:<id>`; by default the first destination in `thinger.json`):
the SDK calls the server directly with a temporary token with full access
to your account (to the project with `--project`; 8 h, `--hours`; the next
link for the same project replaces it), so writes are real. The url must
be on this machine (localhost) unless you pass `--allow-remote`: the link
carries that token. Your dev server
keeps reloading the app and the browser's tools show its errors. The app
bundles the dashboard SDK, so its dev server needs no proxy, and the SDK
takes the server from the link.

Outside the console's sandboxed iframe, localStorage, cookies and a `<base>`
tag work: don't rely on them, they fail once published.

`dashboard publish` uploads the build folder to a public storage and points
the destinations at it (`dashboard:<id>`, `device:<id>`, `product:<id>`,
`asset_type:<id>`, `asset_group:<id>`, `project:<id>`; repeat `--to` for
several). `--preview` adds standalone review links with a read-only token.
Both commands warn when the app's SDK needs a newer server than the
profile's, when a newer SDK is on npm, or when the page loads the
deprecated script build (`thinger-dashboard.js`).

A `thinger.json` next to the app keeps the settings of these commands, so
they run without arguments (`dev.context` defaults to the first
destination's; `dev.route` and `dev.hours` are optional too):

```json
{
    "dashboard": {
        "dir": "dist",
        "storage": "app_greenhouse",
        "prune": true,
        "to": [{ "type": "device", "id": "gh_01", "route": "/" }],
        "dev": { "url": "http://localhost:5173/" }
    }
}
```

To publish from CI, set the repository variable `THINGER_SERVER` and the
secret `THINGER_TOKEN` (an access token allowed to write storages and
dashboards, or the resources' `dashboard` property); `dashboard init --ci`
writes this workflow:

```yaml
# .github/workflows/dashboard.yml
name: Publish dashboard
on:
    push:
        branches: [main]
jobs:
    publish:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-node@v4
              with:
                  node-version: 22
            - run: npm ci && npm run build
            - run: npx -y @thinger-io/cli dashboard publish
              env:
                  THINGER_SERVER: ${{ vars.THINGER_SERVER }}
                  THINGER_TOKEN: ${{ secrets.THINGER_TOKEN }}
```

## MCP server

```bash
claude mcp add thinger -- thinger mcp
# without installing it: claude mcp add thinger -- npx -y @thinger-io/cli mcp
# from source: claude mcp add thinger -- node /path/to/thinger-cli/bin/thinger.js mcp
```

Other hosts take the same command (`thinger`, args `["mcp"]`), or
`npx` with args `["-y", "@thinger-io/cli", "mcp"]`.

Tools:

- `thinger_resource_describe`, `_list`, `_get`, `_create`, `_update`,
  `_delete`, `_clone`, `_call` — every server resource by `type`: devices,
  products, buckets, dashboards, endpoints, storages, asset types and
  groups, projects and their members, tokens, alarms, claims, properties,
  their children, and the server's administration (users, hosts, domains,
  brands, OAuth clients, identity providers, proxies). `resource_call` runs
  actions such as verifying a domain, calling an endpoint or testing an
  alarm rule. `resource_describe` shows a type's fields, examples and
  actions, read from the server's own API description.
- `thinger_bucket_data_read` / `_write`, `thinger_device_resource_list` /
  `_call`, `thinger_device_data_send`, `thinger_device_overview`,
  `thinger_product_resource_call`, `thinger_plugin_call`,
  `thinger_storage_file_list` / `_read` / `_write` / `_delete`,
  `thinger_dashboard_init` / `_dev` / `_publish`, `thinger_doc_read`,
  `thinger_profile_list`. `thinger_dashboard_dev` gives an agent the dev
  link above: with browser tools it opens the app, reads its console and
  iterates, then publishes it once.

Every tool takes an optional `profile`, and most an optional `user`.

## Shared core

Everything that is not Thinger-specific — API client, auth, profiles, REST
helpers, the generic commands and the MCP tools — lives in
[@thinger-io/cli-core](https://github.com/thinger-io/thinger-cli-core). This CLI only
supplies its identity (`lib/identity.js`): binary name, config folder,
environment prefix, the token the password login creates, OAuth client and
MCP tool prefix. ThinRemote's `thinr` is built on the same core with its own
identity, so the two keep separate profiles and tool names and can run side
by side.

## Development

```bash
npm install
npm test           # node --test
npm run lint
npm run typecheck
```

## License

MIT
