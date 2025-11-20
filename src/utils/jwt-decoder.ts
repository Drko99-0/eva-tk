/**
 * JWT Decoder
 * Decodes and validates JWT tokens
 */

import jwt from 'jsonwebtoken';
import { DecodedToken } from '../types/index.js';

/**
 * JWT decoder utility
 */
export class JWTDecoder {
  /**
   * Decode a JWT token without verification
   */
  public decode(token: string): DecodedToken {
    try {
      const decoded = jwt.decode(token);

      if (!decoded || typeof decoded === 'string') {
        throw new Error('Invalid token format');
      }

      return decoded as DecodedToken;
    } catch (error) {
      throw new Error(`Failed to decode token: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check if token is expired
   */
  public isExpired(token: string): boolean {
    try {
      const decoded = this.decode(token);

      if (!decoded.exp) {
        return false;
      }

      const now = Math.floor(Date.now() / 1000);
      return decoded.exp < now;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get time remaining until expiration (in seconds)
   */
  public getTimeRemaining(token: string): number | null {
    try {
      const decoded = this.decode(token);

      if (!decoded.exp) {
        return null;
      }

      const now = Math.floor(Date.now() / 1000);
      const remaining = decoded.exp - now;

      return remaining > 0 ? remaining : 0;
    } catch (error) {
      return null;
    }
  }

  /**
   * Pretty print token information
   */
  public prettyPrint(token: string): void {
    try {
      const decoded = this.decode(token);

      console.log('\n📋 Token Information:\n');
      console.log(JSON.stringify(decoded, null, 2));

      if (decoded.exp) {
        const expDate = new Date(decoded.exp * 1000);
        const timeRemaining = this.getTimeRemaining(token);

        console.log('\n⏰ Expiration:');
        console.log(`   Date: ${expDate.toLocaleString()}`);
        console.log(`   Remaining: ${timeRemaining !== null ? `${timeRemaining}s` : 'N/A'}`);
        console.log(`   Expired: ${this.isExpired(token) ? 'Yes' : 'No'}`);
      }

      console.log('');
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
  }

  /**
   * Extract specific claims from token
   */
  public getClaim(token: string, claim: string): any {
    try {
      const decoded = this.decode(token);
      return decoded[claim as keyof DecodedToken];
    } catch (error) {
      return null;
    }
  }
}
