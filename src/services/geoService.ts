/**
 * Geospatial computation and real-time GPS location services.
 * Implements Haversine distance calculations and provides PostGIS / Redis Geo queries for backend indexing.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  speed?: number | null;
}

export interface GeoLocationState {
  coords: Coordinates | null;
  loading: boolean;
  error: string | null;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unknown';
}

/**
 * Calculates accurate great-circle distance between two GPS coordinates in kilometers using the Haversine formula.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
}

/**
 * Generates ready-to-run PostgreSQL PostGIS SQL query string for fast spatial radius filtering.
 */
export function generatePostGisRadiusQuery(
  lat: number,
  lon: number,
  radiusKm: number,
  limit = 50
): string {
  const radiusMeters = radiusKm * 1000;
  return `
    SELECT 
      id, name, age, bio, photos,
      ST_Distance(
        location_geom, 
        ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography
      ) / 1000 AS distance_km
    FROM profiles
    WHERE ST_DWithin(
      location_geom,
      ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography,
      ${radiusMeters}
    )
    ORDER BY distance_km ASC
    LIMIT ${limit};
  `.trim();
}

/**
 * Generates Redis GEOSEARCH command string for high throughput in-memory location matching.
 */
export function generateRedisGeoCommand(
  lat: number,
  lon: number,
  radiusKm: number
): string {
  return `GEOSEARCH user_locations FROMLONLAT ${lon} ${lat} BYRADIUS ${radiusKm} km WITHDIST WITHCOORD ASC`;
}

export const geoService = {
  getCurrentPosition: async (options?: PositionOptions): Promise<Coordinates> => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      throw new Error("La géolocalisation n'est pas supportée par votre navigateur.");
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude,
            speed: pos.coords.speed,
          });
        },
        (err) => {
          let msg = "Impossible d'obtenir la position GPS.";
          if (err.code === err.PERMISSION_DENIED) {
            msg = "Autorisation de localisation refusée.";
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            msg = 'Signal GPS introuvable.';
          } else if (err.code === err.TIMEOUT) {
            msg = 'Délai de géolocalisation dépassé.';
          }
          reject(new Error(msg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
          ...options,
        }
      );
    });
  },

  watchPosition: (
    onSuccess: (coords: Coordinates) => void,
    onError: (err: Error) => void,
    options?: PositionOptions
  ): (() => void) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      onError(new Error('Géolocalisation indisponible.'));
      return () => {};
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        onSuccess({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude,
          speed: pos.coords.speed,
        });
      },
      (err) => onError(new Error(err.message)),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
        ...options,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  },

  calculateDistance: calculateHaversineDistanceKm,
  generatePostGisRadiusQuery,
  generateRedisGeoCommand,
};
