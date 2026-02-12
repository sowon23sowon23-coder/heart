"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navigation.module.css";

export default function Navigation() {
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
      </nav>
    </header>
  );
}
