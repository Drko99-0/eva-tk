/**
 * Token Storage
 * Saves captured tokens to secure local storage
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';
import { CapturedToken } from '../types/index.js';

/**
 * Default storage directory
 */
const DEFAULT_STORAGE_DIR = 'tokens';
const TOKENS_FILE = 'captured-tokens.json';
const LATEST_TOKEN_FILE = 'latest-token.txt';

/**
 * Token storage manager
 */
export class TokenStorage {
  private storagePath: string;

  constructor(storagePath: string = DEFAULT_STORAGE_DIR) {
    this.storagePath = storagePath;
    this.ensureStorageDirectory();
  }

  /**
   * Ensure storage directory exists
   */
  private ensureStorageDirectory(): void {
    if (!existsSync(this.storagePath)) {
      mkdirSync(this.storagePath, { recursive: true });
    }
  }

  /**
   * Save a captured token
   */
  public async saveToken(token: CapturedToken): Promise<void> {
    // Save to JSON file (append to history)
    await this.appendToHistory(token);

    // Save latest token to separate file for easy access
    await this.saveLatestToken(token);
  }

  /**
   * Append token to history file
   */
  private async appendToHistory(token: CapturedToken): Promise<void> {
    const filePath = join(this.storagePath, TOKENS_FILE);
    let tokens: CapturedToken[] = [];

    // Read existing tokens if file exists
    if (existsSync(filePath)) {
      try {
        const content = readFileSync(filePath, 'utf-8');
        tokens = JSON.parse(content);
      } catch (error) {
        // If file is corrupted, start fresh
        tokens = [];
      }
    }

    // Add new token
    tokens.push(token);

    // Keep only last 100 tokens to avoid huge files
    if (tokens.length > 100) {
      tokens = tokens.slice(-100);
    }

    // Save back to file
    writeFileSync(filePath, JSON.stringify(tokens, null, 2), 'utf-8');
  }

  /**
   * Save latest token to separate file
   */
  private async saveLatestToken(token: CapturedToken): Promise<void> {
    const filePath = join(this.storagePath, LATEST_TOKEN_FILE);

    const content = [
      `# eva-tk Token - Captured at ${token.capturedAt.toISOString()}`,
      `# Profile: ${token.profile}`,
      '',
      token.token,
      '',
      '# Decoded Information:',
      JSON.stringify(token.decoded, null, 2),
    ].join('\n');

    writeFileSync(filePath, content, 'utf-8');
  }

  /**
   * Get all saved tokens
   */
  public getTokenHistory(): CapturedToken[] {
    const filePath = join(this.storagePath, TOKENS_FILE);

    if (!existsSync(filePath)) {
      return [];
    }

    try {
      const content = readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Error reading token history:', error);
      return [];
    }
  }

  /**
   * Get the latest saved token
   */
  public getLatestToken(): string | null {
    const filePath = join(this.storagePath, LATEST_TOKEN_FILE);

    if (!existsSync(filePath)) {
      return null;
    }

    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      // Find the token line (not a comment)
      for (const line of lines) {
        if (line && !line.startsWith('#') && line.trim().length > 0) {
          return line.trim();
        }
      }
    } catch (error) {
      console.error('Error reading latest token:', error);
    }

    return null;
  }

  /**
   * Export token to custom file
   */
  public exportToken(token: string, filename: string): void {
    const filePath = join(this.storagePath, filename);
    writeFileSync(filePath, token, 'utf-8');
    console.log(`✓ Token exported to: ${filePath}`);
  }

  /**
   * Get storage path
   */
  public getStoragePath(): string {
    return this.storagePath;
  }
}
