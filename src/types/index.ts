/**
 * Type definitions for eva-tk toolkit
 */

/**
 * Chrome profile information
 */
export interface ChromeProfile {
  name: string;
  path: string;
  localStoragePath: string;
  exists: boolean;
}

/**
 * Captured token data
 */
export interface CapturedToken {
  token: string;
  capturedAt: Date;
  profile: string;
  decoded?: DecodedToken;
}

/**
 * Decoded JWT token structure for eva-tk
 */
export interface DecodedToken {
  user?: string;
  ida?: number;
  idu?: number;
  tip?: number;
  fi?: string;
  ff?: string;
  con?: string;
  sed?: string;
  idug?: number;
  iduga?: number;
  mat?: string;
  mar?: number;
  comar?: string;
  nbf?: number;
  exp?: number;
  iat?: number;
  iss?: string;
  aud?: string;
}

/**
 * Monitor configuration options
 */
export interface MonitorOptions {
  interval?: number;
  profilePattern?: string;
  autoSave?: boolean;
  outputPath?: string;
  verbose?: boolean;
}

/**
 * Token extraction result
 */
export interface ExtractionResult {
  success: boolean;
  token?: string;
  profile?: string;
  error?: string;
}
