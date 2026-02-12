"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "../components/Navigation";
import styles from "./page.module.css";
import { supabase, BUCKET_NAME } from "../lib/supabaseClient";

export default function UploadPage() {
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [nickname, setNickname] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const previewUrl = useMemo(() => {
    if (!file) return "";
    return URL.createObjectURL(file);
  }, [file]);

  function validate() {
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

      const { error: dbErr } = await supabase.from("hearts").insert([
        {
          nickname: nickname.trim(),
          description: description.trim(),
          image_url: imageUrl,
        },
      ]);
      if (dbErr) throw dbErr;

      router.push("/gallery");
    } catch (e) {
      setError(e?.message || "Upload failed.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navigation />
      <main className={styles.page}>
        <section className={styles.card}>
          <div className={styles.badge}>Create Heart Card</div>
          <h1 className={styles.title}>Share Your Love</h1>
          <p className={styles.sub}>
            Add your photo, nickname, and a short message. It will appear as a flipping heart in the gallery.
          </p>

          <div className={styles.grid}>
            <label className={styles.field}>
              <span className={styles.label}>Photo</span>
              <div className={styles.fileRow}>
                <input
                  id="photo-upload"
                  className={styles.fileInput}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="photo-upload" className={styles.fileBtn}>
                  Choose File
                </label>
                <span className={styles.fileName}>{file ? file.name : "No file selected"}</span>
              </div>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Nickname</span>
              <input
                className={styles.input}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. sowon"
                maxLength={20}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>
                Description <span className={styles.hint}>({description.length}/30)</span>
              </span>
              <input
                className={styles.input}
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 30))}
                placeholder="Tell us about your love"
                maxLength={30}
              />
            </label>
          </div>

          <div className={styles.previewWrap}>
            <div className={styles.previewTitle}>Preview</div>
            {previewUrl ? (
              <img className={styles.previewImg} src={previewUrl} alt="preview" />
            ) : (
              <div className={styles.previewEmpty}>Your selected photo will appear here.</div>
            )}
          </div>

          <div className={styles.tipBox}>
            <strong>Tips</strong>
            <p>Use a close-up photo and a short message for the best gallery result.</p>
          </div>

          {error ? <div className={styles.error}>{error}</div> : null}

          <button className={styles.btn} onClick={handleUpload} disabled={loading}>
            {loading ? "Uploading..." : "Upload to Gallery"}
          </button>
        </section>
      </main>
    </>
  );
}
