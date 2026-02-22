"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./AdminLoginModal.module.css";

export default function AdminLoginModal({ open, onClose }) {
  const router = useRouter();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password: pw }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error || "Unauthorized");
      }

      // success -> navigate to admin
      onClose?.();
      router.push("/admin");
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.title}>Admin Login</div>
        <form className={styles.row} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            placeholder="Admin ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
          <input
            className={styles.input}
            placeholder="Password"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            required
          />

          {error ? <div className={styles.error}>{error}</div> : null}

          <div className={styles.actions}>
            <button type="button" className={styles.btnAlt} onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button className={styles.btn} type="submit" disabled={loading}>
              {loading ? "Checking..." : "Enter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
