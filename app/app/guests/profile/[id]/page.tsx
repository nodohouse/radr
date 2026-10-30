"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useParams } from "next/navigation";
import { GuestProfile } from "@/components/product/guests/GuestProfile";
import { guestProfile } from "@/lib/radr/product/guestAttention";
import "@/components/product/guests/guest.css";

function ProfileBody() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const profile = guestProfile(id);

  if (!profile) {
    return (
      <div className="gi-root">
        <section className="gi-placeholder">
          <h2>Guest not found</h2>
          <p>No fictional profile for “{id}” in the demo set.</p>
          <Link href="/app/guests?view=overview" className="gi-btn-primary">
            ← Back to Overview
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="gi-root">
      <GuestProfile profile={profile} />
    </div>
  );
}

export default function GuestProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileBody />
    </Suspense>
  );
}
