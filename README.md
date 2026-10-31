# thinger — Thinger.io CLI

A command-line tool for any [Thinger.io](https://thinger.io) server, and an
MCP server that lets AI assistants (Claude Code, Claude Desktop, Cursor…)
operate it with the permissions of your token.

- **CLI** — devices, products, buckets, dashboard apps and profiles from a
  shell, with `--json` output for scripts.
- **MCP server** — `thinger mcp` serves eight `thinger_resource_*` tools
  over stdio.

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
thinger login                       # interactive: OAuth (browser), username/password or token
thinger login --server acme.aws.thinger.io --username alice --token <API token>
```

- **Username and password** — creates (or replaces) an API token named
  _Thinger CLI_ (id `thinger_cli`) on your account and stores it. `thinger
logout` revokes it.
- **Token** — paste an existing API token; it is validated and stored as is.
- **OAuth** — browser device flow, offered first. It uses the _Thinger CLI_
  OAuth client that Thinger 7.5.0 and later create on every install; on an
  older server the login says so and offers the other two ways.

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

Every command reads the same way: nouns, then a verb, then the ids,
outermost first.

```
thinger <noun> [<noun>…] <verb> [<parent ids>…] [<id>] [options]
```

```bash
thinger device list [--search sensor] [--filter product=meteo]
thinger device get <device> [-f connection.active]
thinger device create <device> [-t Generic|MQTT|HTTP|Virtual|Subdevice] [-p product] [-n name]
thinger device update <device> [-n name] [-s key=value …] [--from device.json]
thinger device delete <device> [-y]
thinger device set-product <device> <product>
thinger device property list <device>
thinger device property get <device> <property> [-f value.setpoint]
thinger device property set <device> <property> <json>
thinger device resource list <device>
thinger device resource call <device> <resource> [-s key=value …] [-f field]
thinger device send <device> -s temperature=21.5     # as an HTTP device
thinger device bucket tag list <device> <bucket>

thinger product list | get <product> | delete <product>
thinger product create <product> [--from product.json]   # { config, profile }
thinger product property list|get|set|delete <product> [property] [value]
thinger product profile api list <product>
thinger product profile bucket create <product> <bucket> --from bucket.json
thinger product profile api call <product> <resource> [--from payload.json]
thinger product export <product> -o product.json
thinger product apply --from product.json      # create or update: profile, properties

thinger bucket list
thinger bucket read <bucket> [-d device] [-n 10] [-m minutes] [--agg 5m --agg-type mean]
thinger bucket write <bucket> --from samples.ndjson     # or -s temperature=21.5
thinger bucket export <bucket> -o data.csv [--format csv|json|arff]
thinger bucket export-file list <bucket>

thinger storage file list <storage> [folder]
thinger storage file upload <storage> ./dist [--to web]
thinger storage file download <storage> <path> [-o file]
thinger storage file delete <storage> <path> [-y]

thinger plugin call <plugin> [path] [-X post] [--from body.json]
```

Every resource type the MCP server reaches has its commands, generated from
the same catalog, with the verbs it supports and its actions. Child types
nest under their parent (`device property`, `device bucket tag`,
`product profile api`, `project member`, `sync lock`) and server types go
under `admin`:

```bash
thinger <noun…> list [parents…] [--search text] [--filter key=value] [--count n]
thinger <noun…> get [parents…] <id> [-f dot.path] [-o file]
thinger <noun…> create [parents…] [id] [-n name] [-d text] [--from file.json] [-s key=value …]
thinger <noun…> update [parents…] <id> [--from file.json] [-s key=value …] [--merge]
thinger <noun…> delete [parents…] <id> [-y]
thinger <noun…> clone [parents…] <id> <new-id>
thinger <noun…> set [parents…] <property> <json>   # properties only
thinger <noun…> describe                          # fields and examples, from the server
thinger <noun…> <action> [parents…] [id] [--from file.json] [-q key=value]

thinger endpoint call notify -s message=hello
thinger token create ci -n CI -s expire='"30d"' -s 'allow={"Device":{"*":"*"}}'
thinger alarm rule test overheat
thinger device property update boiler setpoint -s value.target=21 --merge
thinger asset type property set boiler max_temp 90
thinger admin host get-settings <host>              # server types, for admins
```

`-s` values are parsed as JSON when they are (`21`, `true`, `{"a":1}`;
quote strings that look like numbers: `-s code='"007"'`) and dots nest
(`-s data.source=resource`).

Anything else the API offers, with `thinger api` (`{user}` is the account):

```bash
thinger api /v1/users/{user}/products/boiler/firmwares
thinger api -X PUT /v1/users/{user}/devices/sensor1 -s enabled=false
thinger api /v2/users/{user}/storages/web/files/logo.png -o logo.png
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

Tools: `thinger_resource_describe`, `_list`, `_get`, `_create`,
`_update`, `_delete`, `_clone` and `_call` (actions). Each takes a `type`
and the record's `ids`, one key per level (`{"device": "d1"}`,
`{"device": "d1", "property": "setpoint"}`,
`{"product": "p1", "resource": "temp"}`):

- The server's resources: devices, products, buckets, dashboards,
  endpoints, storages, asset types and groups, projects and their members,
  tokens, alarms, claims, plugins, properties, their children, and the
  server's administration (users, hosts, domains, brands, OAuth clients,
  identity providers, proxies). `resource_call` runs their actions, such as
  verifying a domain, calling an endpoint or testing an alarm rule.
- Data and files: `bucket_data` (list reads a bucket, create writes
  samples), `storage_file` (a storage's files; uploads folders of this
  machine), `device_resource` (a connected device's resources: list, and
  the `call` action); actions `device` `send` and `overview`,
  `product_profile_api` `call` and `plugin` `call`.
- `doc` (the guides for agents), `profile` (the configured servers) and the
  `dashboard` actions `init`, `dev` and `publish`. `dev` gives an agent the
  dev link above: with browser tools it opens the app, reads its console
  and iterates, then publishes it once.

`resource_describe` lists the types with their ids and examples; with a
type it shows its fields, filter, actions, the permission each operation
needs and ready-to-send calls, read from the server's own API description.
Actions that change a lot at once (`replace_all`, a host's settings or
restart, removing a plugin) answer a plan and run with `confirm: true`.
Every tool takes an optional `profile`, and most an optional `user`.
`thinger mcp --read-only` (or `THINGER_MCP_READ_ONLY=1`) serves only what
reads: describe, list, get and the actions that change nothing.

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
