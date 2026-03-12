"use client";

import { useEffect, useMemo, useState } from "react";
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

  const featured = items[0] || null;
  const stats = useMemo(
    () => [
      { label: "Shared hearts", value: loading ? "..." : String(items.length).padStart(2, "0") },
      { label: "Live mood", value: "Warm" },
      { label: "Screen mode", value: "Store wall" },
    ],
    [items.length, loading]
  );

  function openModal(item) {
    setSelected(item);
    setOpen(true);
  }

  return (
    <>
      <main className={styles.page}>
        <FloatingHearts density={16} />

        <section className={styles.hero}>
          <div className={styles.copyBlock}>
            <div className={styles.eyebrow}>Yogurtland live community gallery</div>
            <h1 className={styles.title}>Flip Heart</h1>
            <p className={styles.lead}>
              A playful wall of customer moments, floating like a shared dessert-day memory cloud.
            </p>
          </div>

          <div className={styles.stats}>
            {stats.map((stat) => (
              <div key={stat.label} className={styles.statCard}>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {featured ? (
          <section className={styles.featuredPanel}>
            <div className={styles.featuredCopy}>
              <div className={styles.sectionEyebrow}>Latest memory</div>
              <h2 className={styles.featuredTitle}>Fresh from the heart wall</h2>
              <p className={styles.featuredText}>
                New uploads appear here first, then join the floating gallery for everyone in store
                to enjoy.
              </p>
            </div>

            <button
              type="button"
              className={styles.featuredCard}
              onClick={() => openModal(featured)}
              aria-label={`${featured.nickname} featured memory`}
            >
              <img src={featured.image_url} alt={featured.nickname} className={styles.featuredImage} />
              <div className={styles.featuredOverlay}>
                <div className={styles.featuredNick}>{featured.nickname}</div>
                <div className={styles.featuredDesc}>{featured.description}</div>
              </div>
            </button>
          </section>
        ) : null}

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
