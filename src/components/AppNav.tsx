import { NavLink } from "react-router";

import styles from "./AppNav.module.css";

function AppNav() {
  return (
    <nav className={styles.nav} aria-label="Journal navigation">
      <ul>
        <li>
          <NavLink tabIndex={0} to="cities">
            Cities
          </NavLink>
        </li>
        <li>
          <NavLink tabIndex={0} to="countries">
            Countries
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default AppNav;
