import { useState, useEffect } from "react";

export interface GeolocationCoords {
  latitude: number;
  longitude: number;
}

export interface GeolocationState {
  coords: GeolocationCoords | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ coords: null, error: "Geolocation is not supported by your browser.", loading: false });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          error: null,
          loading: false,
        });
      },
      (err) => {
        let message = "Unable to retrieve your location.";
        if (err.code === err.PERMISSION_DENIED) {
          message = "Location permission denied. Enable location access to see distances.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          message = "Location information is unavailable.";
        } else if (err.code === err.TIMEOUT) {
          message = "Location request timed out.";
        }
        setState({ coords: null, error: message, loading: false });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  return state;
}
