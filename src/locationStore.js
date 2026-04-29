/**
 * locationStore.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared real-time location bus using localStorage + StorageEvent.
 *
 * HOW IT WORKS
 * ─────────────
 * • DriverShipment calls writeLocation() on every GPS fix.
 *   → writes to localStorage AND fires a custom "locationUpdate" event
 *     so same-tab listeners react INSTANTLY (no polling delay).
 *
 * • Tracking / CustomerTrackingResult call subscribeLocations() which
 *   listens to BOTH the native "storage" event (cross-tab) AND the
 *   custom "locationUpdate" event (same-tab) → instant in all cases.
 *
 * Key format:  "driver_location_<SHIPMENT_ID>"
 * Value:       JSON { lat, lng, accuracy, ts }
 */

const PREFIX = 'driver_location_';
const KEY    = (id) => `${PREFIX}${id}`;
const EVENT  = 'locationUpdate'; // custom same-tab event name

// ── Write ─────────────────────────────────────────────────────────────────────
export const writeLocation = (shipmentId, lat, lng, accuracy = null) => {
  const payload = { lat, lng, accuracy, ts: Date.now() };
  try {
    localStorage.setItem(KEY(shipmentId), JSON.stringify(payload));
  } catch (_) {}

  // Dispatch a custom event so same-tab listeners fire instantly
  window.dispatchEvent(
    new CustomEvent(EVENT, { detail: { shipmentId, ...payload } })
  );
};

// ── Read one ──────────────────────────────────────────────────────────────────
export const readLocation = (shipmentId) => {
  try {
    const raw = localStorage.getItem(KEY(shipmentId));
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
};

// ── Read all ──────────────────────────────────────────────────────────────────
export const readAllLocations = () => {
  const result = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) {
        const id  = k.slice(PREFIX.length);
        const raw = localStorage.getItem(k);
        if (raw) result[id] = JSON.parse(raw);
      }
    }
  } catch (_) {}
  return result;
};

// ── Subscribe (instant, no polling) ──────────────────────────────────────────
/**
 * Subscribe to ALL live location updates.
 * Fires immediately with current data, then on every update.
 * Returns an unsubscribe function.
 *
 * @param {(locations: Record<string, {lat,lng,accuracy,ts}>) => void} cb
 */
export const subscribeAllLocations = (cb) => {
  const fire = () => cb(readAllLocations());

  // Same-tab instant updates
  window.addEventListener(EVENT, fire);
  // Cross-tab updates (different browser tab)
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith(PREFIX)) fire();
  });

  fire(); // call immediately with current data

  return () => {
    window.removeEventListener(EVENT, fire);
    window.removeEventListener('storage', fire);
  };
};

/**
 * Subscribe to a single shipment's location.
 * Returns an unsubscribe function.
 *
 * @param {string} shipmentId
 * @param {(loc: {lat,lng,accuracy,ts}|null) => void} cb
 */
export const subscribeLocation = (shipmentId, cb) => {
  const fire = () => cb(readLocation(shipmentId));

  const onCustom = (e) => {
    if (e.detail?.shipmentId === shipmentId) cb(e.detail);
  };
  const onStorage = (e) => {
    if (e.key === KEY(shipmentId)) fire();
  };

  window.addEventListener(EVENT, onCustom);
  window.addEventListener('storage', onStorage);

  fire(); // call immediately

  return () => {
    window.removeEventListener(EVENT, onCustom);
    window.removeEventListener('storage', onStorage);
  };
};

// ── Helpers ───────────────────────────────────────────────────────────────────
export const staleSecs = (loc) =>
  loc ? Math.round((Date.now() - loc.ts) / 1000) : null;

// Keep old polling-style exports for backward compat
export const readLocation_compat  = readLocation;
export const readAllLocations_compat = readAllLocations;
