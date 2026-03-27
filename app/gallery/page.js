"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import HeartFlipCard from "../../components/HeartFlipCard";
import DetailModal from "../../components/DetailModal";
import FloatingHearts from "../../components/FloatingHearts";
import styles from "./gallery.module.css";
import { supabase } from "../../lib/supabaseClient";
import { STORES } from "../../lib/stores";

export default function GalleryPage() {
  const searchParams = useSearchParams();
  const storeParam = searchParams.get("store") || "";

  const [storeCode, setStoreCode] = useState(storeParam);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const selectedStore = STORES.find((s) => s.code === storeCode) ?? null;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        let query = supabase
          .from("hearts")
          .select("*")
          .order("created_at", { ascending: false });

        if (storeCode) {
          query = query.eq("store_code", storeCode);
        }

        const { data, error: e } = await query;
        if (e) throw e;
        setItems(data || []);
      } catch (err) {
        setError(err?.message || "Failed to load the gallery.");
      } finally {
        setLoading(false);
      }
    })();
  }, [storeCode]);

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
              <h2 className={styles.wallTitle}>
                {selectedStore ? selectedStore.name : "All Stores"}
              </h2>
            </div>
            <p className={styles.wallText}>
              Tap any heart to open the full memory card.
            </p>
          </div>

          <div className={styles.storeFilter}>
            <select
              className={styles.storeSelect}
              value={storeCode}
              onChange={(e) => setStoreCode(e.target.value)}
            >
              <option value="">All Stores</option>
              {STORES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} [{s.code}]
                </option>
              ))}
            </select>
          </div>

          {loading ? <div className={styles.state}>Loading the heart wall...</div> : null}
          {error ? <div className={styles.state}>{error}</div> : null}
          {!loading && !error && items.length === 0 ? (
            <div className={styles.state}>No uploads yet for this store.</div>
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
