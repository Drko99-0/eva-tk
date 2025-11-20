#!/usr/bin/env node

/**
 * eva-tk CLI
 * Command-line interface for capturing eva-tk JWT tokens
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import { ChromeProfileDetector } from '../core/chrome-profile-detector.js';
import { LevelDBReader } from '../core/leveldb-reader.js';
import { TokenMonitor } from '../core/token-monitor.js';
import { TokenStorage } from '../core/token-storage.js';
import { JWTDecoder } from '../utils/jwt-decoder.js';

/**
 * Main CLI application
 */
async function main() {
  await yargs(hideBin(process.argv))
    .scriptName('eva-tk')
    .usage('$0 <command> [options]')
    .command(
      'monitor [profile]',
      'Monitor Chrome Local Storage for eva-tk tokens in real-time',
      (yargs) => {
        return yargs
          .positional('profile', {
            describe: 'Chrome profile name (e.g., "Profile 2", "Default")',
            type: 'string',
          })
          .option('all', {
            alias: 'a',
            describe: 'Monitor all Chrome profiles',
            type: 'boolean',
            default: false,
          })
          .option('interval', {
            alias: 'i',
            describe: 'Check interval in milliseconds',
            type: 'number',
            default: 500,
          })
          .option('no-save', {
            describe: 'Disable automatic saving of captured tokens',
            type: 'boolean',
            default: false,
          })
          .option('verbose', {
            alias: 'v',
            describe: 'Enable verbose output',
            type: 'boolean',
            default: false,
          });
      },
      async (argv) => {
        await handleMonitor(argv);
      }
    )
    .command(
      'extract [profile]',
      'Extract eva-tk token from Chrome Local Storage (one-time)',
      (yargs) => {
        return yargs
          .positional('profile', {
            describe: 'Chrome profile name',
            type: 'string',
          })
          .option('all', {
            alias: 'a',
            describe: 'Try all Chrome profiles',
            type: 'boolean',
            default: false,
          })
          .option('save', {
            alias: 's',
            describe: 'Save extracted token',
            type: 'boolean',
            default: false,
          });
      },
      async (argv) => {
        await handleExtract(argv);
      }
    )
    .command(
      'profiles',
      'List all detected Chrome profiles',
      {},
      async () => {
        await handleListProfiles();
      }
    )
    .command(
      'decode <token>',
      'Decode a JWT token',
      (yargs) => {
        return yargs.positional('token', {
          describe: 'JWT token to decode',
          type: 'string',
        });
      },
      async (argv) => {
        await handleDecode(argv);
      }
    )
    .command(
      'show-latest',
      'Show the latest captured token',
      {},
      async () => {
        await handleShowLatest();
      }
    )
    .command(
      'history',
      'Show token capture history',
      {},
      async () => {
        await handleHistory();
      }
    )
    .demandCommand(1, 'You must provide a command')
    .help()
    .alias('help', 'h')
    .version('0.1.0')
    .alias('version', 'V')
    .strict()
    .parse();
}

/**
 * Handle monitor command
 */
