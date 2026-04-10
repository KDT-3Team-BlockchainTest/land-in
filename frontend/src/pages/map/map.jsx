import "./Map.css";
import { useEffect, useRef, useState } from "react";

const DEFAULT_CENTER = {
  lat: 37.5665,
  lng: 126.978,
};

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_SCRIPT_ID = "google-maps-sdk";

function loadGoogleMapScript(apiKey) {
  if (!apiKey) {
    return Promise.reject(new Error("missing-api-key"));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);

  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener("load", () => resolve(window.google), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("script-load-failed")), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error("script-load-failed"));
    document.head.appendChild(script);
  });
}

function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("geolocation-not-supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

export default function MapPage() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const currentPositionRef = useRef(DEFAULT_CENTER);
  const [status, setStatus] = useState("loading");
  const [debugMessage, setDebugMessage] = useState("");
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [locationSource, setLocationSource] = useState("default");

  useEffect(() => {
    let cancelled = false;

    async function initializeMap() {
      if (!GOOGLE_MAPS_API_KEY) {
        setStatus("missing-key");
        setDebugMessage("VITE_GOOGLE_MAPS_API_KEY is empty.");
        return;
      }

      try {
        const google = await loadGoogleMapScript(GOOGLE_MAPS_API_KEY);
        let resolvedLocationSource = "default";
        const userCenter = await getCurrentLocation()
          .then((coords) => {
            if (!cancelled) {
              resolvedLocationSource = "gps";
              setLocationSource("gps");
              setMapCenter(coords);
              currentPositionRef.current = coords;
              setDebugMessage("Using the user's current location.");
            }

            return coords;
          })
          .catch((error) => {
            if (!cancelled) {
              resolvedLocationSource = "default";
              setLocationSource("default");
              setMapCenter(DEFAULT_CENTER);
              currentPositionRef.current = DEFAULT_CENTER;

              if (error?.code === 1) {
                setDebugMessage("Location permission was denied. Falling back to Seoul City Hall.");
              } else if (error?.code === 2) {
                setDebugMessage("Unable to detect the current location. Falling back to Seoul City Hall.");
              } else if (error?.code === 3) {
                setDebugMessage("Location request timed out. Falling back to Seoul City Hall.");
              } else if (error instanceof Error && error.message === "geolocation-not-supported") {
                setDebugMessage("Geolocation is not supported. Falling back to Seoul City Hall.");
              } else {
                setDebugMessage("Using Seoul City Hall because the current location could not be resolved.");
              }
            }

            return DEFAULT_CENTER;
          });

        if (cancelled || !mapRef.current) {
          return;
        }

        const map = new google.maps.Map(mapRef.current, {
          center: userCenter,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        mapInstanceRef.current = map;

        const currentLocationMarker = new google.maps.Marker({
          map,
          position: userCenter,
          title: resolvedLocationSource === "gps" ? "Current location" : "Fallback location",
        });

        const infoWindow = new google.maps.InfoWindow();

        currentLocationMarker.addListener("click", () => {
          infoWindow.setContent(`
            <div style="padding: 8px 10px; min-width: 160px;">
              <strong>${resolvedLocationSource === "gps" ? "Current location" : "Fallback location"}</strong>
              <div style="margin-top: 4px; color: #4b5563; font-size: 12px;">
                ${resolvedLocationSource === "gps" ? "Using your live GPS position." : "Using Seoul City Hall as the fallback center."}
              </div>
            </div>
          `);
          infoWindow.open({
            anchor: currentLocationMarker,
            map,
          });
        });

        if (!cancelled) {
          setStatus("ready");
          setDebugMessage((previous) => {
            if (previous) {
              return `${previous} Google Map initialized successfully.`;
            }

            return "Google Map initialized successfully.";
          });
        }
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setDebugMessage(error instanceof Error ? error.message : "Unknown Google Maps error.");
        }
      }
    }

    initializeMap();

    return () => {
      cancelled = true;
    };
  }, []);

  const statusMessage = {
    loading: "Loading Google Map...",
    "missing-key": "Add VITE_GOOGLE_MAPS_API_KEY to frontend/.env.",
    error: "Map initialization failed. Check the debug message and Google Maps key restrictions.",
  };

  const recenterToCurrentLocation = () => {
    if (!mapInstanceRef.current) {
      return;
    }

    mapInstanceRef.current.panTo(currentPositionRef.current);
    mapInstanceRef.current.setZoom(15);
  };

  return (
    <div className="map-page">
      <main className="map-page__content">
        <section className="map-page__hero" aria-label="Map intro">
          <p className="map-page__eyebrow">Route map</p>
          <h1 className="page-title">Google Map connection</h1>
          <p className="page-subtitle">
            The map tries to use the user's GPS first and falls back to Seoul City Hall if location access fails.
          </p>
        </section>

        <section className="card map-page__card">
          <h2 className="map-page__card-title">Map preview</h2>
          <p className="map-page__card-description">
            You can explore freely and tap the location button to jump back to your current pin.
          </p>
        </section>

        <section className="card map-page__map-shell" aria-label="Google map canvas">
          {status !== "ready" && (
            <div className="map-page__status">
              <p>{statusMessage[status]}</p>
            </div>
          )}
          <div ref={mapRef} className="map-page__map" />
          <button
            type="button"
            className="map-page__recenter-button"
            onClick={recenterToCurrentLocation}
            aria-label="Move map back to my current location"
          >
            My
          </button>
        </section>

        <section className="map-page__meta" aria-label="Map details">
          <article className="map-page__meta-item">
            <span className="map-page__meta-label">Map center</span>
            <strong className="map-page__meta-value">
              {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
            </strong>
          </article>
          <article className="map-page__meta-item">
            <span className="map-page__meta-label">Env variable</span>
            <strong className="map-page__meta-value">VITE_GOOGLE_MAPS_API_KEY</strong>
          </article>
          <article className="map-page__meta-item">
            <span className="map-page__meta-label">Key detected</span>
            <strong className="map-page__meta-value">{GOOGLE_MAPS_API_KEY ? "Yes" : "No"}</strong>
          </article>
          <article className="map-page__meta-item">
            <span className="map-page__meta-label">Location source</span>
            <strong className="map-page__meta-value">{locationSource === "gps" ? "GPS" : "Default"}</strong>
          </article>
          <article className="map-page__meta-item">
            <span className="map-page__meta-label">Debug message</span>
            <strong className="map-page__meta-value">{debugMessage || "Waiting"}</strong>
          </article>
        </section>

        <section className="card map-page__place-card" aria-label="Current location details">
          <div className="map-page__place-head">
            <span className="map-page__place-tag">{locationSource === "gps" ? "Live GPS" : "Fallback"}</span>
            <span className="map-page__place-coords">
              {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
            </span>
          </div>
          <h2 className="map-page__place-title">
            {locationSource === "gps" ? "Current location pin" : "Seoul City Hall fallback pin"}
          </h2>
          <p className="map-page__place-description">
            {locationSource === "gps"
              ? "This pin follows the user's detected position. If the map moves away while browsing, use the small button on the map to return here."
              : "Location access is unavailable, so the map is using Seoul City Hall as the reference point."}
          </p>
        </section>
      </main>
    </div>
  );
}
