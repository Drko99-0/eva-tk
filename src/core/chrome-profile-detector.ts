/**
 * Chrome Profile Detector
 * Automatically detects all Chrome profiles on Windows
 */

import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { ChromeProfile } from '../types/index.js';

/**
 * Default Chrome user data directory on Windows
 */
const CHROME_USER_DATA_PATHS = [
  join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'User Data'),
  join(process.env.USERPROFILE || '', 'AppData', 'Local', 'Google', 'Chrome', 'User Data'),
];

/**
 * Detects all Chrome profiles on the system
 */
export class ChromeProfileDetector {
  private userDataPath: string | null = null;

  constructor() {
    this.findUserDataPath();
  }

  /**
   * Find the Chrome User Data directory
   */
  private findUserDataPath(): void {
    for (const path of CHROME_USER_DATA_PATHS) {
      if (existsSync(path)) {
        this.userDataPath = path;
        return;
      }
    }
  }

  /**
   * Get all Chrome profiles
   */
  public getAllProfiles(): ChromeProfile[] {
    if (!this.userDataPath) {
      throw new Error('Chrome User Data directory not found');
    }

    const profiles: ChromeProfile[] = [];

    try {
      const entries = readdirSync(this.userDataPath);

      for (const entry of entries) {
        // Check for "Default" profile and "Profile X" patterns
        if (entry === 'Default' || entry.startsWith('Profile ')) {
          const profilePath = join(this.userDataPath, entry);
          const localStoragePath = join(profilePath, 'Local Storage', 'leveldb');

          const profile: ChromeProfile = {
            name: entry,
            path: profilePath,
            localStoragePath,
            exists: existsSync(localStoragePath),
          };

          profiles.push(profile);
        }
      }
    } catch (error) {
      console.error('Error reading Chrome profiles:', error);
    }

    return profiles;
  }

  /**
   * Get profiles that have Local Storage LevelDB
   */
  public getActiveProfiles(): ChromeProfile[] {
    return this.getAllProfiles().filter((profile) => profile.exists);
  }

  /**
   * Get a specific profile by name
   */
  public getProfile(name: string): ChromeProfile | null {
    const profiles = this.getAllProfiles();
    return profiles.find((p) => p.name === name) || null;
  }

  /**
   * Get the Chrome User Data path
   */
  public getUserDataPath(): string | null {
    return this.userDataPath;
  }

  /**
   * Print all detected profiles
   */
  public printProfiles(): void {
    const profiles = this.getAllProfiles();

    console.log('\n🔍 Detected Chrome Profiles:\n');

    if (profiles.length === 0) {
      console.log('  No profiles found');
      return;
    }

    profiles.forEach((profile) => {
      const status = profile.exists ? '✓' : '✗';
      console.log(`  ${status} ${profile.name}`);
      console.log(`    Path: ${profile.localStoragePath}`);
      console.log('');
    });
  }
}
