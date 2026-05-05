"use client";

import { useState } from "react";
import { CheckCircle, Disc, Search, Trophy, UserPlus } from "lucide-react";
import { CheckInData, CheckInModal } from "./CheckInModal";
import { CheckedInPlayer } from "./types";
import { useIsMobile } from "./useIsMobile";

// Placeholder roster data from Figma handoff.
// TODO: replace with API/database roster read when backend is added.
const ROSTER = [
  { id: 1, name: "John Smith", rating: 912 },
  { id: 2, name: "Maria Garcia", rating: 887 },
  { id: 3, name: "Tyler Brooks", rating: 945 },
  { id: 4, name: "Aisha Johnson", rating: 831 },
  { id: 5, name: "Derek Nguyen", rating: 960 },
];

type ModalTarget =
  | { mode: "existing"; player: (typeof ROSTER)[number] }
  | { mode: "new" }
  | { mode: "edit"; player: CheckedInPlayer };

function computePools(players: CheckedInPlayer[]) {
  if (players.length === 0) return { aPool: [] as CheckedInPlayer[], bPool: [] as CheckedInPlayer[] };
  const sorted = [...players].sort((a, b) => b.rating - a.rating);
  const aCount = Math.ceil(sorted.length / 2);
  const byAlpha = (arr: CheckedInPlayer[]) => [...arr].sort((a, b) => a.name.localeCompare(b.name));
  return { aPool: byAlpha(sorted.slice(0, aCount)), bPool: byAlpha(sorted.slice(aCount)) };
}

function RatingBadge({ type }: { type: "PDGA" | "UDisc" | "Other" }) {
  const map: Record<string, { bg: string; text: string }> = {
    PDGA: { bg: "#dbeafe", text: "#1d4ed8" },
    UDisc: { bg: "#d1fae5", text: "#065f46" },
    Other: { bg: "#f3f4f6", text: "#4b5563" },
  };
  const c = map[type];
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.04em",
        background: c.bg,
        color: c.text,
        padding: "3px 8px",
        borderRadius: "999px",
        whiteSpace: "nowrap",
      }}
    >
      {type}
    </span>
  );
}

function AceBadge() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        fontSize: "11px",
        fontWeight: 600,
        background: "#ecfeff",
        color: "#0891b2",
        padding: "3px 8px",
        borderRadius: "999px",
        whiteSpace: "nowrap",
      }}
    >
      <Disc size={10} strokeWidth={2.5} /> Ace
    </span>
  );
}

