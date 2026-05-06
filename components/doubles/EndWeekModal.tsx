"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Flag, Target, Trophy, Users, X } from "lucide-react";
import { useIsMobile } from "./useIsMobile";

export type PayoutRow = {
  place: string;
  amount: number;
  percentLabel?: string;
};

export type PaymentMethod = "Cash" | "Venmo" | "PayPal";

export type PayoutSelection = {
  place: string;
  amount: number;
  method: PaymentMethod;
};

/**
 * Teams for End Week / payouts: teams of 2 whenever possible.
 * Even players → teams = players / 2. Odd players → teams = players / 2 rounded up (e.g. 19 players → 10 teams).
 */
export function computeTeamCount(playerCount: number) {
  return Math.max(0, Math.ceil(playerCount / 2));
}

export function computePayoutRows(teamCount: number, poolTotal: number): PayoutRow[] {
  const pool = Math.max(0, poolTotal);
  if (teamCount <= 10) {
    return [{ place: "1st Place", amount: Math.round(pool) }];
  }
  if (teamCount <= 20) {
    return [
      { place: "1st Place", amount: Math.round(pool * 0.65), percentLabel: "65% of pool" },
      { place: "2nd Place", amount: Math.round(pool * 0.35), percentLabel: "35% of pool" },
    ];
  }
  return [
    { place: "1st Place", amount: Math.round(pool * 0.5), percentLabel: "50% of pool" },
    { place: "2nd Place", amount: Math.round(pool * 0.3), percentLabel: "30% of pool" },
    { place: "3rd Place", amount: Math.round(pool * 0.2), percentLabel: "20% of pool" },
  ];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  playerCount: number;
  totalPayoutPool: number;
  acePotTotal: number;
  onConfirm: (acePotHit: boolean, aceCount: number, payouts: PayoutSelection[]) => void | Promise<void>;
}

type Step = 1 | 2 | 3;
type AceSubStep = "question" | "details";
const PAYMENT_METHODS: PaymentMethod[] = ["Cash", "Venmo", "PayPal"];

