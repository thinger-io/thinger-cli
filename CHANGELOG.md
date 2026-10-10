# Changelog

## [Unreleased]

### Changed

- The core moved to its own package, `@thinger-io/cli-core`.
- Product properties: `product property-list <id>` and
  `product property-get <id> <property>` replace `product property`, matching
  thinr's names.
- npm package renamed to `@thinger-io/thinger-cli`.

## [0.1.0] - 2026-10-10

First version: the generic core of `thinr` (ThinRemote CLI 1.3.5), made
independent of the product and wrapped as the `thinger` CLI.

### Added

- Core parameterized by a CLI identity (name, config folder, environment
  prefix, login token, OAuth client, MCP tool prefix). `thinger` keeps its
  profiles in `~/.config/thinger-cli` and reads `THINGER_PROFILE` /
  `THINGER_INSECURE`.
- `login` with username/password (mints the `thinger_cli` API token), an
  existing token (non-interactive with `--server --username --token`) or the
  OAuth device flow with a client registered on the server.
- `logout` forgets the current profile (or `--all`) and revokes the API token
  the CLI created.
- Commands: `device` (list, info, create, delete, set-product, property,
  property-set, resource), `product` (list, info, create, delete, property,
  property-set, property-delete), `bucket` (list, read), `profile`.
- `thinger mcp` with the generic tools of thinr under the `thinger_` prefix,
  plus `thinger_device_create` and `thinger_buckets`.

### Changed (compared with thinr's core)

- The API base URL and token come from the profile active for each request,
  and the MCP `profile` argument is scoped per call, so concurrent tool calls
  against different profiles no longer share a process-wide switch.
- Servers may carry a scheme (`http://localhost:8080`); bare hosts mean HTTPS.
- The config file is written with mode 600.
- Device commands pass `--user` through to properties and resources.