async function handleMonitor(argv: any) {
  console.log(chalk.cyan('\n🚀 eva-tk Token Monitor\n'));

  const detector = new ChromeProfileDetector();
  const monitor = new TokenMonitor();

  try {
    if (argv.all) {
      // Monitor all profiles
      const profiles = detector.getActiveProfiles();

      if (profiles.length === 0) {
        console.log(chalk.red('❌ No Chrome profiles with Local Storage found'));
        return;
      }

      await monitor.monitorMultipleProfiles(profiles, {
        interval: argv.interval,
        autoSave: !argv.noSave,
        verbose: argv.verbose,
      });
    } else {
      // Monitor specific profile or default
      let profileName = argv.profile || 'Default';
      let profile = detector.getProfile(profileName);

      // If not found, try to find first active profile
      if (!profile || !profile.exists) {
        const activeProfiles = detector.getActiveProfiles();

        if (activeProfiles.length === 0) {
          console.log(chalk.red('❌ No Chrome profiles with Local Storage found'));
          return;
        }

        profile = activeProfiles[0];
        console.log(chalk.yellow(`⚠️  Profile "${profileName}" not found, using "${profile.name}"`));
      }

      await monitor.startMonitoring(profile, {
        interval: argv.interval,
        autoSave: !argv.noSave,
        verbose: argv.verbose,
      });
    }

    // Keep process running
    console.log(chalk.gray('Press Ctrl+C to stop monitoring\n'));

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      await monitor.stopMonitoring();
      process.exit(0);
    });
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`));
    process.exit(1);
  }
}

/**
 * Handle extract command
 */
async function handleExtract(argv: any) {
  console.log(chalk.cyan('\n🔍 Extracting eva-tk Token\n'));

  const detector = new ChromeProfileDetector();
  const reader = new LevelDBReader();
  const storage = new TokenStorage();
  const decoder = new JWTDecoder();

  try {
    if (argv.all) {
      // Try all profiles
      const profiles = detector.getActiveProfiles();

      if (profiles.length === 0) {
        console.log(chalk.red('❌ No Chrome profiles with Local Storage found'));
        return;
      }

      let found = false;

      for (const profile of profiles) {
        console.log(chalk.gray(`Checking ${profile.name}...`));

        const result = await reader.extractToken(profile.localStoragePath);

        if (result.success && result.token) {
          console.log(chalk.green(`\n✓ Token found in ${profile.name}\n`));
          console.log(chalk.white(`Token: ${result.token}\n`));

          // Decode and display
          const decoded = decoder.decode(result.token);
          decoder.prettyPrint(result.token);

          // Save if requested
          if (argv.save) {
            await storage.saveToken({
              token: result.token,
              capturedAt: new Date(),
              profile: profile.name,
              decoded,
            });
            console.log(chalk.green('💾 Token saved\n'));
          }

          found = true;
          break;
        }
      }

      if (!found) {
        console.log(chalk.yellow('⚠️  No token found in any profile'));
      }
    } else {
      // Extract from specific profile
      let profileName = argv.profile || 'Default';
      const profile = detector.getProfile(profileName);

      if (!profile || !profile.exists) {
        console.log(chalk.red(`❌ Profile "${profileName}" not found or has no Local Storage`));
        return;
      }

      const result = await reader.extractToken(profile.localStoragePath);

      if (result.success && result.token) {
        console.log(chalk.green('✓ Token extracted successfully\n'));
        console.log(chalk.white(`Token: ${result.token}\n`));

        const decoded = decoder.decode(result.token);
        decoder.prettyPrint(result.token);

        if (argv.save) {
          await storage.saveToken({
            token: result.token,
            capturedAt: new Date(),
            profile: profile.name,
            decoded,
          });
          console.log(chalk.green('💾 Token saved\n'));
        }
      } else {
        console.log(chalk.yellow(`⚠️  ${result.error || 'No token found'}`));
      }
    }
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`));
    process.exit(1);
  }
}

/**
 * Handle list profiles command
 */
async function handleListProfiles() {
  console.log(chalk.cyan('\n🔍 Detecting Chrome Profiles\n'));

  const detector = new ChromeProfileDetector();

  try {
    const profiles = detector.getAllProfiles();

    if (profiles.length === 0) {
      console.log(chalk.yellow('⚠️  No Chrome profiles found'));
      return;
    }

    console.log(chalk.white(`Found ${profiles.length} profile(s):\n`));

    profiles.forEach((profile) => {
      const status = profile.exists
        ? chalk.green('✓ Active')
        : chalk.gray('✗ No Local Storage');

      console.log(`  ${status} ${chalk.bold(profile.name)}`);
      console.log(chalk.gray(`     ${profile.localStoragePath}\n`));
    });

    const activeCount = profiles.filter((p) => p.exists).length;
    console.log(chalk.cyan(`Total: ${profiles.length} profiles, ${activeCount} active\n`));
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`));
    process.exit(1);
  }
}

/**
 * Handle decode command
 */
async function handleDecode(argv: any) {
  const decoder = new JWTDecoder();

  try {
    decoder.prettyPrint(argv.token as string);
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`));
    process.exit(1);
  }
}

/**
 * Handle show latest command
 */
async function handleShowLatest() {
  console.log(chalk.cyan('\n📋 Latest Captured Token\n'));

  const storage = new TokenStorage();
  const decoder = new JWTDecoder();

  try {
    const token = storage.getLatestToken();

    if (!token) {
      console.log(chalk.yellow('⚠️  No tokens captured yet'));
      return;
    }

    console.log(chalk.white(`Token: ${token}\n`));
    decoder.prettyPrint(token);

    const storagePath = storage.getStoragePath();
    console.log(chalk.gray(`Storage path: ${storagePath}\n`));
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`));
    process.exit(1);
  }
}

/**
 * Handle history command
 */
async function handleHistory() {
  console.log(chalk.cyan('\n📜 Token Capture History\n'));

  const storage = new TokenStorage();

  try {
    const history = storage.getTokenHistory();

    if (history.length === 0) {
      console.log(chalk.yellow('⚠️  No tokens in history'));
      return;
    }

    console.log(chalk.white(`Found ${history.length} token(s):\n`));

    history.forEach((item, index) => {
      console.log(chalk.bold(`${index + 1}. ${item.capturedAt}`));
      console.log(chalk.gray(`   Profile: ${item.profile}`));
      console.log(chalk.gray(`   Token: ${item.token.substring(0, 50)}...`));

      if (item.decoded?.user) {
        console.log(chalk.gray(`   User: ${item.decoded.user}`));
      }

      console.log('');
    });
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`));
    process.exit(1);
  }
}

// Run the CLI
main().catch((error) => {
  console.error(chalk.red(`Fatal error: ${error}`));
  process.exit(1);
});
