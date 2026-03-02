"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { supabase, BUCKET_NAME } from "../lib/supabaseClient";

export default function UploadPage() {
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [nickname, setNickname] = useState("");
  const [description, setDescription] = useState("");
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
      <main className={styles.page}>
        <section className={styles.card}>
          <div className={styles.badge}>Create Heart Card</div>
          <h1 className={styles.title}>Share Your Love</h1>
          <p className={styles.sub}>
            Add your photo, nickname, and a short message. It will appear as a flipping heart in the gallery.
          </p>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="photo-upload">
                Photo
              </label>
              <div className={styles.fileRow}>
                <input
                  id="photo-upload"
                  ref={fileInputRef}
                  className={styles.fileInput}
                  type="file"
                  accept="image/*,image/heic,image/heif"
                  capture="environment"
                  onClick={(e) => {
                    e.currentTarget.value = "";
                  }}
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  className={styles.fileBtn}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </button>
                <span className={styles.fileName}>{file ? file.name : "No file selected"}</span>
              </div>
            </div>

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

          <div className={styles.actionRow}>
            <button className={styles.btn} onClick={handleUpload} disabled={loading}>
              {loading ? "Uploading..." : "Upload to Gallery"}
            </button>
            {/* Admin Page link removed — use gear button in header */}
          </div>
        </section>
      </main>
    </>
  );
}
