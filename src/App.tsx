import React, { useEffect, useState } from "react";
import { AuthFlow } from "./components/auth";
import {
  DoctorDashboard,
  LabDashboard,
  MRSDashboard,
  PatientDashboard,
} from "./components/dashboards";
import { fetchMyProfile, supabase } from "./lib/supa";
import { Spinner } from "./components/shared";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const profile = await fetchMyProfile();
        if (!cancelled) {
          setUser(profile);
          setReady(true);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setReady(true);
        }
      }
    }

    // Initial load
    load();

    // React to sign-in / sign-out
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        load();
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!ready) return <Spinner full text="Loading DocuMed…" />;

  const handleLoggedIn = async () => {
    const profile = await fetchMyProfile();
    setUser(profile);
  };

  if (!user) return <AuthFlow onLoggedIn={handleLoggedIn} />;

  const onLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  switch (user.role) {
    case "Patient":
      return <PatientDashboard user={user} onLogout={onLogout} />;
    case "Doctor":
      return <DoctorDashboard user={user} onLogout={onLogout} />;
    case "Laboratory Staff":
      return <LabDashboard user={user} onLogout={onLogout} />;
    case "Medical Records Staff":
      return <MRSDashboard user={user} onLogout={onLogout} />;
    default:
      return <AuthFlow onLoggedIn={handleLoggedIn} />;
  }
}
