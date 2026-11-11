import { Link } from "react-router";

import { useCities } from "../contexts/CitiesContext";
import { formatDate } from "../types";
import styles from "./CityItem.module.css";

import type { City } from "../types";

function CityItem({ city }: { city: City }) {
  const { currentCity, deleteCity } = useCities();
  const { cityName, emoji, date, id, position } = city;

  return (
    <li className={styles.cityRow}>
      <Link
        tabIndex={0}
        className={`${styles.cityItem} ${
          id === currentCity?.id ? styles["cityItem--active"] : ""
        }`}
        to={`/app/cities/${encodeURIComponent(id)}?lat=${position.lat}&lng=${position.lng}`}
      >
        <span className={styles.emoji}>{emoji}</span>
        <h3 className={styles.name}>{cityName}</h3>
        <time dateTime={date} className={styles.date}>
          {formatDate(date)}
        </time>
      </Link>
      <button
        type="button"
        className={styles.deleteBtn}
        onClick={() => deleteCity(id)}
        aria-label={`Delete ${cityName}`}
      >
        &times;
      </button>
    </li>
  );
}

export default CityItem;
