"use client";

import { useEffect, useState } from "react";
import HeartFlipCard from "../../components/HeartFlipCard";
import DetailModal from "../../components/DetailModal";
import styles from "./gallery.module.css";
import { supabase } from "../../lib/supabaseClient";

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [adminOpen, setAdminOpen] = useState(false);

  useEffect(() => {
    (async () => {
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
        setError(err?.message || "Failed to load the gallery.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function openModal(item) {
    setSelected(item);
    setOpen(true);
  }

  function openAdmin() {
    setAdminOpen(true);
  }

  return (
    <>
      <main className={styles.page}>
        <h1 className={styles.title}>Gallery</h1>

        {loading ? <div className={styles.state}>Loading...</div> : null}
        {error ? <div className={styles.state}>{error}</div> : null}
        {!loading && !error && items.length === 0 ? (
          <div className={styles.state}>No uploads yet. Be the first to add a heart.</div>
        ) : null}

        <section className={styles.stage}>
          <div className={styles.grid}>
            {items.map((item) => (
              <HeartFlipCard key={item.id} item={item} onOpen={openModal} />
            ))}
          </div>
        </section>
      </main>

      <DetailModal open={open} onClose={() => setOpen(false)} item={selected} />
    </>
  );
}
