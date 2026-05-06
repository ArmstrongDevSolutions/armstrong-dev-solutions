"use client";

import { useState } from "react";
import { Disc, Search, Trophy, UserPlus, X } from "lucide-react";
import { CheckInData, CheckInModal } from "./CheckInModal";
import { comparablePdgaRating } from "./poolRating";
import { CheckedInPlayer, RosterPlayer } from "./types";
import { useIsMobile } from "./useIsMobile";

type ModalTarget =
  | { mode: "existing"; player: RosterPlayer }
  | { mode: "new" }
  | { mode: "edit"; player: CheckedInPlayer };

function normalizePersonName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function tokenize(name: string) {
  return normalizePersonName(name).split(" ").filter(Boolean);
}

function findDuplicateRosterPlayer(roster: RosterPlayer[], enteredName: string): RosterPlayer | undefined {
  const n = normalizePersonName(enteredName);
  if (!n) return undefined;
  return roster.find((p) => normalizePersonName(p.name) === n);
}

/** Suggest an unchecked roster row when the typed name looks like a nickname / subset (e.g. “Mike” vs “Mike Armstrong”). */
function findSimilarRosterPlayer(
  roster: RosterPlayer[],
  enteredName: string,
  excludeCheckedInIds: Set<string>,
): RosterPlayer | undefined {
  const n = normalizePersonName(enteredName);
  if (n.length < 2) return undefined;

  function matches(rosterName: string) {
    const r = normalizePersonName(rosterName);
    if (r === n) return false;
    const nt = tokenize(enteredName);
    const rt = tokenize(rosterName);

    // Prefix nickname (e.g. "Mike" vs "Mike Armstrong") — boundary after typed segment
    if (r.startsWith(n) && (r.length === n.length || r[n.length] === " ")) return true;

    // One typed token equals roster first name (multi-word roster only)
    if (nt.length === 1 && rt.length >= 2 && nt[0]!.length >= 2 && nt[0] === rt[0]) return true;

    return false;
  }

  const candidates = roster.filter((p) => !excludeCheckedInIds.has(p.id) && matches(p.name));
  if (candidates.length === 0) return undefined;
  if (candidates.length === 1) return candidates[0];

  return [...candidates].sort(
    (a, b) =>
      normalizePersonName(a.name).localeCompare(normalizePersonName(b.name)) ||
      a.name.localeCompare(b.name),
  )[0];
}

function computePools(players: CheckedInPlayer[]) {
  if (players.length === 0) return { aPool: [] as CheckedInPlayer[], bPool: [] as CheckedInPlayer[] };
  const sorted = [...players].sort(
    (a, b) => comparablePdgaRating(b.rating, b.ratingType) - comparablePdgaRating(a.rating, a.ratingType),
  );
  // Odd player count: A Pool gets the extra slot (ceil(n/2) strongest-first slice).
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
        width: isMobile ? "100%" : undefined,
        minWidth: 0,
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

      <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
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
              padding: "12px 14px",
              height: "76px",
              minHeight: "76px",
              maxHeight: "76px",
              boxSizing: "border-box",
              borderTop: i === 0 ? "none" : "1px solid #f1f5f9",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "4px",
              flexShrink: 0,
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
  rosterPlayers: RosterPlayer[];
  isWorking?: boolean;
  onAddExistingPlayer: (player: RosterPlayer, data: CheckInData) => Promise<void> | void;
  onAddNewPlayer: (data: CheckInData) => Promise<void> | void;
  onRemovePlayer: (uid: string) => Promise<void> | void;
  onDeletePlayer: (uid: string) => Promise<void> | void;
  onUpdatePlayer: (uid: string, data: CheckInData) => Promise<void> | void;
}

