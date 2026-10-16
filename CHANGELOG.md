# Changelog

## [0.3.0] - 2026-10-16

### Added

- `thinger dashboard dev [url]`: develop a dashboard app on its own dev
  server (ng serve, Vite…) against a real server: a link with a temporary
  token opens the local app as a standalone page whose SDK calls the server
  directly.
- `thinger dashboard publish [dir]`: upload the build to a public storage
  and point dashboards at it (`--to`, repeatable; `--prune`, `--bump`,
  `--preview`, `--no-point`). Both read their settings from `thinger.json`.
- `thinger dashboard init <dir>`: a new dashboard app from a template of
  `@thinger-io/dashboard-sdk` (React or Angular, TypeScript), with its
  `thinger.json` and an `AGENTS.md`; `--ci` adds a GitHub workflow.
- Publish and dev warn when the app's SDK needs a newer server, a newer SDK
  is on npm, or a page loads the deprecated script build.
- MCP tools `thinger_dashboard_init` and `thinger_dashboard_dev` (25
  tools): the same for agents, which open the dev link with their browser
  tools.
- `THINGER_TOKEN` (an access token) and `THINGER_SERVER` replace the saved
  profile in every command and the MCP server (CI), unless `--profile` or
  `THINGER_PROFILE` names one; `thinger login` warns while `THINGER_TOKEN`
  is set.

### Changed

- Requires `@thinger-io/cli-core` 0.4.0.
- The guides for agents (`thinger_doc_read`: concepts, product code, server
  administration, the dashboard SDK reference and types) ship with the CLI
  and the SDK package instead of coming from the server, which stops
  serving `/sdk/`. Same ids; what needs a newer server says "since Thinger
  X".
- Preview links no longer come with a layout check link: the server
  retires `/sdk/preview.html`.

## [0.2.3] - 2026-10-14

### Changed

- `@thinger-io/cli-core` 0.3.0: `thinger_resource_call` gains the
  `alarm_instance` action `stats` (how many instances there are in each
  state); actions check their parent and id; `resource_list` pages lists
  answered whole from any `index`. The tools are the same 23.

## [0.2.2] - 2026-10-12

### Changed

- First release of `@thinger-io/cli` from GitHub Actions (Trusted Publishing,
  with provenance); 0.2.1 was published by hand to create the package.

## [0.2.1] - 2026-10-12

### Changed

- Published as `@thinger-io/cli` (formerly `@thinger-io/thinger-cli`, now
  deprecated). The command is still `thinger` and profiles stay in
  `~/.config/thinger-cli`.

## [0.2.0] - 2026-10-10

### Changed

- Requires `@thinger-io/cli-core` 0.2.0: the MCP server goes from 48 tools to
  23 (`thinger_resource_*` over a catalog of resource types, plus the
  operations that are not CRUD), less than half the size in `tools/list`.
  Tool names change: `thinger_devices` → `thinger_resource_list` with
  `type: "device"`, `thinger_profiles` → `thinger_profile_list`,
  `thinger_bucket_read` → `thinger_bucket_data_read`, and so on.
- MCP instructions rewritten for the new tools.


## [0.1.1] - 2026-10-10

### Changed

- Requires `@thinger-io/cli-core` 0.1.1. First release published from GitHub
  Actions through Trusted Publishing.

## [0.1.0] - 2026-10-10

First version: the `thinger` CLI, built on
[@thinger-io/cli-core](https://github.com/thinger-io/thinger-cli-core) (the generic
core of ThinRemote's `thinr`, made independent of the product).

### Added

- Thinger identity: profiles in `~/.config/thinger-cli`, `THINGER_PROFILE` /
  `THINGER_INSECURE`, MCP tools as `thinger_*`.
- `login` with username/password (mints the `thinger_cli` API token), an
  existing token (non-interactive with `--server --username --token`) or the
  OAuth device flow with a client registered on the server.
- `logout` forgets the current profile (or `--all`) and revokes the API token
  the CLI created.
- Commands: `device` (list, info, create, delete, set-product, property,
  property-set, resource), `product` (list, info, create, delete,
  property-list, property-get, property-set, property-delete), `bucket` (list,
  read), `profile`.
- `thinger mcp`: devices, resources, properties, products, product profiles,
  buckets, tokens, alarms and profiles.
