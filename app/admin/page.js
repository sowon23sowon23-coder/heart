"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import styles from "./page.module.css";

export default function AdminPage() {
  const [items, setItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadItems() {
    try {
      setLoading(true);
      setError("");
      const { data, error: e } = await supabase
        .from("hearts")
        .select("*")
        .order("created_at", { ascending: false });
      if (e) throw e;
      setItems(data || []);
    } catch (err) {
      setError(err?.message || "Failed to load items.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  function toggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }

  const selectedCount = useMemo(() => selectedIds.length, [selectedIds]);

  async function deleteSelected() {
    if (!selectedCount || deleting) return;
    const ok = window.confirm(`Delete ${selectedCount} selected item(s)?`);
    if (!ok) return;

    try {
      setDeleting(true);
      setError("");
      setMessage("");
      const res = await fetch("/api/admin/delete-heart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Delete failed.");

      setMessage(`Deleted ${payload.deleted} item(s).`);
      setSelectedIds([]);
      await loadItems();
    } catch (err) {
      setError(err?.message || "Delete failed.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin</h1>
          <p className={styles.sub}>Select uploaded images and remove them from gallery.</p>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.btnDanger}
            onClick={deleteSelected}
            disabled={!selectedCount || deleting}
          >
            {deleting ? "Deleting..." : `Delete Selected (${selectedCount})`}
          </button>
          <Link className={styles.btn} href="/gallery">
            Back to Gallery
          </Link>
        </div>
      </header>

      {error ? <div className={styles.error}>{error}</div> : null}
      {message ? <div className={styles.success}>{message}</div> : null}

      {loading ? <div className={styles.state}>Loading...</div> : null}
      {!loading && !items.length ? <div className={styles.state}>No items found.</div> : null}

      <section className={styles.grid}>
        {items.map((item) => {
          const checked = selectedIds.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              className={`${styles.card} ${checked ? styles.cardSelected : ""}`}
              onClick={() => toggleSelect(item.id)}
            >
              <img src={item.image_url} alt={item.nickname} className={styles.img} />
              <div className={styles.meta}>
                <div className={styles.nick}>{item.nickname}</div>
                <div className={styles.desc}>{item.description}</div>
              </div>
              <div className={styles.check}>{checked ? "Selected" : "Select"}</div>
            </button>
          );
        })}
      </section>
    </main>
  );
}

