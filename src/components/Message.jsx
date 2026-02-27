import styles from "./Message.module.css";

const waveHandIcon =
  "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2024%2024%27%3E%3Ctext%20x%3D%272%27%20y%3D%2719%27%20font-size%3D%2720%27%3E%F0%9F%91%8B%3C/text%3E%3C/svg%3E";

function Message({ message }) {
  return (
    <p className={styles.message}>
      <img className={styles.icon} src={waveHandIcon} alt="Waving hand" />{" "}
      {message}
    </p>
  );
}

export default Message;
