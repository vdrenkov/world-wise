import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import { useCities } from "../contexts/CitiesContext";
import { useGeolocation } from "../hooks/useGeolocation";
import { useUrlPosition } from "../hooks/useUrlPosition";
import { nameCurrentLocation } from "../services/geocoding";
import { localDate, newCitySchema, parsePosition } from "../types";
import Button from "./Button";
import styles from "./Form.module.css";

import type { Position } from "../types";
import type { FormEvent } from "react";

export default function Form() {
  const [latitude, longitude] = useUrlPosition();
  const position =
    latitude !== null && longitude !== null
      ? { lat: latitude, lng: longitude }
      : undefined;
  return (
    <TripForm
      key={position ? `${position.lat},${position.lng}` : "manual"}
      position={position}
    />
  );
}

function TripForm({ position }: { position?: Position }) {
  const navigate = useNavigate();
  const location = useLocation();
  const suggestion = newCitySchema
    .pick({ cityName: true, country: true, emoji: true })
    .safeParse(location.state);
  const { createCity } = useCities();
  const [cityName, setCityName] = useState(
    suggestion.success ? suggestion.data.cityName : "",
  );
  const [country, setCountry] = useState(
    suggestion.success ? suggestion.data.country : "",
  );
  const [emoji, setEmoji] = useState(
    suggestion.success ? suggestion.data.emoji : "📍",
  );
  const [date, setDate] = useState(localDate);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isNaming, setIsNaming] = useState(false);
  const {
    getPosition,
    isLoading: isLocating,
    error: locationError,
  } = useGeolocation();
  const controllerRef = useRef<AbortController | undefined>(undefined);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, []);

  async function handleCurrentLocation() {
    setError("");
    const currentPosition = await getPosition();

    if (!currentPosition || !mountedRef.current) {
      return;
    }

    setIsNaming(true);
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    let named;
    try {
      named = await nameCurrentLocation(
        currentPosition,
        controllerRef.current.signal,
      );
    } catch {
      if (mountedRef.current) {
        setError(
          "Location naming is unavailable. Enter the city and country manually.",
        );
      }
    } finally {
      if (mountedRef.current) {
        setIsNaming(false);
      }
    }

    if (!mountedRef.current) {
      return;
    }

    const target = `/app/form?lat=${currentPosition.lat}&lng=${currentPosition.lng}`;

    if (
      position?.lat === currentPosition.lat &&
      position.lng === currentPosition.lng
    ) {
      if (named) {
        setCityName(named.cityName);
        setCountry(named.country);
        setEmoji(named.emoji);
      }
    } else {
      await navigate(target, {
        replace: true,
        state: named ?? { lookupFailed: true },
      });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const selectedPosition =
      position ??
      parsePosition(
        String(form.get("latitude")),
        String(form.get("longitude")),
      );
    const result = newCitySchema.safeParse({
      cityName,
      country,
      emoji,
      date,
      notes,
      position: selectedPosition,
    });

    if (!result.success || date > localDate()) {
      setError(
        "Enter a city, country, valid coordinates, and a visit date that is not in the future.",
      );
      return;
    }

    setError("");
    const created = createCity(result.data);

    if (created) {
      await navigate("/app/cities");
    }
  }

  const busy = isNaming || isLocating;

  return (
    <section className={styles.section}>
      <p className="eyebrow">A new memory</p>
      <h1>Add a place</h1>
      <p className="muted">
        Pick a point on the map, or enter its coordinates below. Give it a name
        and a story.
      </p>
      <Button type="secondary" onClick={handleCurrentLocation} disabled={busy}>
        {isLocating
          ? "Finding your location…"
          : isNaming
            ? "Naming your location…"
            : "Use current location"}
      </Button>
      <p className={styles.hint}>
        Optional. Your current coordinates are sent to BigDataCloud to suggest a
        name.
      </p>
      {(error || locationError || location.state?.lookupFailed) && (
        <p className="alert" role="alert">
          {error ||
            locationError ||
            "Location naming is unavailable. Enter the city and country manually."}
        </p>
      )}
      <form className={styles.form} onSubmit={handleSubmit}>
        {position ? (
          <p className={styles.coordinates}>
            Selected point{" "}
            <strong>
              {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
            </strong>
          </p>
        ) : (
          <div className={styles.coordinateFields}>
            <div className="field">
              <label htmlFor="latitude">Latitude</label>
              <input
                id="latitude"
                name="latitude"
                type="number"
                min="-90"
                max="90"
                step="any"
                placeholder="42.6977"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="longitude">Longitude</label>
              <input
                id="longitude"
                name="longitude"
                type="number"
                min="-180"
                max="180"
                step="any"
                placeholder="23.3219"
                required
              />
            </div>
          </div>
        )}
        <div className="field">
          <label htmlFor="cityName">City name</label>
          <input
            id="cityName"
            value={cityName}
            onChange={(event) => setCityName(event.target.value)}
            maxLength={100}
            required
            autoComplete="address-level2"
          />
        </div>
        <div className="field">
          <label htmlFor="country">Country</label>
          <input
            id="country"
            value={country}
            onChange={(event) => {
              setCountry(event.target.value);
              setEmoji("📍");
            }}
            maxLength={100}
            required
            autoComplete="country-name"
          />
        </div>
        <div className="field">
          <label htmlFor="date">Visit date</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            max={localDate()}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="notes">
            Trip notes <span className="muted">(optional)</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={2000}
            rows={4}
            placeholder="The little things you want to remember…"
          />
        </div>
        <div className={styles.buttons}>
          <Button type="primary" htmlType="submit" disabled={busy}>
            Add
          </Button>
          <Link tabIndex={0} to="/app/cities">
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
