// @ts-check
import { Command } from 'commander';
import { setActiveProfile } from './config.js';
import { identity } from './identity.js';
import { classifyError, detectJsonModeFromArgv } from './output.js';
import { startMCPServer } from './mcp/server.js';
import { registerAuthCommands } from './commands/auth.js';
import { registerProfileCommands } from './commands/profile.js';
import { registerDeviceCommands } from './commands/device.js';
import { registerProductCommands } from './commands/product.js';
import { registerBucketCommands } from './commands/bucket.js';

/**
 * Build and run a CLI on top of the core: global options, the generic
 * commands (login, logout, profile, device, product, bucket) and `mcp`.
 * The identity must be defined before calling it.
 *
 * @param {{
 *   version: string,
 *   argv?: string[],
 *   register?: (program: Command) => void,
 *   mcpTools?: Array<object>,
 *   mcpInstructions?: string,
 * }} opts
 *   `register` adds the CLI's own commands; `mcpTools` its own MCP tools.
 */
export async function runCli({
    version,
    argv = process.argv,
    register,
    mcpTools = [],
    mcpInstructions,
}) {
    const id = identity();

    // Pick up --profile early so subsequent config reads use the right one.
    // Commander parses options later, but the config is touched before that.
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--') break;
        if (a === '--profile' && argv[i + 1]) {
            setActiveProfile(argv[i + 1]);
            break;
        }
        if (a.startsWith('--profile=')) {
            setActiveProfile(a.slice('--profile='.length));
            break;
        }
    }

    // Set JSON mode before any command runs so spinners/logs can opt out.
    detectJsonModeFromArgv(argv);

    const program = new Command();
    program
        .name(id.name)
        .description(id.description)
        .version(version)
        .option('-u, --user <username>', 'API user override (admin impersonation)')
        .option('--profile <name>', 'Configuration profile to use (defaults to the saved default)');

    registerDeviceCommands(program);
    registerProductCommands(program);
    registerBucketCommands(program);
    registerAuthCommands(program);
    registerProfileCommands(program);
    register?.(program);

    program
        .command('mcp')
        .helpGroup('Integration:')
        .description('Start the MCP server (stdio) for AI tool integration')
        .action(async () => {
            try {
                await startMCPServer({ version, tools: mcpTools, instructions: mcpInstructions });
            } catch (error) {
                console.error(`Error: ${classifyError(error).message}`);
                process.exit(1);
            }
        });

    if (argv.length <= 2) {
        program.help();
    }
    await program.parseAsync(argv);
}
