import { useEffect, useState } from "react";
import LoadingScreen from "../components/LoadingScreen";

import { useAuth } from "@/context/AuthContext";
import { Redirect } from "expo-router";

export default function Index() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  // Delay logic
  const [holdSplash, setHoldSplash] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setHoldSplash(false), 2500); // ADJUST TIME HERE
    return () => clearTimeout(t);
  }, []);

  const [splashGone, setSplashGone] = useState(false);
  const shouldShowSplash = loading || holdSplash;

  console.log("Index screen - loading:", loading, "user:", user?.email);

  if (!splashGone) {
    return (
      <LoadingScreen
        visible={shouldShowSplash}
        onHidden={() => setSplashGone(true)} // called after fade-out
        inDuration={400}
        outDuration={400}
      />
    );
  }

  return <Redirect href="/home" />;
}
