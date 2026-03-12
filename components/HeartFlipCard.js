"use client";

import { useEffect, useState } from "react";
import styles from "./HeartFlipCard.module.css";

function hashString(value) {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h << 5) - h + value.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export default function HeartFlipCard({ item, onOpen }) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const seedBase = hashString(String(item?.id ?? item?.nickname ?? ""));
    let seed = seedBase || 1;
    let timer = null;
    let cancelled = false;

    const nextRand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    const run = () => {
      if (cancelled) return;
      setFlipped((v) => !v);
      const nextDelay = 4200 + Math.floor(nextRand() * 3400); // 4.2s ~ 7.6s
      timer = setTimeout(run, nextDelay);
    };

    const initialDelay = 900 + Math.floor(nextRand() * 2200);
    timer = setTimeout(run, initialDelay);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [item?.id, item?.nickname]);

  return (
    <button
      className={styles.cardBtn}
      onClick={() => onOpen(item)}
      aria-label={`${item.nickname} details`}
      type="button"
    >
      <div className={`${styles.flip} ${flipped ? styles.flipped : ""}`}>
        <div className={`${styles.face} ${styles.front}`}>
          <div className={styles.heartWrap}>
            <div className={styles.heartMask}>
              <img className={styles.img} src={item.image_url} alt={item.nickname} />
            </div>
            <div className={styles.heartOutline} aria-hidden="true" />
          </div>
        </div>

        <div className={`${styles.face} ${styles.back}`}>
          <div className={styles.heartWrap}>
            <div className={styles.heartBack}>
              <div className={styles.backInner}>
                <div className={styles.logo}>FLIP HEART</div>
                <div className={styles.nick}>{item.nickname}</div>
                <div className={styles.desc}>{item.description}</div>
              </div>
            </div>
            <div className={styles.heartOutline} aria-hidden="true" />
          </div>
        </div>
      </div>
    </button>
  );
}
