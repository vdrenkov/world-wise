import styles from "./Button.module.css";

import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> {
  type: "primary" | "secondary" | "back";
  htmlType?: "button" | "submit";
}

function Button({
  children,
  type,
  htmlType = "button",
  className = "",
  ...properties
}: ButtonProps) {
  return (
    <button
      {...properties}
      type={htmlType}
      className={`${styles.btn} ${styles[type]} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
