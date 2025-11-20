/**
 * Chrome Profile Detector
 * Automatically detects all Chrome profiles on Windows, Linux, and macOS
 */

import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { platform, homedir } from 'os';
import { ChromeProfile } from '../types/index.js';

/**
 * Get Chrome user data directory paths based on platform
 */
function getChromeUserDataPaths(): string[] {
  const platformType = platform();
  const home = homedir();

  switch (platformType) {
    case 'win32':
      // Windows
      return [
        join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'User Data'),
        join(process.env.USERPROFILE || '', 'AppData', 'Local', 'Google', 'Chrome', 'User Data'),
      ];

    case 'darwin':
      // macOS
      return [
        join(home, 'Library', 'Application Support', 'Google', 'Chrome'),
      ];

    case 'linux':
      // Linux
      return [
        join(home, '.config', 'google-chrome'),
        join(home, '.config', 'chromium'),
        join(home, 'snap', 'chromium', 'common', 'chromium'),
      ];

    default:
      return [];
  }
}

/**
 * Detects all Chrome profiles on the system
 */
export class ChromeProfileDetector {
  private userDataPath: string | null = null;
  private platformType: string;

  constructor() {
    this.platformType = platform();
    this.findUserDataPath();
  }

  /**
   * Find the Chrome User Data directory
   */
  private findUserDataPath(): void {
    const paths = getChromeUserDataPaths();

    for (const path of paths) {
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
      const entries = readdirSync(this.userDataPath, { withFileTypes: true });

      for (const entry of entries) {
        // Check for directories that look like Chrome profiles
        // Profiles can be: "Default", "Profile 1", "Profile 2", "Profile 3", etc.
        if (entry.isDirectory()) {
          const isProfileDir =
            entry.name === 'Default' ||
            entry.name.startsWith('Profile ') ||
            /^Profile\d+$/.test(entry.name);

          if (isProfileDir) {
            const profilePath = join(this.userDataPath, entry.name);
            const localStoragePath = join(profilePath, 'Local Storage', 'leveldb');

            const profile: ChromeProfile = {
              name: entry.name,
              path: profilePath,
              localStoragePath,
              exists: existsSync(localStoragePath),
            };

            profiles.push(profile);
          }
        }
      }

      // Sort profiles: Default first, then Profile 1, Profile 2, etc.
      profiles.sort((a, b) => {
        if (a.name === 'Default') return -1;
        if (b.name === 'Default') return 1;

        const aNum = parseInt(a.name.replace('Profile ', '')) || 0;
        const bNum = parseInt(b.name.replace('Profile ', '')) || 0;

        return aNum - bNum;
      });
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
   * Get platform name for display
   */
  public getPlatformName(): string {
    switch (this.platformType) {
      case 'win32':
        return 'Windows';
      case 'darwin':
        return 'macOS';
      case 'linux':
        return 'Linux';
      default:
        return this.platformType;
    }
  }

  /**
   * Get helpful error message when Chrome is not found
   */
  public getInstallationGuidance(): string {
    const paths = getChromeUserDataPaths();

    let message = `Chrome installation not detected on ${this.getPlatformName()}.\n\n`;
    message += 'Expected Chrome data locations:\n';

    paths.forEach((path) => {
      message += `  • ${path}\n`;
    });

    message += '\nPossible solutions:\n';
    message += '  1. Install Google Chrome or Chromium\n';
    message += '  2. Make sure Chrome has been opened at least once\n';
    message += '  3. Check if Chrome data is in a custom location\n';

    return message;
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
