import { useEffect } from "react";
import { useParams } from "react-router";

import { useCities } from "../contexts/CitiesContext";
import { formatDate } from "../types";
import BackButton from "./BackButton";
import styles from "./City.module.css";
import Spinner from "./Spinner";

function City() {
  const { id } = useParams();
  const { getCity, currentCity, isLoading } = useCities();

  useEffect(
    function () {
      if (id) getCity(id);
    },
    [id, getCity],
  );

  if (isLoading) return <Spinner />;

  if (!currentCity) {
    return (
      <div className={styles.city}>
        <h1>Trip not found</h1>
        <p>This place is no longer in your journal.</p>
        <BackButton />
      </div>
    );
  }

  const { cityName, emoji, date, notes } = currentCity;

  return (
    <div className={styles.city}>
      <div>
        <p className="eyebrow">From your journal</p>
        <h1>
          <span>{emoji}</span> {cityName}
        </h1>
      </div>

      <div>
        <h2>You went to {cityName} on</h2>
        <time dateTime={date}>{formatDate(date)}</time>
      </div>

      {notes && (
        <div>
          <h2>Your notes</h2>
          <p>{notes}</p>
        </div>
      )}

      <div>
        <h2>Learn more</h2>
        <a
          tabIndex={0}
          href={`https://en.wikipedia.org/wiki/${encodeURIComponent(cityName)}`}
          target="_blank"
          rel="noreferrer"
        >
          Check out {cityName} on Wikipedia &rarr;
        </a>
      </div>

      <div>
        <BackButton />
      </div>
    </div>
  );
}

export default City;
