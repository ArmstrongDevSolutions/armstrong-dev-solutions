"use client";

import { useEffect, useState } from "react";
import { Check, CreditCard, Disc, Hash, X } from "lucide-react";
import { COURSE_RATING_TABLES, type CourseRatingTableId } from "./courseEstimatedRatingData";
import {
  estimateRatingFromCourseAndRelativeDelta,
  parseRelativeScoreToDelta,
} from "./estimateFromCourseRelativeScore";
import { useIsMobile } from "./useIsMobile";

const COURSE_SELECT_ORDER: CourseRatingTableId[] = ["brownDeer", "estabrook", "dretzka"];

type PaymentMethod = "" | "Cash" | "Venmo" | "PayPal";
type RatingType = "" | "PDGA" | "UDisc" | "Other";

export interface CheckInData {
  firstName: string;
  lastName: string;
  rating: number;
  ratingType: "PDGA" | "UDisc" | "Other";
  leagueFeePaid: boolean;
  leagueFeeMethod: "Cash" | "Venmo" | "PayPal" | "";
  acePotPaid: boolean;
  acePotMethod: "Cash" | "Venmo" | "PayPal" | "";
}

export interface ModalInitialData {
  firstName?: string;
  lastName?: string;
  rating?: number;
  ratingType?: RatingType;
  leagueFeePaid?: boolean;
  leagueFeeMethod?: PaymentMethod;
  acePotPaid?: boolean;
  acePotMethod?: PaymentMethod;
}

interface Props {
  isOpen: boolean;
  mode: "new" | "existing" | "edit";
  initialData?: ModalInitialData;
  onConfirm: (data: CheckInData) => void;
  onRemove?: () => void;
  onDelete?: () => void;
  onClose: () => void;
}

const PAYMENT_METHODS: ("Cash" | "Venmo" | "PayPal")[] = ["Cash", "Venmo", "PayPal"];

function SegmentedControl({
  options,
  value,
  onChange,
  disabled,
}: {
  options: ("Cash" | "Venmo" | "PayPal")[];
  value: string;
  onChange: (v: "Cash" | "Venmo" | "PayPal") => void;
  disabled?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        borderRadius: "10px",
        border: `1.5px solid ${disabled ? "#e2e8f0" : "#bfdbfe"}`,
        overflow: "hidden",
        opacity: disabled ? 0.42 : 1,
        pointerEvents: disabled ? "none" : "auto",
        background: "#f8fafc",
      }}
    >
      {options.map((opt, i) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              flex: 1,
              padding: "13px 0",
              minHeight: "48px",
              border: "none",
              borderLeft: i > 0 ? `1.5px solid ${disabled ? "#e2e8f0" : "#bfdbfe"}` : "none",
              background: active ? "#0077cc" : "transparent",
              color: active ? "#ffffff" : "#475569",
              fontSize: "14px",
              fontWeight: active ? 600 : 400,
              cursor: "pointer",
              transition: "background 0.12s, color 0.12s",
              textAlign: "center",
            }}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.background = "#eff6ff";
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.background = "transparent";
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function CustomCheckbox({
  checked,
  onChange,
  accentColor = "#0077cc",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  accentColor?: string;
}) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: "20px",
        height: "20px",
        borderRadius: "6px",
        border: `2px solid ${checked ? accentColor : "#cbd5e1"}`,
        background: checked ? accentColor : "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0,
        transition: "border-color 0.15s, background 0.15s",
        boxShadow: checked ? `0 0 0 3px ${accentColor}22` : "none",
      }}
      onMouseEnter={(e) => {
        if (!checked) (e.currentTarget as HTMLDivElement).style.borderColor = accentColor;
      }}
      onMouseLeave={(e) => {
        if (!checked) (e.currentTarget as HTMLDivElement).style.borderColor = "#cbd5e1";
      }}
    >
      {checked && <Check size={13} color="#ffffff" strokeWidth={3} />}
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "2px 0" }}>
      <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
      <span
        style={{
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "#94a3b8",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
    </div>
  );
}

const inputBase: React.CSSProperties = {
  padding: "14px",
  minHeight: "52px",
  borderRadius: "10px",
  border: "1.5px solid #bfdbfe",
  fontSize: "16px", // 16px prevents iOS auto-zoom on focus
  color: "#002b4d",
  outline: "none",
  background: "#f8faff",
  width: "100%",
  boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
};

const focusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "#0077cc";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,119,204,0.12)";
    e.currentTarget.style.background = "#ffffff";
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "#bfdbfe";
    e.currentTarget.style.boxShadow = "none";
    e.currentTarget.style.background = "#f8faff";
  },
};

export function CheckInModal({ isOpen, mode, initialData, onConfirm, onRemove, onDelete, onClose }: Props) {
  const isMobile = useIsMobile();
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [rating, setRating] = useState("");
  const [ratingType, setRatingType] = useState<RatingType>("");
  const [leagueFeePaid, setLeagueFeePaid] = useState(false);
  const [leagueFeeMethod, setLeagueFeeMethod] = useState<PaymentMethod>("");
  const [acePotPaid, setAcePotPaid] = useState(false);
  const [acePotMethod, setAcePotMethod] = useState<PaymentMethod>("");
  const [otherCourseId, setOtherCourseId] = useState<CourseRatingTableId | "">("");
  const [relativeScoreInput, setRelativeScoreInput] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFirstName(initialData?.firstName ?? "");
      setLastName(initialData?.lastName ?? "");
      setRating(initialData?.rating ? String(initialData.rating) : "");
      setRatingType(initialData?.ratingType ?? "");
      setLeagueFeePaid(initialData?.leagueFeePaid ?? false);
      setLeagueFeeMethod(initialData?.leagueFeeMethod ?? "");
      setAcePotPaid(initialData?.acePotPaid ?? false);
      setAcePotMethod(initialData?.acePotMethod ?? "");
      setOtherCourseId("");
      setRelativeScoreInput("");
      setShowRemoveConfirm(false);
      setShowDeleteConfirm(false);
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (ratingType !== "Other") {
      setOtherCourseId("");
      setRelativeScoreInput("");
    }
  }, [ratingType]);

  useEffect(() => {
    if (ratingType !== "Other" || otherCourseId === "") return;
    const delta = parseRelativeScoreToDelta(relativeScoreInput);
    if (delta === null) return;
    const est = estimateRatingFromCourseAndRelativeDelta(otherCourseId, delta);
    if (est === null) return;
    setRating(String(est));
  }, [ratingType, otherCourseId, relativeScoreInput]);

  if (!isOpen) return null;

  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    rating.trim().length > 0 &&
    !isNaN(parseInt(rating, 10)) &&
    ratingType !== "" &&
    leagueFeePaid &&
    leagueFeeMethod !== "";

  function handleConfirm() {
    if (!canSubmit) return;
    onConfirm({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      rating: parseInt(rating, 10),
      ratingType: ratingType as "PDGA" | "UDisc" | "Other",
      leagueFeePaid,
      leagueFeeMethod,
      acePotPaid,
      acePotMethod,
    });
  }

  const headerTitle = mode === "new" ? "Add New Player" : mode === "edit" ? "Edit Player" : "Player Check In";
  const headerSubtext =
    mode === "new"
      ? "Add Information & Collect Payment"
      : mode === "edit"
        ? "Update player info or remove from check-in"
        : "Confirm & Collect Payment";

  const actionLinkStyle: React.CSSProperties = {
    border: "none",
    background: "transparent",
    padding: 0,
    textAlign: "left",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    color: "#0077cc",
    textDecoration: "underline",
    textUnderlineOffset: "2px",
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
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: isMobile ? "0" : "24px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#ffffff",
          borderRadius: isMobile ? "20px 20px 0 0" : "20px",
          boxShadow: "0 24px 64px rgba(0,43,77,0.22), 0 4px 16px rgba(0,43,77,0.1)",
          width: "100%",
          maxWidth: isMobile ? "100%" : "480px",
          maxHeight: isMobile ? "92vh" : "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "22px 28px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, #002b4d 0%, #003d66 100%)",
          }}
        >
          <div>
            <h2 style={{ color: "#ffffff", margin: 0, fontSize: "18px" }}>{headerTitle}</h2>
            <p
              style={{
                color: "#00b4d8",
                margin: "4px 0 0",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {headerSubtext}
            </p>
          </div>
          <button
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
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div
          style={{
            padding: isMobile ? "20px" : "24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            overflowY: "auto",
          }}
        >
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#002b4d" }}>First Name</label>
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoFocus
                style={inputBase}
                {...focusHandlers}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#002b4d" }}>Last Name</label>
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={inputBase}
                {...focusHandlers}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#002b4d",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <Hash size={12} style={{ color: "#0077cc" }} /> Rating
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g. 912"
                value={rating}
                onChange={(e) => setRating(e.target.value.replace(/[^0-9]/g, ""))}
                style={inputBase}
                {...focusHandlers}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#002b4d" }}>Rating Type</label>
              <select
                value={ratingType}
                onChange={(e) => setRatingType(e.target.value as RatingType)}
                style={{ ...inputBase, cursor: "pointer", appearance: "auto" }}
                {...focusHandlers}
              >
                <option value="" disabled>
                  Select type…
                </option>
                <option value="PDGA">PDGA</option>
                <option value="UDisc">UDisc</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {ratingType === "Other" && (
            <>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#002b4d" }}>Score</label>
                  <input
                    type="text"
                    placeholder="E, -3, +8"
                    value={relativeScoreInput}
                    onChange={(e) => setRelativeScoreInput(e.target.value)}
                    style={inputBase}
                    {...focusHandlers}
                    autoCapitalize="off"
                    autoCorrect="off"
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#002b4d" }}>Course</label>
                  <select
                    value={otherCourseId}
                    onChange={(e) => setOtherCourseId((e.target.value || "") as CourseRatingTableId | "")}
                    style={{ ...inputBase, cursor: "pointer", appearance: "auto" }}
                    {...focusHandlers}
                  >
                    <option value="" disabled>
                      Select course…
                    </option>
                    {COURSE_SELECT_ORDER.map((id) => {
                      const t = COURSE_RATING_TABLES[id];
                      if (!t) return null;
                      return (
                        <option key={id} value={id}>
                          {t.displayName}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <SectionDivider label="League Fee" />
            <div
              style={{
                padding: "16px 18px",
                borderRadius: "14px",
                background: leagueFeePaid ? "#eff6ff" : "#f8fafc",
                border: `1.5px solid ${leagueFeePaid ? "#bfdbfe" : "#e2e8f0"}`,
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                transition: "background 0.15s, border-color 0.15s",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
                onClick={() => setLeagueFeePaid(!leagueFeePaid)}
              >
                <CustomCheckbox checked={leagueFeePaid} onChange={setLeagueFeePaid} accentColor="#0077cc" />
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <CreditCard
                    size={15}
                    style={{ color: leagueFeePaid ? "#0077cc" : "#94a3b8", transition: "color 0.15s" }}
                  />
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: leagueFeePaid ? "#002b4d" : "#64748b",
                      transition: "color 0.15s",
                    }}
                  >
                    Paid League Fee
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: leagueFeePaid ? "#0077cc" : "#94a3b8",
                      background: leagueFeePaid ? "#dbeafe" : "#f1f5f9",
                      padding: "2px 9px",
                      borderRadius: "999px",
                      transition: "all 0.15s",
                    }}
                  >
                    $8
                  </span>
                </div>
              </div>
              <div style={{ paddingLeft: "30px", display: "flex", flexDirection: "column", gap: "7px" }}>
                <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0, fontWeight: 500 }}>Payment method</p>
                <SegmentedControl
                  options={PAYMENT_METHODS}
                  value={leagueFeeMethod}
                  onChange={(v) => setLeagueFeeMethod(v)}
                  disabled={!leagueFeePaid}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <SectionDivider label="Ace Pot" />
            <div
              style={{
                padding: "16px 18px",
                borderRadius: "14px",
                background: acePotPaid ? "#ecfeff" : "#f8fafc",
                border: `1.5px solid ${acePotPaid ? "#a5f3fc" : "#e2e8f0"}`,
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                transition: "background 0.15s, border-color 0.15s",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
                onClick={() => setAcePotPaid(!acePotPaid)}
              >
                <CustomCheckbox checked={acePotPaid} onChange={setAcePotPaid} accentColor="#00b4d8" />
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <Disc
                    size={15}
                    style={{ color: acePotPaid ? "#00b4d8" : "#94a3b8", transition: "color 0.15s" }}
                  />
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: acePotPaid ? "#002b4d" : "#64748b",
                      transition: "color 0.15s",
                    }}
                  >
                    Entered Ace Pot
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: acePotPaid ? "#0891b2" : "#94a3b8",
                      background: acePotPaid ? "#cffafe" : "#f1f5f9",
                      padding: "2px 9px",
                      borderRadius: "999px",
                      transition: "all 0.15s",
                    }}
                  >
                    $2
                  </span>
                </div>
              </div>
              <div style={{ paddingLeft: "30px", display: "flex", flexDirection: "column", gap: "7px" }}>
                <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0, fontWeight: 500 }}>Payment method</p>
                <SegmentedControl
                  options={PAYMENT_METHODS}
                  value={acePotMethod}
                  onChange={(v) => setAcePotMethod(v)}
                  disabled={!acePotPaid}
                />
              </div>
            </div>
          </div>

          {mode === "edit" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button type="button" onClick={() => setShowRemoveConfirm(true)} style={actionLinkStyle}>
                Remove from this week&apos;s check-in
              </button>
              <button type="button" onClick={() => setShowDeleteConfirm(true)} style={actionLinkStyle}>
                Delete player from database
              </button>
            </div>
          ) : null}
        </div>

        <div
          style={{
            padding: isMobile ? "16px 20px" : "18px 28px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            gap: "10px",
            background: "#f8fafc",
            paddingBottom: isMobile ? "calc(16px + env(safe-area-inset-bottom, 0px))" : "18px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "12px",
              border: "1.5px solid #e2e8f0",
              background: "#ffffff",
              color: "#475569",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f1f5f9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ffffff";
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={!canSubmit}
            style={{
              flex: 2,
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              background: canSubmit ? "#0077cc" : "#e2e8f0",
              color: canSubmit ? "#ffffff" : "#94a3b8",
              fontSize: "15px",
              fontWeight: 600,
              cursor: canSubmit ? "pointer" : "not-allowed",
              boxShadow: canSubmit ? "0 2px 10px rgba(0,119,204,0.28)" : "none",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              if (canSubmit) e.currentTarget.style.background = "#005fa3";
            }}
            onMouseLeave={(e) => {
              if (canSubmit) e.currentTarget.style.background = "#0077cc";
            }}
          >
            {mode === "edit" ? "Update" : "Check In"}
          </button>
        </div>
      </div>

      {showRemoveConfirm ? (
        <div
          onClick={() => setShowRemoveConfirm(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 20, 40, 0.55)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: isMobile ? "0" : "24px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: isMobile ? "20px 20px 0 0" : "20px",
              boxShadow: "0 24px 64px rgba(0,43,77,0.22), 0 4px 16px rgba(0,43,77,0.1)",
              width: "100%",
              maxWidth: isMobile ? "100%" : "480px",
              maxHeight: isMobile ? "92vh" : "90vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "22px 28px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, #002b4d 0%, #003d66 100%)",
              }}
            >
              <h2 style={{ color: "#ffffff", margin: 0, fontSize: "18px" }}>Remove Check-In</h2>
              <button
                onClick={() => setShowRemoveConfirm(false)}
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
                Are you sure you want to remove this player from this week&apos;s check-in?
              </p>
            </div>
            <div
              style={{
                padding: isMobile ? "16px 20px" : "18px 28px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                gap: "10px",
                background: "#f8fafc",
                paddingBottom: isMobile ? "calc(16px + env(safe-area-inset-bottom, 0px))" : "18px",
              }}
            >
              <button
                onClick={() => setShowRemoveConfirm(false)}
                style={{
                  flex: 1,
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
                onClick={() => {
                  onRemove?.();
                  setShowRemoveConfirm(false);
                }}
                style={{
                  flex: 2,
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
                Remove Check-In
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showDeleteConfirm ? (
        <div
          onClick={() => setShowDeleteConfirm(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 20, 40, 0.55)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: isMobile ? "0" : "24px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: isMobile ? "20px 20px 0 0" : "20px",
              boxShadow: "0 24px 64px rgba(0,43,77,0.22), 0 4px 16px rgba(0,43,77,0.1)",
              width: "100%",
              maxWidth: isMobile ? "100%" : "480px",
              maxHeight: isMobile ? "92vh" : "90vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "22px 28px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, #002b4d 0%, #003d66 100%)",
              }}
            >
              <div>
                <h2 style={{ color: "#ffffff", margin: 0, fontSize: "18px" }}>Delete Player</h2>
                <p
                  style={{
                    color: "#00b4d8",
                    margin: "4px 0 0",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Permanent roster deletion
                </p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(false)}
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
                Are you sure you want to permanently delete this player from the database?
              </p>
            </div>
            <div
              style={{
                padding: isMobile ? "16px 20px" : "18px 28px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                gap: "10px",
                background: "#f8fafc",
                paddingBottom: isMobile ? "calc(16px + env(safe-area-inset-bottom, 0px))" : "18px",
              }}
            >
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1,
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
                onClick={() => {
                  onDelete?.();
                  setShowDeleteConfirm(false);
                }}
                style={{
                  flex: 2,
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
                Delete Player
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
