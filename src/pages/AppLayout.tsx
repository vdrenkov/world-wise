import Logo from "../components/Logo";
import Map from "../components/Map";
import Sidebar from "../components/Sidebar";
import User from "../components/User";
import styles from "./AppLayout.module.css";

function AppLayout() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <Logo />
        <User />
      </header>
      <div className={styles.workspace}>
        <Sidebar />
        <Map />
      </div>
    </div>
  );
}

export default AppLayout;
