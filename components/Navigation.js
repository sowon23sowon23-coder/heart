"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navigation.module.css";

export default function Navigation({ onAdminClick }) {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.brand}>Heart Gallery</div>
      <nav className={styles.nav}>
        <Link
          className={`${styles.linkBtn} ${pathname === "/" ? styles.active : ""}`}
          href="/"
        >
          Upload
        </Link>
        <Link
          className={`${styles.linkBtn} ${pathname === "/gallery" ? styles.active : ""}`}
          href="/gallery"
        >
          Gallery
        </Link>
        <button aria-label="Open admin" onClick={onAdminClick} className={styles.adminBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" fill="currentColor" />
            <path d="M19.4 15a7.9 7.9 0 0 0 .1-1 7.9 7.9 0 0 0-.1-1l2.1-1.6a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.6-.22l-2.5 1a8.2 8.2 0 0 0-1.7-.99l-.38-2.65A.5.5 0 0 0 13.3 2h-4.6a.5.5 0 0 0-.5.42l-.38 2.65c-.6.24-1.16.55-1.7.99l-2.5-1a.5.5 0 0 0-.6.22L2.4 8.74a.5.5 0 0 0 .12.64L4.6 11a7.9 7.9 0 0 0-.1 1c0 .34.03.68.1 1L2.4 15.6a.5.5 0 0 0-.12.64l2 3.46a.5.5 0 0 0 .6.22l2.5-1c.54.44 1.1.75 1.7.99l.38 2.65a.5.5 0 0 0 .5.42h4.6a.5.5 0 0 0 .5-.42l.38-2.65c.6-.24 1.16-.55 1.7-.99l2.5 1a.5.5 0 0 0 .6-.22l2-3.46a.5.5 0 0 0-.12-.64L19.4 15z" fill="currentColor" opacity=".9"/>
          </svg>
        </button>
      </nav>
    </header>
  );
}
