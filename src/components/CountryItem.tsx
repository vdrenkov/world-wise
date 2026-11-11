import styles from "./CountryItem.module.css";

function CountryItem({
  country,
}: {
  country: { country: string; emoji: string };
}) {
  return (
    <li className={styles.countryItem}>
      <span>{country.emoji}</span>
      <span>{country.country}</span>
    </li>
  );
}

export default CountryItem;
