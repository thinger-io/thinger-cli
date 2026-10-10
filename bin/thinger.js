#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { defineIdentity } from '@thinger-io/cli-core/identity';
import { runCli } from '@thinger-io/cli-core/cli';
import { mcpInstructions, thingerIdentity } from '../lib/identity.js';

// Single source of truth for the version: package.json.
const pkg = JSON.parse(
    readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../package.json'), 'utf8'),
);

defineIdentity(thingerIdentity);
await runCli({ version: pkg.version, mcpInstructions });
