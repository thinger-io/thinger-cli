# thinger — Thinger.io CLI

A command-line tool for any [Thinger.io](https://thinger.io) server, and an
MCP server that lets AI assistants (Claude Code, Claude Desktop, Cursor…)
operate it with the permissions of your token.

- **CLI** — devices, products, buckets and profiles from a shell, with
  `--json` output for scripts.
- **MCP server** — `thinger mcp` serves ~50 typed `thinger_*` tools over
  stdio.

Both share the same profiles and API layer: sign in once, use either.

> Interim tool. The long-term Thinger MCP is built into the server itself;
> until then this CLI gives every Thinger server an MCP today.

## Installation

```bash
npm install -g @thinger-io/cli     # once published
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
thinger product property <id> [property]
thinger product property-set <id> <property> <json>
thinger product property-delete <id> <property>

thinger bucket list
thinger bucket read <bucket> [-d device] [-n 10] [-m minutes] [--agg 5m --agg-type mean]
```

Every command takes `-j, --json` and then prints `{ ok, data }` or
`{ ok: false, error: { message, code } }`.

## MCP server

```bash
claude mcp add thinger -- thinger mcp
# from source: claude mcp add thinger -- node /path/to/thinger-cli/bin/thinger.js mcp
```

Other hosts take the same command (`thinger`, args `["mcp"]`).

Tools: devices (list, info, create, delete, assign product), device
resources and properties, products and product properties, product
profiles (API resources, buckets, property handlers), buckets, user and
device tokens, alarm rules and instances, profiles. Every tool takes an
optional `profile`, and most an optional `user`.

## Shared core

`lib/core` holds everything that is not Thinger-specific: API client,
auth, profiles, REST helpers, the generic commands and the MCP tools. The
CLI only supplies its identity (`lib/identity.js`): binary name, config
folder, environment prefix, the token the password login creates, OAuth
client and MCP tool prefix. ThinRemote's `thinr` is built on the same code
with its own identity, so the two keep separate profiles and tool names and
can run side by side. The plan is to publish `lib/core` as a package both
depend on.

## Development

```bash
npm install
npm test           # node --test
npm run lint
npm run typecheck
```

## License

MIT
