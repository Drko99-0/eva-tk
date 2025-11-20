/**
 * LevelDB Reader
 * Reads Chrome Local Storage LevelDB to extract eva-tk tokens
 */

import { Level } from 'level';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { ExtractionResult } from '../types/index.js';

/**
 * Key pattern for eva-tk in Chrome Local Storage
 * Chrome stores localStorage as: _<origin>\x00\x01<key>
 */
const EVA_TK_KEY_PATTERN = /eva-tk/;

/**
 * JWT token pattern - matches standard JWT format
 */
const JWT_PATTERN = /eyJ[A-Za-z0-9_-]{20,}\.eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g;

/**
 * LevelDB reader for extracting tokens from Chrome Local Storage
 */
export class LevelDBReader {
  private verbose: boolean = false;

  constructor(verbose: boolean = false) {
    this.verbose = verbose;
  }

  /**
   * Extract eva-tk token from a Chrome profile's LevelDB
   * Uses multiple strategies: LevelDB API first, then binary search as fallback
   */
  public async extractToken(leveldbPath: string): Promise<ExtractionResult> {
    // Strategy 1: Try using Level library (structured approach)
    if (this.verbose) {
      console.log('  Strategy 1: Using Level library...');
    }

    const levelResult = await this.extractTokenUsingLevel(leveldbPath);
    if (levelResult.success) {
      if (this.verbose) {
        console.log('  ✓ Token found using Level library');
      }
      return levelResult;
    }

    if (this.verbose) {
      console.log('  ✗ Level library failed, trying binary search...');
    }

    // Strategy 2: Direct binary file search (more robust, works even if Level fails)
    const binaryResult = await this.extractTokenUsingBinarySearch(leveldbPath);
    if (binaryResult.success) {
      if (this.verbose) {
        console.log('  ✓ Token found using binary search');
      }
      return binaryResult;
    }

    return {
      success: false,
      error: 'eva-tk token not found using any extraction method',
    };
  }

  /**
   * Strategy 1: Extract token using Level library
   */
  private async extractTokenUsingLevel(leveldbPath: string): Promise<ExtractionResult> {
    let db: Level<string, string> | null = null;

    try {
      // Open the LevelDB database (read-only mode)
      db = new Level(leveldbPath, {
        valueEncoding: 'utf8',
        keyEncoding: 'utf8',
      });

      await db.open();

      // Iterate through all entries
      for await (const [key, value] of db.iterator()) {
        if (this.verbose) {
          console.log(`    Checking key: ${key.substring(0, 50)}...`);
        }

        // Check if this key contains 'eva-tk'
        if (EVA_TK_KEY_PATTERN.test(key)) {
          if (this.verbose) {
            console.log(`    Found eva-tk in key! Value: ${value.substring(0, 100)}...`);
          }

          // Extract the token value
          const token = this.extractTokenFromValue(value);

          if (token) {
            await db.close();
            return {
              success: true,
              token,
            };
          }
        }

        // Also check in value for JWT pattern
        const tokenInValue = this.extractTokenFromValue(value);
        if (tokenInValue && key.includes('eva-tk')) {
          await db.close();
          return {
            success: true,
            token: tokenInValue,
          };
        }
      }

      await db.close();

      return {
        success: false,
        error: 'eva-tk token not found in database',
      };
    } catch (error) {
      if (db) {
        try {
          await db.close();
        } catch (closeError) {
          // Ignore close errors
        }
      }

      if (this.verbose) {
        console.error(`    Level error: ${error instanceof Error ? error.message : String(error)}`);
      }

      return {
        success: false,
        error: `Failed to read LevelDB: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Strategy 2: Extract token by directly reading .ldb and .log files as binary
   * This is more robust and works even when Level library has issues
   */
  private async extractTokenUsingBinarySearch(leveldbPath: string): Promise<ExtractionResult> {
    try {
      // Get all .ldb and .log files in the directory
      const files = readdirSync(leveldbPath);
      const dataFiles = files.filter(
        (file) => file.endsWith('.ldb') || file.endsWith('.log')
      );

      if (this.verbose) {
        console.log(`    Found ${dataFiles.length} data files: ${dataFiles.join(', ')}`);
      }

      for (const file of dataFiles) {
        const filePath = join(leveldbPath, file);

        if (this.verbose) {
          console.log(`    Scanning ${file}...`);
        }

        try {
          // Read file as binary
          const buffer = readFileSync(filePath);

          // Convert to string, ignoring invalid UTF-8 sequences
          const content = buffer.toString('utf8', 0, buffer.length);

          // Look for 'eva-tk' in the content
          if (content.includes('eva-tk')) {
            if (this.verbose) {
              console.log(`    Found 'eva-tk' in ${file}!`);
            }

            // Find the position of 'eva-tk'
            const idx = content.indexOf('eva-tk');

            // Extract a segment around the token name (search before and after)
            const segmentStart = Math.max(0, idx - 200);
            const segmentEnd = Math.min(content.length, idx + 2000);
            const segment = content.substring(segmentStart, segmentEnd);

            // Search for JWT tokens in this segment
            const matches = segment.match(JWT_PATTERN);

            if (matches && matches.length > 0) {
              if (this.verbose) {
                console.log(`    Found ${matches.length} JWT token(s) in segment`);
              }

              // Return the first valid JWT token
              for (const token of matches) {
                if (this.isValidJWT(token)) {
                  return {
                    success: true,
                    token,
                  };
                }
              }
            }
          }
        } catch (fileError) {
          if (this.verbose) {
            console.error(`    Error reading ${file}: ${fileError}`);
          }
          // Continue with next file
          continue;
        }
      }

      return {
        success: false,
        error: 'eva-tk token not found in any .ldb or .log files',
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to read files: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Validate if a string is a proper JWT token
   */
  private isValidJWT(token: string): boolean {
    const parts = token.split('.');
    return parts.length === 3 && parts.every((part) => part.length > 0);
  }

  /**
   * Extract token from LevelDB value
   * Chrome stores values in different formats, we need to handle them
   */
  private extractTokenFromValue(value: string): string | null {
    // Try to find JWT pattern (eyJ...)
    const jwtPattern = /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/;
    const match = value.match(jwtPattern);

    if (match) {
      return match[0];
    }

    // If direct match, check if value itself is a JWT
    if (value.startsWith('eyJ')) {
      return value;
    }

    return null;
  }

  /**
   * Read raw data from LevelDB for debugging
   */
  public async debugRead(leveldbPath: string, maxEntries: number = 10): Promise<void> {
    let db: Level<string, string> | null = null;

    try {
      db = new Level(leveldbPath, {
        valueEncoding: 'utf8',
        keyEncoding: 'utf8',
      });

      await db.open();

      console.log('\n🔍 LevelDB Contents (first', maxEntries, 'entries):\n');

      let count = 0;
      for await (const [key, value] of db.iterator()) {
        if (count >= maxEntries) break;

        console.log(`Key: ${key}`);
        console.log(`Value: ${value.substring(0, 100)}${value.length > 100 ? '...' : ''}`);
        console.log('---');

        count++;
      }

      await db.close();
    } catch (error) {
      console.error('Error reading LevelDB:', error);
      if (db) {
        try {
          await db.close();
        } catch (closeError) {
          // Ignore
        }
      }
    }
  }
}
