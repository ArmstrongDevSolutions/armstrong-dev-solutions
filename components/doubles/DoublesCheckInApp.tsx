"use client";

import { useEffect, useState } from "react";
import { CheckInPanel } from "./CheckInPanel";
import { LiveTotalsPanel } from "./LiveTotalsPanel";
import { AcePotDonation, CheckedInPlayer } from "./types";
import { useIsMobile } from "./useIsMobile";

export default function DoublesCheckInApp() {
  const isMobile = useIsMobile();
  const [checkedInPlayers, setCheckedInPlayers] = useState<CheckedInPlayer[]>([]);
  const [acePot, setAcePot] = useState(246);
  const [acePotDonations, setAcePotDonations] = useState<AcePotDonation[]>([]);

  useEffect(() => {
    // Doubles UI uses a fixed exported theme, so disable site dark mode while this page is active.
    const root = document.documentElement;
    const wasDark = root.classList.contains("dark");
    if (wasDark) root.classList.remove("dark");

    return () => {
      if (wasDark) root.classList.add("dark");
    };
  }, []);

  function handleAddPlayer(player: CheckedInPlayer) {
    // TODO: future API/database write for player check-in.
    setCheckedInPlayers((prev) => [...prev, player]);
    if (player.acePotPaid) setAcePot((prev) => prev + 2);
  }

  function handleRemovePlayer(uid: string) {
    // TODO: future API/database write for check-in removal.
    const player = checkedInPlayers.find((p) => p.uid === uid);
    setCheckedInPlayers((prev) => prev.filter((p) => p.uid !== uid));
    if (player?.acePotPaid) setAcePot((prev) => Math.max(0, prev - 2));
  }

  function handleUpdatePlayer(updated: CheckedInPlayer) {
    // TODO: future API/database write for player update.
    const old = checkedInPlayers.find((p) => p.uid === updated.uid);
    setCheckedInPlayers((prev) => prev.map((p) => (p.uid === updated.uid ? updated : p)));
    if (old && old.acePotPaid !== updated.acePotPaid) {
      setAcePot((prev) => (updated.acePotPaid ? prev + 2 : Math.max(0, prev - 2)));
    }
  }

  function handleAddDonation(donation: AcePotDonation) {
    // TODO: future API/database write for ace pot donation.
    setAcePotDonations((prev) => [...prev, donation]);
    setAcePot((prev) => prev + donation.amount);
  }

  function handleCashOut() {
    // TODO: future API/database write for ace pot cash out.
    setAcePot(0);
    setAcePotDonations([]);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#f0f7ff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <main
        style={{
          flex: isMobile ? "none" : 1,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          minHeight: isMobile ? "auto" : 0,
          width: "100%",
          background: isMobile ? "#f0f7ff" : "linear-gradient(to right, #f0f7ff 50%, #f8faff 50%)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            flex: isMobile ? "none" : 1,
            flexDirection: isMobile ? "column" : "row",
            minHeight: isMobile ? "auto" : 0,
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: isMobile ? "visible" : "auto",
              borderRight: isMobile ? "none" : "1px solid #dbeafe",
              borderBottom: isMobile ? "2px solid #dbeafe" : "none",
            }}
          >
            <CheckInPanel
              checkedInPlayers={checkedInPlayers}
              onAddPlayer={handleAddPlayer}
              onRemovePlayer={handleRemovePlayer}
              onUpdatePlayer={handleUpdatePlayer}
            />
          </div>
          <div
            style={{
              flex: 1,
              overflowY: isMobile ? "visible" : "auto",
            }}
          >
            <LiveTotalsPanel
              checkedInPlayers={checkedInPlayers}
              acePot={acePot}
              acePotDonations={acePotDonations}
              onAddDonation={handleAddDonation}
              onCashOut={handleCashOut}
            />
          </div>
        </div>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}