function ProgressHeader({ step }: { step: Step }) {
  const labels = ["1. PAYOUT", "2. ACE POT", "3. CONFIRM"] as const;
  return (
    <div style={{ marginTop: "14px" }}>
      <div style={{ display: "flex", gap: "8px" }}>
        {([1, 2, 3] as const).map((s) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: "4px",
              borderRadius: "999px",
              background: s <= step ? "#0077cc" : "rgba(255,255,255,0.22)",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", marginTop: "10px", gap: "6px", justifyContent: "space-between" }}>
        {labels.map((label, i) => {
          const n = (i + 1) as Step;
          const active = n === step;
          return (
            <span
              key={label}
              style={{
                flex: 1,
                textAlign: i === 1 ? "center" : i === 2 ? "right" : "left",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: active ? "#38bdf8" : "rgba(255,255,255,0.45)",
              }}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function EndWeekModal({ isOpen, onClose, playerCount, totalPayoutPool, acePotTotal, onConfirm }: Props) {
  const isMobile = useIsMobile();
  const [step, setStep] = useState<Step>(1);
  const [aceSubStep, setAceSubStep] = useState<AceSubStep>("question");
  const [aceChoice, setAceChoice] = useState<null | "yes" | "no">(null);
  const [aceCount, setAceCount] = useState(1);
  const [payoutMethods, setPayoutMethods] = useState<Record<string, PaymentMethod | "">>({});

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setAceSubStep("question");
      setAceChoice(null);
      setAceCount(1);
      setPayoutMethods({});
    }
  }, [isOpen]);

  const teamCount = useMemo(() => computeTeamCount(playerCount), [playerCount]);
  const payoutRows = useMemo(() => computePayoutRows(teamCount, totalPayoutPool), [teamCount, totalPayoutPool]);

  const perAceAmount =
    aceCount > 0 ? Math.round((Math.max(0, acePotTotal) / aceCount) * 100) / 100 : 0;

  const step2NextEnabled =
    aceChoice === "no" || (aceChoice === "yes" && aceSubStep === "details" && aceCount >= 1);
  const step1NextEnabled = payoutRows.every((row) => PAYMENT_METHODS.includes(payoutMethods[row.place] as PaymentMethod));

  if (!isOpen) return null;

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 20, 40, 0.55)",
    backdropFilter: "blur(3px)",
    display: "flex",
    alignItems: isMobile ? "flex-end" : "center",
    justifyContent: "center",
    zIndex: 1050,
    padding: isMobile ? "0" : "24px",
  };

  const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: isMobile ? "24px 24px 0 0" : "20px",
    boxShadow: "0 24px 64px rgba(0,43,77,0.22), 0 4px 16px rgba(0,43,77,0.1)",
    width: "100%",
    maxWidth: isMobile ? "100%" : "480px",
    maxHeight: isMobile ? "92vh" : "90vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  const footerPadBottom = isMobile ? "calc(16px + env(safe-area-inset-bottom, 0px))" : "18px";

  const footerRowStyle: React.CSSProperties = {
    padding: isMobile ? "16px 20px" : "18px 28px",
    paddingBottom: footerPadBottom,
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    gap: "10px",
    alignItems: "stretch",
    background: "#f8fafc",
    flexShrink: 0,
  };

  const btnGhost: React.CSSProperties = {
    minHeight: "52px",
    padding: "14px",
    borderRadius: "12px",
    border: "1.5px solid #e2e8f0",
    background: "#ffffff",
    color: "#475569",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  };

  const btnPrimary: React.CSSProperties = {
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
    WebkitTapHighlightColor: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  };

  const btnPrimaryDisabled: React.CSSProperties = {
    ...btnPrimary,
    background: "#e2e8f0",
    color: "#94a3b8",
    cursor: "not-allowed",
    boxShadow: "none",
  };

  const btnNavy: React.CSSProperties = {
    minHeight: "52px",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "#002b4d",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 2px 10px rgba(0,43,77,0.28)",
    WebkitTapHighlightColor: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    flex: 2,
  };

  const btnBack: React.CSSProperties = {
    minHeight: "52px",
    minWidth: "52px",
    padding: "14px",
    borderRadius: "12px",
    border: "1.5px solid #e2e8f0",
    background: "#ffffff",
    color: "#475569",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    WebkitTapHighlightColor: "transparent",
  };

  function handleBack() {
    if (step === 2 && aceChoice === "yes" && aceSubStep === "details") {
      setAceSubStep("question");
      setAceChoice(null);
      return;
    }
    if (step > 1) setStep((s) => (s - 1) as Step);
  }

  async function handleConfirmEndWeek() {
    const payouts: PayoutSelection[] = payoutRows.map((row) => ({
      place: row.place,
      amount: row.amount,
      method: (payoutMethods[row.place] as PaymentMethod) || "Cash",
    }));
    await onConfirm(aceChoice === "yes", aceChoice === "yes" ? aceCount : 0, payouts);
    onClose();
  }

  const tileBase: React.CSSProperties = {
    flex: 1,
    background: "#ffffff",
    borderRadius: "14px",
    border: "1.5px solid #bfdbfe",
    padding: "18px 14px",
    textAlign: "center",
  };

  const choiceBtn = (selected: boolean): React.CSSProperties => ({
    width: "100%",
    minHeight: "52px",
    padding: "14px 16px",
    borderRadius: "12px",
    border: selected ? "2px solid #0077cc" : "1.5px solid #e2e8f0",
    background: "#ffffff",
    color: "#002b4d",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    textAlign: "center",
    transition: "border-color 0.15s",
    WebkitTapHighlightColor: "transparent",
  });

  return (
    <div onClick={onClose} style={overlayStyle}>
      <div onClick={(e) => e.stopPropagation()} style={cardStyle}>
        <div
          style={{
            padding: "22px 28px 18px",
            flexShrink: 0,
            background: "linear-gradient(135deg, #002b4d 0%, #003d66 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Flag size={22} color="#ffffff" strokeWidth={2} />
              <h2 style={{ color: "#ffffff", margin: 0, fontSize: "18px" }}>End Week</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
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
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
          <ProgressHeader step={step} />
        </div>

        <div
          style={{
            padding: isMobile ? "20px" : "24px 28px",
            overflowY: "auto",
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {step === 1 ? (
            <>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={tileBase}>
                  <div style={{ fontSize: "28px", fontWeight: 700, color: "#0077cc" }}>{teamCount}</div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: "#94a3b8",
                      marginTop: "6px",
                    }}
                  >
                    TEAMS
                  </div>
                </div>
                <div style={tileBase}>
                  <div style={{ fontSize: "28px", fontWeight: 700, color: "#0077cc" }}>${totalPayoutPool}</div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: "#94a3b8",
                      marginTop: "6px",
                    }}
                  >
                    PAYOUT POOL
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {payoutRows.map((row) => (
                  <div
                    key={row.place}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      padding: "16px 18px",
                      borderRadius: "14px",
                      border: "1.5px solid #dbeafe",
                      background: "#ffffff",
                      gap: "14px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "8px",
                            background: "#0077cc",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Trophy size={18} color="#ffffff" strokeWidth={2.5} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontSize: "15px", fontWeight: 700, color: "#002b4d" }}>{row.place}</span>
                          {row.percentLabel ? (
                            <span style={{ fontSize: "12px", color: "#64748b" }}>{row.percentLabel}</span>
                          ) : null}
                        </div>
                      </div>
                      <span style={{ fontSize: "20px", fontWeight: 700, color: "#0077cc", flexShrink: 0 }}>
                        ${row.amount}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#94a3b8",
                          margin: 0,
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                        }}
                      >
                        PAYOUT METHOD
                      </span>
                      <div
                        style={{
                          display: "flex",
                          width: "100%",
                          borderRadius: "10px",
                          border: "1.5px solid #bfdbfe",
                          overflow: "hidden",
                          background: "#f8fafc",
                        }}
                      >
                        {PAYMENT_METHODS.map((method, i) => {
                          const active = payoutMethods[row.place] === method;
                          return (
                            <button
                              key={`${row.place}-${method}`}
                              type="button"
                              onClick={() =>
                                setPayoutMethods((prev) => ({
                                  ...prev,
                                  [row.place]: method,
                                }))
                              }
                              style={{
                                flex: 1,
                                padding: "12px 0",
                                minHeight: "44px",
                                border: "none",
                                borderLeft: i > 0 ? "1.5px solid #bfdbfe" : "none",
                                background: active ? "#0077cc" : "transparent",
                                color: active ? "#ffffff" : "#475569",
                                fontSize: "14px",
                                fontWeight: active ? 600 : 400,
                                cursor: "pointer",
                                textAlign: "center",
                              }}
                            >
                              {method}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "18px" }}>
              <div
                style={{
                  width: "100%",
                  padding: "22px 18px",
                  borderRadius: "16px",
                  border: "1.5px solid #93c5fd",
                  background: "#eff6ff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                  <Target size={22} style={{ color: "#0077cc" }} strokeWidth={2} aria-hidden />
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    color: "#0077cc",
                    marginTop: "8px",
                    marginBottom: "8px",
                  }}
                >
                  CURRENT ACE POT
                </div>
                <div style={{ fontSize: "36px", fontWeight: 700, color: "#002b4d" }}>${acePotTotal}</div>
              </div>

              {aceSubStep === "question" ? (
                <>
                  <p
                    style={{
                      margin: 0,
                      width: "100%",
                      textAlign: "center",
                      fontSize: "15px",
                      color: "#64748b",
                      fontWeight: 500,
                    }}
                  >
                    Was an ace hit tonight?
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAceChoice("yes");
                      setAceSubStep("details");
                      setAceCount(1);
                    }}
                    style={choiceBtn(false)}
                  >
                    <span style={{ fontSize: "20px" }} aria-hidden>
                      🎯
                    </span>
                    Yes — An Ace Was Hit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAceChoice("no");
                      setAceSubStep("question");
                    }}
                    style={choiceBtn(aceChoice === "no")}
                  >
                    <span style={{ fontSize: "20px" }} aria-hidden>
                      🔄
                    </span>
                    No — Pot Carries Over
                  </button>
                  {aceChoice === "no" ? (
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        padding: "14px 16px",
                        borderRadius: "12px",
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        boxSizing: "border-box",
                      }}
                    >
                      <span style={{ color: "#0077cc", fontWeight: 700 }}>✓</span>
                      <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: 1.5, textAlign: "center" }}>
                        Ace Pot of <strong>${acePotTotal}</strong> will carry over to next week.
                      </p>
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  <p
                    style={{
                      margin: 0,
                      width: "100%",
                      textAlign: "center",
                      fontSize: "15px",
                      color: "#64748b",
                      fontWeight: 600,
                    }}
                  >
                    How many aces were hit?
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "center" }}>
                    <button
                      type="button"
                      aria-label="Decrease ace count"
                      onClick={() => setAceCount((c) => Math.max(1, c - 1))}
                      style={{
                        minHeight: "52px",
                        minWidth: "52px",
                        borderRadius: "12px",
                        border: "1.5px solid #bfdbfe",
                        background: "#ffffff",
                        fontSize: "22px",
                        fontWeight: 700,
                        color: "#0077cc",
                        cursor: "pointer",
                      }}
                    >
                      −
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={String(aceCount)}
                      onChange={(e) => {
                        const v = parseInt(e.target.value.replace(/\D/g, ""), 10);
                        if (!Number.isFinite(v)) setAceCount(1);
                        else setAceCount(Math.min(999, Math.max(1, v)));
                      }}
                      style={{
                        minHeight: "52px",
                        width: "80px",
                        textAlign: "center",
                        borderRadius: "12px",
                        border: "1.5px solid #bfdbfe",
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "#002b4d",
                      }}
                    />
                    <button
                      type="button"
                      aria-label="Increase ace count"
                      onClick={() => setAceCount((c) => Math.min(999, c + 1))}
                      style={{
                        minHeight: "52px",
                        minWidth: "52px",
                        borderRadius: "12px",
                        border: "1.5px solid #bfdbfe",
                        background: "#ffffff",
                        fontSize: "22px",
                        fontWeight: 700,
                        color: "#0077cc",
                        cursor: "pointer",
                      }}
                    >
                      +
                    </button>
                  </div>

                  <div
                    style={{
                      padding: "16px 18px",
                      borderRadius: "14px",
                      border: "1.5px solid #93c5fd",
                      background: "#f8fafc",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#64748b" }}>
                      <span>Ace Pot total</span>
                      <span style={{ fontWeight: 700, color: "#002b4d" }}>${acePotTotal}</span>
                    </div>
                    <div style={{ height: "1px", background: "#e2e8f0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569", fontSize: "14px" }}>
                        <Target size={16} style={{ color: "#0077cc" }} />
                        Split {aceCount} way{aceCount !== 1 ? "s" : ""}
                      </div>
                      <span style={{ fontSize: "17px", fontWeight: 700, color: "#0077cc" }}>
                        ${perAceAmount} per ace
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAceSubStep("question");
                      setAceChoice(null);
                    }}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "8px 0",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#0077cc",
                      cursor: "pointer",
                      textAlign: "center",
                      width: "100%",
                      minHeight: "44px",
                    }}
                  >
                    ← Back to ace question
                  </button>
                </>
              )}
            </div>
          ) : null}

          {step === 3 ? (
            <>
              <p style={{ margin: 0, fontSize: "14px", color: "#64748b", lineHeight: 1.55 }}>
                Review the summary below, then confirm to end the week and reset the pools.
              </p>

              <div
                style={{
                  borderRadius: "14px",
                  border: "1.5px solid #bfdbfe",
                  overflow: "hidden",
                  background: "#ffffff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 16px",
                    background: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#002b4d" }}>
                    PAYOUTS — {teamCount} TEAM{teamCount !== 1 ? "S" : ""}
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#0077cc" }}>${totalPayoutPool} pool</span>
                </div>
                {payoutRows.map((row, idx) => (
                  <div
                    key={row.place}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "14px 16px",
                      borderTop: idx === 0 ? undefined : "1px solid #f1f5f9",
                      gap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: "#0077cc",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Trophy size={15} color="#ffffff" />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "14px", fontWeight: 600, color: "#002b4d" }}>{row.place}</span>
                        {row.percentLabel ? (
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>{row.percentLabel}</span>
                        ) : null}
                      </div>
                    </div>
                    <span style={{ fontSize: "15px", fontWeight: 700, color: "#0077cc" }}>${row.amount}</span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  padding: "16px 18px",
                  borderRadius: "14px",
                  border: "1.5px solid #93c5fd",
                  background: "#eff6ff",
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "#0077cc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Target size={20} color="#ffffff" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {aceChoice === "yes" ? (
                    <>
                      <span style={{ fontSize: "15px", fontWeight: 700, color: "#002b4d" }}>
                        Ace paid out — ${perAceAmount} per ace ({aceCount} ace{aceCount !== 1 ? "s" : ""}). Pot resets to
                        $0.
                      </span>
                      <span style={{ fontSize: "13px", color: "#64748b" }}>Ace pot balance cleared after this week.</span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: "15px", fontWeight: 700, color: "#002b4d" }}>
                        🔄 Ace Pot carries over at ${acePotTotal}
                      </span>
                      <span style={{ fontSize: "13px", color: "#64748b" }}>No ace was hit tonight.</span>
                    </>
                  )}
                </div>
              </div>

              <div
                style={{
                  padding: "16px 18px",
                  borderRadius: "14px",
                  border: "1.5px solid #e2e8f0",
                  background: "#ffffff",
                  display: "flex",
                  gap: "14px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "#475569",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Users size={20} color="#ffffff" strokeWidth={2} />
                </div>
                <span style={{ fontSize: "15px", fontWeight: 600, color: "#002b4d" }}>
                  {playerCount} player{playerCount !== 1 ? "s" : ""} ({teamCount} team{teamCount !== 1 ? "s" : ""}) cleared
                  from A & B pools
                </span>
              </div>
            </>
          ) : null}
        </div>

        <div style={footerRowStyle}>
          {step === 1 ? (
            <>
              <button type="button" style={{ ...btnGhost, flex: 1 }} onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                style={step1NextEnabled ? { ...btnPrimary, flex: 2 } : { ...btnPrimaryDisabled, flex: 2 }}
                disabled={!step1NextEnabled}
                onClick={() => step1NextEnabled && setStep(2)}
              >
                Next →
              </button>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <button type="button" style={btnBack} onClick={handleBack} aria-label="Back">
                <ChevronLeft size={22} />
              </button>
              <button type="button" style={{ ...btnGhost, flex: 1 }} onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                style={step2NextEnabled ? { ...btnPrimary, flex: 2 } : { ...btnPrimaryDisabled, flex: 2 }}
                disabled={!step2NextEnabled}
                onClick={() => step2NextEnabled && setStep(3)}
              >
                Next →
              </button>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <button type="button" style={btnBack} onClick={() => setStep(2)} aria-label="Back">
                <ChevronLeft size={22} />
              </button>
              <button type="button" style={{ ...btnGhost, flex: 1 }} onClick={onClose}>
                Cancel
              </button>
              <button type="button" style={btnNavy} onClick={() => void handleConfirmEndWeek()}>
                <Flag size={18} strokeWidth={2.25} />
                Confirm — End Week
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
