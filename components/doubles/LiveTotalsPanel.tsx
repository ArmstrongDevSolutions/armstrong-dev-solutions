"use client";

import { useState } from "react";
import { Check, Disc, DollarSign, Flag, Plus, TrendingUp, X } from "lucide-react";
import { AcePotDonation, CheckedInPlayer, formatFullName } from "./types";
import { useIsMobile } from "./useIsMobile";
import { EndWeekModal, PayoutSelection } from "./EndWeekModal";

function AddToPotModal({
  isOpen,
  onConfirm,
  onClose,
}: {
  isOpen: boolean;
  onConfirm: (amount: number, note: string) => void;
  onClose: () => void;
}) {
  const isMobile = useIsMobile();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  const canSubmit = amount.trim().length > 0 && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    onConfirm(parseFloat(amount), note.trim());
    setAmount("");
    setNote("");
  }

  const inputStyle: React.CSSProperties = {
    padding: "14px",
    minHeight: "52px",
    borderRadius: "10px",
    border: "1.5px solid #bfdbfe",
    fontSize: "16px",
    color: "#002b4d",
    outline: "none",
    background: "#f8faff",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 20, 40, 0.55)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: isMobile ? "12px" : "24px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 24px 64px rgba(0,43,77,0.22)",
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px 16px",
            background: "linear-gradient(135deg, #002b4d 0%, #003d66 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2 style={{ color: "#ffffff", margin: 0, fontSize: "17px" }}>Add to Ace Pot</h2>
            <p
              style={{
                color: "#00b4d8",
                margin: "3px 0 0",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Sponsor or manual contribution
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "#ffffff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{ fontSize: "13px", fontWeight: 600, color: "#002b4d", display: "flex", alignItems: "center", gap: "5px" }}
            >
              <DollarSign size={12} style={{ color: "#0077cc" }} /> Amount <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="e.g. 50"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              autoFocus
              style={inputStyle}
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
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#002b4d" }}>
              Note <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Hole Sponsor Donation"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={inputStyle}
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
        </div>

        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            gap: "10px",
            background: "#f8fafc",
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "14px",
              minHeight: "52px",
              borderRadius: "12px",
              border: "1.5px solid #e2e8f0",
              background: "#ffffff",
              color: "#475569",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              flex: 2,
              padding: "14px",
              minHeight: "52px",
              borderRadius: "12px",
              border: "none",
              background: canSubmit ? "#0077cc" : "#e2e8f0",
              color: canSubmit ? "#ffffff" : "#94a3b8",
              fontSize: "15px",
              fontWeight: 600,
              cursor: canSubmit ? "pointer" : "not-allowed",
              boxShadow: canSubmit ? "0 2px 10px rgba(0,119,204,0.28)" : "none",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            Add to Ace Pot
          </button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  checkedInPlayers: CheckedInPlayer[];
  acePot: number;
  acePotDonations: AcePotDonation[];
  isWorking?: boolean;
  onAddDonation: (donation: AcePotDonation) => Promise<void> | void;
  onEndWeek: (acePotHit: boolean, aceCount: number, payouts: PayoutSelection[]) => Promise<void> | void;
}

export function LiveTotalsPanel({
  checkedInPlayers,
  acePot,
  acePotDonations,
  isWorking,
  onAddDonation,
  onEndWeek,
}: Props) {
  const isMobile = useIsMobile();
  const [addPotOpen, setAddPotOpen] = useState(false);
  const [endWeekOpen, setEndWeekOpen] = useState(false);

  const leagueFee = 8;
  const totalFees = checkedInPlayers.reduce((sum, p) => sum + (p.leagueFeePaid ? leagueFee : 0), 0);
  const totalPayout = Math.round(totalFees * 0.5);
  const acePotPlayers = checkedInPlayers.filter((p) => p.acePotPaid);

  async function handleAddDonation(amount: number, note: string) {
    await onAddDonation({ id: `donation-${Date.now()}`, note: note || "Manual Addition", amount });
    setAddPotOpen(false);
  }

  const pad = isMobile ? "20px" : "28px 32px";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: pad,
        gap: "18px",
        background: "#f8faff",
        minHeight: "100%",
      }}
    >
      <div>
        <h2 style={{ color: "#002b4d", margin: 0 }}>Live Totals</h2>
        <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: "14px" }}>
          Updates automatically as players check in
        </p>
      </div>

      <div
        style={{
          background: "#ffffff",
          borderRadius: "18px",
          padding: isMobile ? "20px" : "24px 28px",
          boxShadow: "0 4px 16px rgba(0,43,77,0.09)",
          border: "1.5px solid #dbeafe",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #0077cc, #00b4d8)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <TrendingUp size={16} style={{ color: "#0077cc" }} />
          </div>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "#64748b",
              textTransform: "uppercase",
            }}
          >
            Total Payout
          </span>
        </div>
        <div style={{ fontSize: isMobile ? "44px" : "52px", fontWeight: 700, color: "#002b4d", lineHeight: 1.05, marginTop: "10px" }}>
          ${totalPayout}
        </div>
        <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "4px" }}>50% of league fees collected</p>
      </div>

      <div
        style={{
          background: "#ffffff",
          borderRadius: "18px",
          padding: isMobile ? "20px" : "24px 28px",
          boxShadow: "0 4px 16px rgba(0,43,77,0.09)",
          border: "1.5px solid #dbeafe",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #00b4d8, #0077cc)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "#ecfeff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Disc size={16} style={{ color: "#00b4d8" }} />
          </div>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "#64748b",
              textTransform: "uppercase",
            }}
          >
            Ace Pot
          </span>
        </div>
        <div style={{ fontSize: isMobile ? "44px" : "52px", fontWeight: 700, color: "#002b4d", lineHeight: 1.05, marginTop: "10px" }}>
          ${acePot}
        </div>
        <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "4px" }}>Rolls over if no ace is hit</p>
      </div>

      <button
        type="button"
        onClick={() => setAddPotOpen(true)}
        disabled={isWorking}
        style={{
          width: "100%",
          minHeight: "52px",
          padding: "14px 12px",
          borderRadius: "10px",
          border: "1.5px solid #bfdbfe",
          background: "#eff6ff",
          color: "#0077cc",
          fontSize: "14px",
          fontWeight: 600,
          cursor: isWorking ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          transition: "background 0.15s",
          WebkitTapHighlightColor: "transparent",
        }}
        onMouseEnter={(e) => {
          if (isWorking) return;
          e.currentTarget.style.background = "#dbeafe";
        }}
        onMouseLeave={(e) => {
          if (isWorking) return;
          e.currentTarget.style.background = "#eff6ff";
        }}
      >
        <Plus size={15} /> Add to Ace Pot
      </button>

      {(acePotPlayers.length > 0 || acePotDonations.length > 0) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ flex: 1, height: "1px", background: "#dbeafe" }} />
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "#94a3b8",
                textTransform: "uppercase",
              }}
            >
              Contributions
            </span>
            <div style={{ flex: 1, height: "1px", background: "#dbeafe" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {acePotPlayers.map((p) => (
              <div
                key={p.uid}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  minHeight: "48px",
                  borderRadius: "10px",
                  background: "#ffffff",
                  border: "1.5px solid #e0f2fe",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#00b4d8", flexShrink: 0 }} />
                  <span style={{ fontSize: "14px", color: "#002b4d", fontWeight: 500 }}>{formatFullName(p.firstName, p.lastName)}</span>
                </div>
                <span style={{ fontSize: "13px", color: "#64748b" }}>1 entry</span>
              </div>
            ))}

            {acePotDonations.map((d) => (
              <div
                key={d.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  minHeight: "48px",
                  borderRadius: "10px",
                  background: "#f0fdf4",
                  border: "1.5px solid #bbf7d0",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                  <Check size={13} style={{ color: "#16a34a", flexShrink: 0 }} />
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#002b4d",
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {d.note}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      background: "#dcfce7",
                      color: "#16a34a",
                      padding: "2px 7px",
                      borderRadius: "999px",
                      flexShrink: 0,
                    }}
                  >
                    Donation
                  </span>
                </div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#16a34a", flexShrink: 0 }}>${d.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          height: "1px",
          width: "100%",
          background: "linear-gradient(90deg, transparent, rgba(0, 119, 204, 0.28), transparent)",
          opacity: 0.65,
          marginTop: "6px",
        }}
      />

      <button
        type="button"
        onClick={() => setEndWeekOpen(true)}
        disabled={isWorking}
        style={{
          width: "100%",
          minHeight: "52px",
          padding: "14px 18px",
          borderRadius: "12px",
          border: "none",
          background: "#002b4d",
          color: "#ffffff",
          fontSize: "15px",
          fontWeight: 700,
          cursor: isWorking ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          boxShadow: "0 4px 14px rgba(0,43,77,0.22)",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <Flag size={18} strokeWidth={2.25} aria-hidden />
        End Week
      </button>

      <EndWeekModal
        isOpen={endWeekOpen}
        onClose={() => setEndWeekOpen(false)}
        playerCount={checkedInPlayers.length}
        totalPayoutPool={totalPayout}
        acePotTotal={acePot}
        onConfirm={onEndWeek}
      />

      <AddToPotModal isOpen={addPotOpen} onConfirm={handleAddDonation} onClose={() => setAddPotOpen(false)} />
    </div>
  );
}
