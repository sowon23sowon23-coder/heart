"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import HeartFlipCard from "../../components/HeartFlipCard";
import DetailModal from "../../components/DetailModal";
import FloatingHearts from "../../components/FloatingHearts";
import styles from "./gallery.module.css";
import { supabase } from "../../lib/supabaseClient";
import { STORES } from "../../lib/stores";

/* ── Store picker (shown when no store is selected) ── */
function StorePicker({ onSelect }) {
  const [query, setQuery] = useState("");

  const filtered = STORES.filter((s) => {
    const q = query.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
  });

  return (
    <div className={styles.pickerWrap}>
      <div className={styles.wallHeader}>
        <div>
          <div className={styles.sectionEyebrow}>Community wall</div>
          <h2 className={styles.wallTitle}>Select a Store</h2>
        </div>
        <p className={styles.wallText}>Choose a store to view its gallery.</p>
      </div>

      <input
        className={styles.pickerSearch}
        placeholder="Search store name or code..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />

      <ul className={styles.storeList}>
        {filtered.map((s) => (
          <li key={s.code} className={styles.storeItem} onClick={() => onSelect(s.code)}>
            <span className={styles.storeItemName}>{s.name}</span>
            <span className={styles.storeItemCode}>[{s.code}]</span>
            <span className={styles.storeArrow}>›</span>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className={styles.state}>No stores found.</li>
        )}
      </ul>
    </div>
  );
}

/* ── Store gallery ── */
function StoreGallery({ storeCode, onBack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const store = STORES.find((s) => s.code === storeCode);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const { data, error: e } = await supabase
          .from("hearts")
          .select("*")
          .eq("store_code", storeCode)
          .order("created_at", { ascending: false });
        if (e) throw e;
        setItems(data || []);
      } catch (err) {
        setError(err?.message || "Failed to load the gallery.");
      } finally {
        setLoading(false);
      }
    })();
  }, [storeCode]);

  return (
    <>
      <main className={styles.page}>
        <FloatingHearts density={16} />

        <section className={styles.wall}>
          <div className={styles.wallHeader}>
            <div>
              <button className={styles.backBtn} onClick={onBack}>← All Stores</button>
              <div className={styles.sectionEyebrow}>Community wall</div>
              <h2 className={styles.wallTitle}>{store?.name ?? storeCode}</h2>
            </div>
            <p className={styles.wallText}>Tap any heart to open the full memory card.</p>
          </div>

          {loading && <div className={styles.state}>Loading the heart wall...</div>}
          {error && <div className={styles.state}>{error}</div>}
          {!loading && !error && items.length === 0 && (
            <div className={styles.state}>No uploads yet for this store.</div>
          )}
          {!loading && !error && items.length > 0 && (
            <div className={styles.stage}>
              <div className={styles.grid}>
                {items.map((item) => (
                  <HeartFlipCard key={item.id} item={item} onOpen={(i) => { setSelected(i); setOpen(true); }} />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <DetailModal open={open} onClose={() => setOpen(false)} item={selected} />
    </>
  );
}

/* ── Main page with Suspense ── */
function GalleryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const storeParam = searchParams.get("store") || "";
  const [storeCode, setStoreCode] = useState(storeParam);

  function selectStore(code) {
    setStoreCode(code);
    router.replace(`/gallery?store=${code}`, { scroll: false });
  }

  function goBack() {
    setStoreCode("");
    router.replace("/gallery", { scroll: false });
  }

  if (!storeCode) {
    return (
      <main className={styles.page}>
        <FloatingHearts density={16} />
        <section className={styles.wall}>
          <StorePicker onSelect={selectStore} />
        </section>
      </main>
    );
  }

  return <StoreGallery storeCode={storeCode} onBack={goBack} />;
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>Loading...</div>}>
      <GalleryContent />
    </Suspense>
  );
}
