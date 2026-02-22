"use client";

import styles from "./DetailModal.module.css";

export default function DetailModal({ open, onClose, item }) {
  if (!open || !item) return null;

  return (
    <div onMouseDown={onClose} className={styles.overlay}>
      <div onMouseDown={(e) => e.stopPropagation()} className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.title}>{item.nickname}</div>
          <button onClick={onClose} className={styles.closeBtn}>
            Close
          </button>
        </div>

        <img src={item.image_url} alt={item.nickname} className={styles.image} />

        <div className={styles.desc}>{item.description}</div>
      </div>
    </div>
  );
}
