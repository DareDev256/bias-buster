// ─── Game ID Registry ───
// Single source of truth for the storage key prefix.
// Call configureStorage() once at app init — all storage/analytics keys derive from it.
// Eliminates the hardcoded GAME_ID constant that each Passionate Learning game had to manually edit.

let _gameId = "";

/**
 * Set the game ID prefix used by all storage and analytics keys.
 * Must be called before any storage/analytics operations.
 * Throws if called with an empty or non-alphanumeric-underscore string.
 */
export function configureStorage(id: string): void {
  if (!/^[a-z][a-z0-9_]*$/.test(id)) {
    throw new Error(
      `Invalid game ID "${id}": must start with lowercase letter, contain only [a-z0-9_]`
    );
  }
  _gameId = id;
}

/**
 * Derive a namespaced localStorage key.
 * @example storageKey("progress") → "bias_buster_progress"
 */
export function storageKey(suffix: string): string {
  if (!_gameId) {
    throw new Error("configureStorage() must be called before accessing storage keys");
  }
  return `${_gameId}_${suffix}`;
}

/** Return the current game ID (for debugging/logging). */
export function getGameId(): string {
  return _gameId;
}

/**
 * Reset game ID — only for testing. Not exported from public API.
 * @internal
 */
export function _resetGameId(): void {
  _gameId = "";
}
