import { useCities } from "../contexts/CitiesContext";
import CountryItem from "./CountryItem";
import styles from "./CountryList.module.css";
import Message from "./Message";

function CountryList() {
  const { cities } = useCities();

  if (!cities.length) {
    return (
      <div className="empty-state">
        <span aria-hidden="true">◎</span>
        <h1>A world to explore.</h1>
        <Message message="Add your first city by clicking on a city on the map." />
      </div>
    );
  }

  const countries = [
    ...new Map(
      cities.map((city) => [
        city.country.toLowerCase(),
        { country: city.country, emoji: city.emoji },
      ]),
    ).values(),
  ];

  return (
    <section>
      <div className="section-heading">
        <h1>Countries visited</h1>
        <span>Your world is growing.</span>
      </div>
      <ul className={styles.countryList}>
        {countries.map((country) => (
          <CountryItem country={country} key={country.country} />
        ))}
      </ul>
    </section>
  );
}

export default CountryList;
