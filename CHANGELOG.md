# Changelog

## [0.1.0] - 2026-10-10

First version: the `thinger` CLI, built on
[@thinger-io/cli-core](https://github.com/thinger-io/cli-core) (the generic
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
