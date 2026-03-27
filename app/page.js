"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { supabase, BUCKET_NAME } from "../lib/supabaseClient";
import { STORES } from "../lib/stores";

export default function UploadPage() {
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [nickname, setNickname] = useState("");
  const [description, setDescription] = useState("");
  const [storeCode, setStoreCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    const nextFile = e.target.files?.[0] || null;
    setFile(nextFile);

    if (!nextFile) {
      setPreviewUrl("");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(typeof reader.result === "string" ? reader.result : "");
    };
    reader.onerror = () => {
      setPreviewUrl("");
      setError("Failed to load preview image.");
    };
    reader.readAsDataURL(nextFile);
  }

  function validate() {
    if (!storeCode) return "Please select your store.";
    if (!file) return "Please select a photo.";
    if (!nickname.trim()) return "Please enter a nickname.";
    if (!description.trim()) return "Please enter a short description.";
    if (description.length > 30) return "Description must be 30 characters or less.";
    return "";
  }

  async function handleUpload() {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const uuid =
        (typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID()) ||
        `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const filePath = `${uuid}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, { upsert: false });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
      const imageUrl = pub?.publicUrl;
      if (!imageUrl) throw new Error("Failed to create a public URL.");

      const selectedStore = STORES.find((s) => s.code === storeCode);
      const { error: dbErr } = await supabase.from("hearts").insert([
        {
          nickname: nickname.trim(),
          description: description.trim(),
          image_url: imageUrl,
          store_code: storeCode || null,
          store_name: selectedStore?.name || null,
        },
      ]);
      if (dbErr) throw dbErr;

      router.push(`/gallery?store=${storeCode}`);
    } catch (e) {
      setError(e?.message || "Upload failed.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.backdrop} aria-hidden="true">
        <div className={styles.glowA} />
        <div className={styles.glowB} />
        <div className={styles.glowC} />
      </div>

      <section className={styles.shell}>
        <section className={styles.card}>
          <div className={styles.formHeader}>
            <div>
              <div className={styles.sectionEyebrow}>Flip Heart Upload</div>
              <h1 className={styles.cardTitle}>Make your heart card</h1>
            </div>
            <div className={styles.counterPill}>
              <span>{description.length}</span>
              <small>/30</small>
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.uploadPanel}>
              <div className={styles.fieldTop}>
                <label className={styles.label} htmlFor="photo-upload">
                  1. Upload a photo
                </label>
                <span className={styles.helper}>Bright close-up works best.</span>
              </div>

              <div
                className={`${styles.uploadDropzone} ${previewUrl ? styles.hasPreview : ""}`}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <input
                  id="photo-upload"
                  ref={fileInputRef}
                  className={styles.fileInput}
                  type="file"
                  accept="image/*,image/heic,image/heif"
                  onClick={(e) => {
                    e.currentTarget.value = "";
                  }}
                  onChange={handleFileChange}
                />

                {previewUrl ? (
                  <>
                    <img className={styles.previewImg} src={previewUrl} alt="preview" />
                    <div className={styles.previewOverlay}>
                      <span className={styles.fileBtn}>Change photo</span>
                      <span className={styles.fileName}>{file?.name}</span>
                    </div>
                  </>
                ) : (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>❤</div>
                    <div className={styles.emptyTitle}>Tap to add your Yogurtland photo</div>
                    <div className={styles.emptyText}>
                      Camera and gallery uploads both work well on mobile.
                    </div>
                    <span className={styles.fileBtn}>Choose photo</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.fields}>
              <label className={styles.field}>
                <span className={styles.label}>1. Select your store</span>
                <select
                  className={styles.input}
                  value={storeCode}
                  onChange={(e) => setStoreCode(e.target.value)}
                >
                  <option value="">-- Select a store --</option>
                  {STORES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name} [{s.code}]
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.field}>
                <span className={styles.label}>3. Nickname</span>
                <input
                  className={styles.input}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Berry swirl fan"
                  maxLength={20}
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>
                  4. Short message{" "}
                  <span className={description.length >= 30 ? styles.countOver : styles.countMuted}>
                    ({description.length}/30)
                  </span>
                </span>
                <input
                  className={styles.input}
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 30))}
                  placeholder="My happiest yogurt run"
                  maxLength={30}
                />
                <span className={styles.helper}>Keep it short and clear.</span>
              </label>

              <div className={styles.tipBox}>
                <strong>Next</strong>
                <p>Your post goes straight to the gallery.</p>
              </div>
            </div>
          </div>

          {error ? <div className={styles.error}>{error}</div> : null}

          <div className={styles.actionRow}>
            <button className={styles.btn} onClick={handleUpload} disabled={loading}>
              {loading ? "Sending to the heart wall..." : "Share to Flip Heart"}
            </button>
            <p className={styles.rewardText}>Shows up in the gallery right away.</p>
          </div>
        </section>
      </section>
    </main>
  );
}
