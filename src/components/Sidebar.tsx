import { Link, Outlet } from "react-router";

import { useCities } from "../contexts/CitiesContext";
import AppNav from "./AppNav";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const { cities, error, unreadable, reloadCities, resetCities } = useCities();
  const countries = new Set(cities.map((city) => city.country.toLowerCase()))
    .size;

  function confirmReset() {
    if (
      window.confirm(
        "Delete the unreadable journal saved in this browser? This cannot be undone.",
      )
    ) {
      resetCities();
    }
  }

  return (
    <aside className={styles.sidebar} aria-label="Travel journal">
      <div className={styles.intro}>
        <p className="eyebrow">Collect moments, not things.</p>
        <div className={styles.stats}>
          <span>
            <strong>{cities.length}</strong>{" "}
            {cities.length === 1 ? "place" : "places"}
          </span>
          <span>
            <strong>{countries}</strong>{" "}
            {countries === 1 ? "country" : "countries"}
          </span>
          <Link to="/app/form" className="cta">
            + Add a place
          </Link>
        </div>
      </div>
      <AppNav />
      {error && (
        <div className="alert" role="alert">
          <p>{error}</p>
          <button type="button" onClick={reloadCities}>
            Retry loading
          </button>
          {unreadable && (
            <button type="button" onClick={confirmReset}>
              Reset local journal
            </button>
          )}
        </div>
      )}
      <div className={styles.content}>
        <Outlet />
      </div>
      <footer className={styles.footer}>
        Saved in this browser · No cloud sync
      </footer>
    </aside>
  );
}
