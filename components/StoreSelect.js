"use client";

import { useEffect, useRef, useState } from "react";
import { STORES } from "../lib/stores";
import styles from "./StoreSelect.module.css";

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function StoreSelect({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [nearestCodes, setNearestCodes] = useState([]);
  const [locating, setLocating] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selected = STORES.find((s) => s.code === value) ?? null;

  // Sort stores: nearest first, then alphabetical
  const sorted = [...STORES].sort((a, b) => {
    const ai = nearestCodes.indexOf(a.code);
    const bi = nearestCodes.indexOf(b.code);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  const filtered = sorted.filter((s) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
  });

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Auto-focus search input when opened
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Get nearest stores via geolocation
  async function locateMe() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords;
          // Reverse geocode to get city name
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const geo = await res.json();
          const city =
            geo.address?.city ||
            geo.address?.town ||
            geo.address?.village ||
            geo.address?.county ||
            "";

          // Find stores whose name contains the city keyword
          const cityWord = city.split(" ")[0].toLowerCase();
          const nearby = STORES.filter(
            (s) =>
              cityWord.length > 2 &&
              s.name.toLowerCase().includes(cityWord)
          ).map((s) => s.code);

          setNearestCodes(nearby);
          if (nearby.length > 0 && !value) {
            onChange(nearby[0]);
          }
        } catch {
          // silently fail
        } finally {
          setLocating(false);
        }
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  }

  function selectStore(code) {
    onChange(code);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <div
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""} ${disabled ? styles.triggerDisabled : ""}`}
        onClick={() => {
          if (!disabled) setOpen((v) => !v);
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!disabled) setOpen((v) => !v);
          }
        }}
      >
        <span className={selected ? styles.selectedLabel : styles.placeholder}>
          {selected ? `${selected.name} [${selected.code}]` : "-- Select your store --"}
        </span>
        <span className={styles.arrow}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.searchRow}>
            <input
              ref={inputRef}
              className={styles.searchInput}
              placeholder="Search store name or code..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="button"
              className={styles.locateBtn}
              onClick={locateMe}
              disabled={locating}
              title="Find nearest store"
            >
              {locating ? "..." : "📍"}
            </button>
          </div>

          {nearestCodes.length > 0 && !query && (
            <div className={styles.sectionLabel}>Nearby stores</div>
          )}

          <ul className={styles.list}>
            {filtered.length === 0 && (
              <li className={styles.empty}>No stores found.</li>
            )}
            {filtered.map((s) => (
              <li
                key={s.code}
                className={`${styles.item} ${s.code === value ? styles.itemSelected : ""} ${nearestCodes.includes(s.code) && !query ? styles.itemNear : ""}`}
                onClick={() => selectStore(s.code)}
              >
                {nearestCodes.includes(s.code) && !query && (
                  <span className={styles.nearPin}>📍</span>
                )}
                <span className={styles.itemName}>{s.name}</span>
                <span className={styles.itemCode}>[{s.code}]</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
