/**
 * Token Monitor
 * Monitors Chrome Local Storage in real-time to capture eva-tk tokens
 */

import { watch, FSWatcher } from 'chokidar';
import { ChromeProfile, MonitorOptions, CapturedToken } from '../types/index.js';
import { LevelDBReader } from './leveldb-reader.js';
import { TokenStorage } from './token-storage.js';
import { JWTDecoder } from '../utils/jwt-decoder.js';

/**
 * Real-time token monitor
 */
export class TokenMonitor {
  private watchers: FSWatcher[] = [];
  private reader: LevelDBReader;
  private storage: TokenStorage;
  private decoder: JWTDecoder;
  private lastToken: string | null = null;
  private isMonitoring: boolean = false;

  constructor() {
    this.reader = new LevelDBReader();
    this.storage = new TokenStorage();
    this.decoder = new JWTDecoder();
  }

  /**
   * Start monitoring a Chrome profile for token changes
   */
  public async startMonitoring(
    profile: ChromeProfile,
    options: MonitorOptions = {}
  ): Promise<void> {
    if (!profile.exists) {
      throw new Error(`Profile ${profile.name} does not have Local Storage`);
    }

    const {
      interval = 500,
      autoSave = true,
      verbose = false,
    } = options;

    this.isMonitoring = true;

    console.log(`\n🔍 Monitoring profile: ${profile.name}`);
    console.log(`📂 Path: ${profile.localStoragePath}`);
    console.log(`⏱️  Check interval: ${interval}ms`);
    console.log(`💾 Auto-save: ${autoSave ? 'enabled' : 'disabled'}`);
    console.log('\n⏳ Waiting for eva-tk token...\n');

    // Watch for changes in .ldb and .log files
    const watcher = watch(profile.localStoragePath, {
      persistent: true,
      ignoreInitial: false,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
    });

    watcher.on('change', async (path) => {
      if (verbose) {
        console.log(`📝 File changed: ${path}`);
      }

      await this.checkForToken(profile, autoSave, verbose);
    });

    watcher.on('add', async (path) => {
      if (verbose) {
        console.log(`➕ File added: ${path}`);
      }

      await this.checkForToken(profile, autoSave, verbose);
    });

    watcher.on('error', (error) => {
      console.error(`❌ Watcher error: ${error}`);
    });

    this.watchers.push(watcher);

    // Also perform periodic checks
    const intervalId = setInterval(async () => {
      if (!this.isMonitoring) {
        clearInterval(intervalId);
        return;
      }

      await this.checkForToken(profile, autoSave, verbose);
    }, interval);
  }

  /**
   * Check for token in the database
   */
  private async checkForToken(
    profile: ChromeProfile,
    autoSave: boolean,
    verbose: boolean
  ): Promise<void> {
    try {
      const result = await this.reader.extractToken(profile.localStoragePath);

      if (result.success && result.token) {
        // Check if this is a new token
        if (result.token !== this.lastToken) {
          this.lastToken = result.token;

          const captured: CapturedToken = {
            token: result.token,
            capturedAt: new Date(),
            profile: profile.name,
          };

          // Decode the token
          try {
            captured.decoded = this.decoder.decode(result.token);
          } catch (error) {
            // Decoding failed, but we still save the token
          }

          // Display the captured token
          this.displayCapturedToken(captured);

          // Save if auto-save is enabled
          if (autoSave) {
            await this.storage.saveToken(captured);
            console.log('💾 Token saved automatically\n');
          }
        } else if (verbose) {
          console.log('ℹ️  Same token detected, skipping...');
        }
      }
    } catch (error) {
      if (verbose) {
        console.error(`Error checking token: ${error}`);
      }
    }
  }

  /**
   * Display captured token information
   */
  private displayCapturedToken(captured: CapturedToken): void {
    console.log('🎯 TOKEN CAPTURED!\n');
    console.log(`📅 Time: ${captured.capturedAt.toLocaleString()}`);
    console.log(`👤 Profile: ${captured.profile}`);
    console.log(`🔑 Token: ${captured.token}\n`);

    if (captured.decoded) {
      console.log('📋 Decoded Information:');
      console.log(`   User: ${captured.decoded.user || 'N/A'}`);
      console.log(`   ID Alumno: ${captured.decoded.ida || 'N/A'}`);
      console.log(`   ID Usuario: ${captured.decoded.idu || 'N/A'}`);
      console.log(`   Sede: ${captured.decoded.sed || 'N/A'}`);
      console.log(`   Carrera: ${captured.decoded.comar || 'N/A'}`);

      if (captured.decoded.exp) {
        const expDate = new Date(captured.decoded.exp * 1000);
        console.log(`   Expires: ${expDate.toLocaleString()}`);
      }

      console.log('');
    }
  }

  /**
   * Stop monitoring
   */
  public async stopMonitoring(): Promise<void> {
    this.isMonitoring = false;

    console.log('\n⏹️  Stopping monitor...\n');

    for (const watcher of this.watchers) {
      await watcher.close();
    }

    this.watchers = [];
  }

  /**
   * Monitor multiple profiles
   */
  public async monitorMultipleProfiles(
    profiles: ChromeProfile[],
    options: MonitorOptions = {}
  ): Promise<void> {
    const activeProfiles = profiles.filter((p) => p.exists);

    if (activeProfiles.length === 0) {
      throw new Error('No active profiles found');
    }

    console.log(`\n🔍 Monitoring ${activeProfiles.length} profile(s)...\n`);

    for (const profile of activeProfiles) {
      await this.startMonitoring(profile, options);
    }
  }
}
