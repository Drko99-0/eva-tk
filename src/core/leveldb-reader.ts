/**
 * LevelDB Reader
 * Reads Chrome Local Storage LevelDB to extract eva-tk tokens
 */

import { Level } from 'level';
import { ExtractionResult } from '../types/index.js';

/**
 * Key pattern for eva-tk in Chrome Local Storage
 * Chrome stores localStorage as: _<origin>\x00\x01<key>
 */
const EVA_TK_KEY_PATTERN = /eva-tk/;

/**
 * LevelDB reader for extracting tokens from Chrome Local Storage
 */
export class LevelDBReader {
  /**
   * Extract eva-tk token from a Chrome profile's LevelDB
   */
  public async extractToken(leveldbPath: string): Promise<ExtractionResult> {
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
        // Check if this key contains 'eva-tk'
        if (EVA_TK_KEY_PATTERN.test(key)) {
          // Extract the token value
          // The value might be wrapped, so we need to parse it
          const token = this.extractTokenFromValue(value);

          if (token) {
            await db.close();
            return {
              success: true,
              token,
            };
          }
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

      return {
        success: false,
        error: `Failed to read LevelDB: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
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
