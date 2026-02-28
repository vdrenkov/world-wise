import { Link } from "react-router";

import { useCities } from "../contexts/CitiesContext";

import styles from "./CityItem.module.css";

const formatDate = (date) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));

function CityItem({ city }) {
  const { currentCity, deleteCity } = useCities();
  const { cityName, emoji, date, id, position } = city;

  function handleDelete() {
    deleteCity(id);
  }

  return (
    <li className={styles.cityRow}>
      <Link
        className={`${styles.cityItem} ${
          id === currentCity.id ? styles["cityItem--active"] : ""
        }`}
        to={`${id}?lat=${position.lat}&lng=${position.lng}`}
      >
        <span className={styles.emoji}>{emoji}</span>
        <h3 className={styles.name}>{cityName}</h3>
        <time className={styles.date}>({formatDate(date)})</time>
      </Link>
      <button
        type="button"
        className={styles.deleteBtn}
        onClick={handleDelete}
        aria-label={`Delete ${cityName}`}
      >
        &times;
      </button>
    </li>
  );
}

export default CityItem;

