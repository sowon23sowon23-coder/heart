"use client";

import { useMemo } from "react";
import styles from "./FloatingHearts.module.css";

export default function FloatingHearts({ density = 12 }) {
  const hearts = useMemo(
    () =>
      Array.from({ length: density }, (_, index) => {
        const left = (index * 13) % 100;
        const top = (index * 17) % 100;
        const delay = (index % 7) * 0.8;
        const duration = 8 + (index % 5) * 1.2;
        const size = 18 + ((index * 7) % 18);
        return { id: index, left, top, delay, duration, size };
      }),
    [density]
  );

  return (
    <div className={styles.container} aria-hidden="true">
      {hearts.map((heart) => (
        <span
          key={heart.id}
          className={styles.heart}
          style={{
            left: `${heart.left}%`,
            top: `${heart.top}%`,
            width: `${heart.size}px`,
            height: `${heart.size}px`,
            animationDelay: `${heart.delay}s`,
            animationDuration: `${heart.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