function PoolColumn({
  label,
  players,
  headerBg,
  borderColor,
  onPlayerClick,
  isMobile,
}: {
  label: string;
  players: CheckedInPlayer[];
  headerBg: string;
  borderColor: string;
  onPlayerClick: (p: CheckedInPlayer) => void;
  isMobile: boolean;
}) {
  return (
    <div
      style={{
        flex: 1,
        background: "#ffffff",
        borderRadius: "14px",
        border: `1.5px solid ${borderColor}`,
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,43,77,0.06)",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          background: headerBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>{label}</span>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 700,
            background: "rgba(255,255,255,0.25)",
            color: "#ffffff",
            padding: "3px 10px",
            borderRadius: "999px",
          }}
        >
          {players.length}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {players.length === 0 && (
          <p style={{ color: "#94a3b8", fontSize: "13px", textAlign: "center", padding: "20px 12px", margin: 0 }}>
            No players yet
          </p>
        )}
        {players.map((p, i) => (
          <div
            key={p.uid}
            onClick={() => onPlayerClick(p)}
            style={{
              padding: isMobile ? "16px" : "12px 14px",
              minHeight: "52px",
              borderTop: i >= 0 ? "1px solid #f1f5f9" : "none",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "5px",
              cursor: "pointer",
              transition: "background 0.12s",
              WebkitTapHighlightColor: "transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = "#f8faff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = "";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#002b4d" }}>{p.name}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
                {p.acePotPaid && <AceBadge />}
                <RatingBadge type={p.ratingType} />
              </div>
            </div>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              Rating: <strong style={{ color: "#0077cc" }}>{p.rating}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface Props {
  checkedInPlayers: CheckedInPlayer[];
  onAddPlayer: (player: CheckedInPlayer) => void;
  onRemovePlayer: (uid: string) => void;
  onUpdatePlayer: (player: CheckedInPlayer) => void;
}

export function CheckInPanel({ checkedInPlayers, onAddPlayer, onRemovePlayer, onUpdatePlayer }: Props) {
  const isMobile = useIsMobile();
  const [query, setQuery] = useState("");
  const [modalTarget, setModalTarget] = useState<ModalTarget | null>(null);

  const checkedInRosterIds = new Set(checkedInPlayers.map((p) => p.rosterId).filter(Boolean));
  const searchResults = query.trim()
    ? ROSTER.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  const { aPool, bPool } = computePools(checkedInPlayers);

  function openModal(target: ModalTarget) {
    setQuery("");
    setModalTarget(target);
  }

  function handleRemoveFromSearch(player: (typeof ROSTER)[number]) {
    const cp = checkedInPlayers.find((p) => p.rosterId === player.id);
    if (cp) onRemovePlayer(cp.uid);
  }

  function handleModalConfirm(data: CheckInData) {
    if (!modalTarget) return;
    if (modalTarget.mode === "existing") {
      onAddPlayer({
        uid: `roster-${modalTarget.player.id}`,
        rosterId: modalTarget.player.id,
        name: data.name,
        rating: data.rating,
        ratingType: data.ratingType,
        leagueFeePaid: data.leagueFeePaid,
        leagueFeeMethod: data.leagueFeeMethod,
        acePotPaid: data.acePotPaid,
        acePotMethod: data.acePotMethod,
      });
    } else if (modalTarget.mode === "new") {
      onAddPlayer({
        uid: `new-${Date.now()}`,
        name: data.name,
        rating: data.rating,
        ratingType: data.ratingType,
        leagueFeePaid: data.leagueFeePaid,
        leagueFeeMethod: data.leagueFeeMethod,
        acePotPaid: data.acePotPaid,
        acePotMethod: data.acePotMethod,
      });
    } else if (modalTarget.mode === "edit") {
      onUpdatePlayer({
        ...modalTarget.player,
        name: data.name,
        rating: data.rating,
        ratingType: data.ratingType,
        leagueFeePaid: data.leagueFeePaid,
        leagueFeeMethod: data.leagueFeeMethod,
        acePotPaid: data.acePotPaid,
        acePotMethod: data.acePotMethod,
      });
    }
    setModalTarget(null);
  }

  function handleModalRemove() {
    if (modalTarget?.mode === "edit") onRemovePlayer(modalTarget.player.uid);
    setModalTarget(null);
  }

  function getInitialData() {
    if (!modalTarget) return undefined;
    if (modalTarget.mode === "existing") return { name: modalTarget.player.name, rating: modalTarget.player.rating };
    if (modalTarget.mode === "edit") {
      const p = modalTarget.player;
      return {
        name: p.name,
        rating: p.rating,
        ratingType: p.ratingType,
        leagueFeePaid: p.leagueFeePaid,
        leagueFeeMethod: p.leagueFeeMethod,
        acePotPaid: p.acePotPaid,
        acePotMethod: p.acePotMethod,
      };
    }
    return undefined;
  }

  const pad = isMobile ? "20px" : "28px 32px";

  return (
    <div style={{ display: "flex", flexDirection: "column", padding: pad, gap: "18px" }}>
      <div>
        <h2 style={{ color: "#002b4d", margin: 0 }}>Find a Player</h2>
        <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: "14px" }}>Search the roster or add someone new</p>
      </div>

      <button
        onClick={() => openModal({ mode: "new" })}
        style={{
          width: "100%",
          minHeight: "52px",
          padding: "14px",
          borderRadius: "12px",
          border: "2px dashed #93c5fd",
          background: "#eff6ff",
          color: "#0077cc",
          fontSize: "15px",
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          transition: "background 0.15s, border-color 0.15s",
          WebkitTapHighlightColor: "transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#dbeafe";
          e.currentTarget.style.borderColor = "#60a5fa";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#eff6ff";
          e.currentTarget.style.borderColor = "#93c5fd";
        }}
      >
        <UserPlus size={18} /> + Add New Player
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ position: "relative" }}>
          <Search
            size={17}
            style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
          />
          <input
            type="text"
            placeholder="Search player name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: "100%",
              minHeight: "52px",
              paddingLeft: "42px",
              paddingRight: "16px",
              paddingTop: "14px",
              paddingBottom: "14px",
              borderRadius: "12px",
              border: "1.5px solid #bfdbfe",
              backgroundColor: "#ffffff",
              outline: "none",
              fontSize: "16px", // 16px prevents iOS zoom on focus
              color: "#002b4d",
              boxSizing: "border-box",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#0077cc";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,119,204,0.12)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#bfdbfe";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        {query.trim().length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              background: "#ffffff",
              border: "1.5px solid #dbeafe",
              borderRadius: "14px",
              padding: "8px",
              boxShadow: "0 4px 16px rgba(0,43,77,0.08)",
            }}
          >
            {searchResults.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "13px", textAlign: "center", padding: "16px", margin: 0 }}>
                No players found — use &quot;+ Add New Player&quot; above
              </p>
            ) : (
              searchResults.map((player) => {
                const isIn = checkedInRosterIds.has(player.id);
                return (
                  <div
                    key={player.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: isMobile ? "14px" : "12px 14px",
                      minHeight: "60px",
                      borderRadius: "10px",
                      background: isIn ? "#eff6ff" : "#f8faff",
                      border: `1.5px solid ${isIn ? "#93c5fd" : "#e2e8f0"}`,
                      gap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "15px", fontWeight: 600, color: "#002b4d" }}>{player.name}</span>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        Rating: <strong style={{ color: "#0077cc" }}>{player.rating}</strong>
                      </span>
                    </div>
                    {isIn ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#16a34a" }}>
                          <CheckCircle size={15} />
                          <span style={{ fontSize: "13px", fontWeight: 600 }}>Checked In</span>
                        </div>
                        <button
                          onClick={() => handleRemoveFromSearch(player)}
                          style={{
                            padding: "8px 14px",
                            minHeight: "40px",
                            borderRadius: "8px",
                            border: "1.5px solid #fca5a5",
                            background: "#fff5f5",
                            color: "#dc2626",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            WebkitTapHighlightColor: "transparent",
                          }}
                        >
                          Undo
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => openModal({ mode: "existing", player })}
                        style={{
                          padding: "10px 20px",
                          minHeight: "48px",
                          borderRadius: "10px",
                          border: "none",
                          background: "#0077cc",
                          color: "#ffffff",
                          fontSize: "14px",
                          fontWeight: 600,
                          cursor: "pointer",
                          flexShrink: 0,
                          boxShadow: "0 2px 6px rgba(0,119,204,0.25)",
                          WebkitTapHighlightColor: "transparent",
                        }}
                      >
                        Check In
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Trophy size={15} style={{ color: "#0077cc" }} />
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#002b4d" }}>Pools</span>
          {checkedInPlayers.length > 0 && (
            <>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  background: "#dbeafe",
                  color: "#1d4ed8",
                  padding: "2px 9px",
                  borderRadius: "999px",
                }}
              >
                {checkedInPlayers.length} player{checkedInPlayers.length !== 1 ? "s" : ""}
              </span>
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>· tap to edit</span>
            </>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? "14px" : "12px",
            alignItems: "stretch",
          }}
        >
          <PoolColumn
            label="A Pool"
            players={aPool}
            headerBg="#0077cc"
            borderColor="#bfdbfe"
            onPlayerClick={(p) => setModalTarget({ mode: "edit", player: p })}
            isMobile={isMobile}
          />
          <PoolColumn
            label="B Pool"
            players={bPool}
            headerBg="#0891b2"
            borderColor="#a5f3fc"
            onPlayerClick={(p) => setModalTarget({ mode: "edit", player: p })}
            isMobile={isMobile}
          />
        </div>
      </div>

      <CheckInModal
        isOpen={modalTarget !== null}
        mode={modalTarget?.mode ?? "new"}
        initialData={getInitialData()}
        onConfirm={handleModalConfirm}
        onRemove={handleModalRemove}
        onClose={() => setModalTarget(null)}
      />
    </div>
  );
}
