"use client";

import { useEffect, useState } from "react";
import HeartFlipCard from "../../components/HeartFlipCard";
import DetailModal from "../../components/DetailModal";
import FloatingHearts from "../../components/FloatingHearts";
import styles from "./gallery.module.css";
import { supabase } from "../../lib/supabaseClient";

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

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

  return (
    <>
      <main className={styles.page}>
        <FloatingHearts density={16} />

        <section className={styles.wall}>
          <div className={styles.wallHeader}>
            <div>
              <div className={styles.sectionEyebrow}>Community wall</div>
              <h2 className={styles.wallTitle}>Floating hearts gallery</h2>
            </div>
            <p className={styles.wallText}>
              Tap any heart to open the full memory card.
            </p>
          </div>

          {loading ? <div className={styles.state}>Loading the heart wall...</div> : null}
          {error ? <div className={styles.state}>{error}</div> : null}
          {!loading && !error && items.length === 0 ? (
            <div className={styles.state}>No uploads yet. Be the first to add a heart.</div>
          ) : null}

          {!loading && !error && items.length > 0 ? (
            <div className={styles.stage}>
              <div className={styles.grid}>
                {items.map((item) => (
                  <HeartFlipCard key={item.id} item={item} onOpen={openModal} />
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </main>

      <DetailModal open={open} onClose={() => setOpen(false)} item={selected} />
    </>
  );
}