export function CheckInPanel({
  checkedInPlayers,
  rosterPlayers,
  isWorking,
  onAddExistingPlayer,
  onAddNewPlayer,
  onRemovePlayer,
  onDeletePlayer,
  onUpdatePlayer,
}: Props) {
  const isMobile = useIsMobile();
  const [query, setQuery] = useState("");
  const [modalTarget, setModalTarget] = useState<ModalTarget | null>(null);
  const [duplicateNameBlock, setDuplicateNameBlock] = useState<{ entered: string; rosterName: string } | null>(null);
  const [similarSuggest, setSimilarSuggest] = useState<{ roster: RosterPlayer; draft: CheckInData } | null>(null);

  const checkedInRosterIds = new Set(
    checkedInPlayers.map((p) => p.rosterId).filter((id): id is string => Boolean(id)),
  );
  const searchResults = query.trim()
    ? rosterPlayers.filter(
        (p) =>
          !checkedInRosterIds.has(p.id) && p.name.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : [];

  const { aPool, bPool } = computePools(checkedInPlayers);

  function openModal(target: ModalTarget) {
    setQuery("");
    setModalTarget(target);
  }

  async function handleModalConfirm(data: CheckInData) {
    if (!modalTarget) return;
    if (modalTarget.mode === "existing") {
      await onAddExistingPlayer(modalTarget.player, data);
      setModalTarget(null);
      return;
    }
    if (modalTarget.mode === "edit") {
      await onUpdatePlayer(modalTarget.player.uid, data);
      setModalTarget(null);
      return;
    }

    if (modalTarget.mode === "new") {
      const dup = findDuplicateRosterPlayer(rosterPlayers, data.name);
      if (dup) {
        setModalTarget(null);
        setDuplicateNameBlock({ entered: data.name.trim(), rosterName: dup.name });
        return;
      }
      const similar = findSimilarRosterPlayer(rosterPlayers, data.name, checkedInRosterIds);
      if (similar) {
        setModalTarget(null);
        setSimilarSuggest({ roster: similar, draft: data });
        return;
      }
      await onAddNewPlayer(data);
      setModalTarget(null);
    }
  }

  async function handleSimilarNoCreateAnyway() {
    if (!similarSuggest) return;
    const { draft } = similarSuggest;
    setSimilarSuggest(null);
    await onAddNewPlayer(draft);
  }

  function handleSimilarYesExisting() {
    if (!similarSuggest) return;
    const { roster } = similarSuggest;
    setSimilarSuggest(null);
    openModal({ mode: "existing", player: roster });
  }

  async function handleModalRemove() {
    if (modalTarget?.mode === "edit") await onRemovePlayer(modalTarget.player.uid);
    setModalTarget(null);
  }

  async function handleModalDelete() {
    if (modalTarget?.mode === "edit") await onDeletePlayer(modalTarget.player.uid);
    setModalTarget(null);
  }

  function getInitialData() {
    if (!modalTarget) return undefined;
    if (modalTarget.mode === "existing") {
      return {
        name: modalTarget.player.name,
        rating: modalTarget.player.rating,
        ratingType: modalTarget.player.ratingType,
      };
    }
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
        disabled={isWorking}
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
          cursor: isWorking ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          transition: "background 0.15s, border-color 0.15s",
          WebkitTapHighlightColor: "transparent",
        }}
        onMouseEnter={(e) => {
          if (isWorking) return;
          e.currentTarget.style.background = "#dbeafe";
          e.currentTarget.style.borderColor = "#60a5fa";
        }}
        onMouseLeave={(e) => {
          if (isWorking) return;
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
              paddingRight: query.trim().length > 0 ? "44px" : "16px",
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
          {query.trim().length > 0 ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                border: "none",
                background: "transparent",
                color: "#0077cc",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s",
                WebkitTapHighlightColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#eff6ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <X size={18} strokeWidth={2.25} aria-hidden />
            </button>
          ) : null}
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
              searchResults.map((player) => (
                <div
                  key={player.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: isMobile ? "14px" : "12px 14px",
                    minHeight: "60px",
                    borderRadius: "10px",
                    background: "#f8faff",
                    border: "1.5px solid #e2e8f0",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                    <span style={{ fontSize: "15px", fontWeight: 600, color: "#002b4d" }}>{player.name}</span>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      Rating: <strong style={{ color: "#0077cc" }}>{player.rating}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openModal({ mode: "existing", player })}
                    disabled={isWorking}
                    style={{
                      padding: "10px 20px",
                      minHeight: "48px",
                      borderRadius: "10px",
                      border: "none",
                      background: "#0077cc",
                      color: "#ffffff",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: isWorking ? "not-allowed" : "pointer",
                      flexShrink: 0,
                      boxShadow: "0 2px 6px rgba(0,119,204,0.25)",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    Check In
                  </button>
                </div>
              ))
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
            alignItems: "flex-start",
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
        onDelete={handleModalDelete}
        onClose={() => setModalTarget(null)}
      />

      {duplicateNameBlock ? (
        <div
          onClick={() => setDuplicateNameBlock(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 20, 40, 0.55)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            zIndex: 1200,
            padding: isMobile ? "0" : "24px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: isMobile ? "20px 20px 0 0" : "20px",
              boxShadow: "0 24px 64px rgba(0,43,77,0.22)",
              width: "100%",
              maxWidth: "480px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "22px 28px 18px",
                background: "linear-gradient(135deg, #002b4d 0%, #003d66 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h2 style={{ color: "#ffffff", margin: 0, fontSize: "18px" }}>Name Already Exists</h2>
              <button
                type="button"
                onClick={() => setDuplicateNameBlock(null)}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: isMobile ? "20px" : "24px 28px" }}>
              <p style={{ margin: 0, fontSize: "15px", color: "#334155", lineHeight: 1.6 }}>
                <strong>{duplicateNameBlock.entered}</strong> is the same name as existing roster player{" "}
                <strong>{duplicateNameBlock.rosterName}</strong>. Search the roster to check them in, or use a different
                name.
              </p>
            </div>
            <div
              style={{
                padding: isMobile ? "16px 20px" : "18px 28px",
                borderTop: "1px solid #e2e8f0",
                background: "#f8fafc",
                paddingBottom: isMobile ? "calc(16px + env(safe-area-inset-bottom, 0px))" : "18px",
              }}
            >
              <button
                type="button"
                onClick={() => setDuplicateNameBlock(null)}
                style={{
                  width: "100%",
                  minHeight: "52px",
                  padding: "14px",
                  borderRadius: "12px",
                  border: "none",
                  background: "#0077cc",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 2px 10px rgba(0,119,204,0.28)",
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {similarSuggest ? (
        <div
          onClick={() => setSimilarSuggest(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 20, 40, 0.55)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            zIndex: 1200,
            padding: isMobile ? "0" : "24px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: isMobile ? "20px 20px 0 0" : "20px",
              boxShadow: "0 24px 64px rgba(0,43,77,0.22)",
              width: "100%",
              maxWidth: "480px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "22px 28px 18px",
                background: "linear-gradient(135deg, #002b4d 0%, #003d66 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h2 style={{ color: "#ffffff", margin: 0, fontSize: "18px" }}>Similar name found</h2>
              <button
                type="button"
                onClick={() => setSimilarSuggest(null)}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: isMobile ? "20px" : "24px 28px" }}>
              <p style={{ margin: 0, fontSize: "15px", color: "#334155", lineHeight: 1.6 }}>
                Did you mean to check in <strong>{similarSuggest.roster.name}</strong> instead?
              </p>
            </div>
            <div
              style={{
                padding: isMobile ? "16px 20px" : "18px 28px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: "10px",
                background: "#f8fafc",
                paddingBottom: isMobile ? "calc(16px + env(safe-area-inset-bottom, 0px))" : "18px",
              }}
            >
              <button
                type="button"
                onClick={() => setSimilarSuggest(null)}
                style={{
                  flex: 1,
                  minHeight: "52px",
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1.5px solid #e2e8f0",
                  background: "#ffffff",
                  color: "#475569",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSimilarNoCreateAnyway()}
                disabled={isWorking}
                style={{
                  flex: 1,
                  minHeight: "52px",
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1.5px solid #bfdbfe",
                  background: "#eff6ff",
                  color: "#0077cc",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: isWorking ? "not-allowed" : "pointer",
                }}
              >
                No — create new
              </button>
              <button
                type="button"
                onClick={handleSimilarYesExisting}
                disabled={isWorking}
                style={{
                  flex: 2,
                  minHeight: "52px",
                  padding: "14px",
                  borderRadius: "12px",
                  border: "none",
                  background: isWorking ? "#e2e8f0" : "#0077cc",
                  color: isWorking ? "#94a3b8" : "#ffffff",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: isWorking ? "not-allowed" : "pointer",
                  boxShadow: isWorking ? "none" : "0 2px 10px rgba(0,119,204,0.28)",
                }}
              >
                Yes — check them in
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
