import { useCities } from "../contexts/CitiesContext";
import CityItem from "./CityItem";
import styles from "./CityList.module.css";
import Message from "./Message";

function CityList() {
  const { cities } = useCities();

  if (!cities.length) {
    return (
      <div className="empty-state">
        <span aria-hidden="true">◎</span>
        <h1>Your story starts here.</h1>
        <Message message="Add your first city by clicking on a city on the map." />
      </div>
    );
  }

  return (
    <section>
      <div className="section-heading">
        <h1>Your places</h1>
        <span>Every stop, a story.</span>
      </div>
      <ul className={styles.cityList}>
        {cities.map((city) => (
          <CityItem city={city} key={city.id} />
        ))}
      </ul>
    </section>
  );
}

export default CityList;
