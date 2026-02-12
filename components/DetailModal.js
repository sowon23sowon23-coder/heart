"use client";

export default function DetailModal({ open, onClose, item }) {
  if (!open || !item) return null;

  return (
    <div
      onMouseDown={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 9999,
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#fff",
          borderRadius: 18,
          padding: 14,
          boxShadow: "0 14px 40px rgba(0,0,0,.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>{item.nickname}</div>
          <button onClick={onClose} style={{ padding: "8px 10px", borderRadius: 999 }}>
            Close
          </button>
        </div>

        <img
          src={item.image_url}
          alt={item.nickname}
          style={{
            width: "100%",
            marginTop: 10,
            borderRadius: 16,
            maxHeight: 420,
            objectFit: "cover",
            border: "1px solid rgba(0,0,0,.08)",
          }}
        />

        <div
          style={{
            marginTop: 10,
            padding: "10px 12px",
            borderRadius: 14,
            background: "rgba(0,0,0,.04)",
            fontWeight: 700,
          }}
        >
          {item.description}
        </div>
      </div>
    </div>
  );
}
