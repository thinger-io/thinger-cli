// Shared test setup: imported first by every test file.
//
// Defines the thinger identity (the core refuses to run without one) and
// points HOME at a throwaway folder, so no test ever reads or writes the
// real profiles under ~/.config.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { defineIdentity } from '../lib/core/identity.js';
import { thingerIdentity } from '../lib/identity.js';

process.env.HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'thinger-cli-test-'));
delete process.env.THINGER_PROFILE;
defineIdentity(thingerIdentity);
