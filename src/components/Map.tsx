import { Icon } from "leaflet";
import markerIconRetina from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { Link, useNavigate } from "react-router";

import { useCities } from "../contexts/CitiesContext";
import { useGeolocation } from "../hooks/useGeolocation";
import { useUrlPosition } from "../hooks/useUrlPosition";
import Button from "./Button";
import styles from "./Map.module.css";

import type { Position } from "../types";
import type { LatLngTuple } from "leaflet";

const pin = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function WorldMap() {
  const { cities } = useCities();
  const [latitude, longitude] = useUrlPosition();
  const {
    isLoading,
    position: locatedPosition,
    error,
    getPosition,
  } = useGeolocation();
  const [tilesUnavailable, setTilesUnavailable] = useState(false);
  const center: LatLngTuple =
    latitude !== null && longitude !== null ? [latitude, longitude] : [35, 15];

  return (
    <section className={styles.mapContainer} aria-label="Travel map">
      <div className={styles.toolbar}>
        <span>
          <strong>Your world, mapped.</strong>
          <small>Click anywhere to start a memory.</small>
        </span>
        <Button type="secondary" onClick={getPosition} disabled={isLoading}>
          {isLoading ? "Locating…" : "Use your position"}
        </Button>
      </div>
      {error && (
        <p className={styles.notice} role="alert">
          {error} You can still choose a point on the map.
        </p>
      )}
      {tilesUnavailable && (
        <p className={styles.notice} role="status">
          Map tiles are unavailable. Your journal still works.{" "}
          <Link tabIndex={0} to="/app/form">
            Add a place using coordinates.
          </Link>
        </p>
      )}
      <MapContainer
        center={center}
        zoom={latitude !== null ? 8 : 3}
        scrollWheelZoom={false}
        className={styles.map}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{
            tileerror: () => setTilesUnavailable(true),
            tileload: () => setTilesUnavailable(false),
          }}
        />
        {cities.map((city) => (
          <Marker
            position={[city.position.lat, city.position.lng]}
            key={city.id}
            icon={pin}
            title={city.cityName}
            alt={`Trip to ${city.cityName}`}
          >
            <Popup>
              <Link
                tabIndex={0}
                to={`/app/cities/${encodeURIComponent(city.id)}?lat=${city.position.lat}&lng=${city.position.lng}`}
              >
                {city.cityName}
              </Link>
            </Popup>
          </Marker>
        ))}
        <MapEvents position={center} locatedPosition={locatedPosition} />
      </MapContainer>
      <p className={styles.caption}>
        A pin for every place. A story for every stop.
      </p>
    </section>
  );
}

function MapEvents({
  position,
  locatedPosition,
}: {
  position: LatLngTuple;
  locatedPosition?: Position;
}) {
  const navigate = useNavigate();
  const map = useMap();
  const [latitude, longitude] = position;

  useEffect(() => {
    map.setView([latitude, longitude]);
  }, [map, latitude, longitude]);

  useEffect(() => {
    if (locatedPosition) {
      map.setView([locatedPosition.lat, locatedPosition.lng]);
    }
  }, [map, locatedPosition]);

  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);

  useMapEvents({
    click: (event) =>
      navigate(
        `/app/form?lat=${event.latlng.lat}&lng=${event.latlng.wrap().lng}`,
      ),
  });
  return null;
}
