"use client";

import { useState } from "react";
import Navigation from "./Navigation";
import AdminLoginModal from "./AdminLoginModal";

export default function TopNav({ children }) {
  const [adminOpen, setAdminOpen] = useState(false);

  return (
    <>
      <Navigation onAdminClick={() => setAdminOpen(true)} />
      {children}
      <AdminLoginModal open={adminOpen} onClose={() => setAdminOpen(false)} />
    </>
  );
}
