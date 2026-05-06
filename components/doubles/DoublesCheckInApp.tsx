"use client";

import { useEffect, useState } from "react";
import type { PostgrestError, Session } from "@supabase/supabase-js";
import { Eye, EyeOff } from "lucide-react";
import { CheckInPanel } from "./CheckInPanel";
import { LiveTotalsPanel } from "./LiveTotalsPanel";
import type { CheckInData } from "./CheckInModal";
import { AcePotDonation, CheckedInPlayer, RosterPlayer } from "./types";
import { useIsMobile } from "./useIsMobile";
import { hasSupabaseConfig, supabase } from "@/lib/supabaseClient";

export default function DoublesCheckInApp() {
  const isMobile = useIsMobile();
  const [session, setSession] = useState<Session | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [appError, setAppError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activeLeagueNightId, setActiveLeagueNightId] = useState<string | null>(null);
  const [rosterPlayers, setRosterPlayers] = useState<RosterPlayer[]>([]);
  const [checkedInPlayers, setCheckedInPlayers] = useState<CheckedInPlayer[]>([]);
  const [acePot, setAcePot] = useState(0);
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

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      setIsCheckingSession(false);
    });

    const params = new URLSearchParams(window.location.search);
    if (params.get("type") === "recovery") setIsRecoveryMode(true);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecoveryMode(true);
        setAuthNotice("Enter a new password to finish resetting your account.");
      }
      setSession(nextSession);
      if (!nextSession) {
        setActiveLeagueNightId(null);
        setRosterPlayers([]);
        setCheckedInPlayers([]);
        setAcePot(0);
        setAcePotDonations([]);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  function mapDbError(error: PostgrestError | null, fallback = "Something went wrong. Please try again.") {
    if (!error) return fallback;
    if (error.code === "42501") return "You must be logged in to access this data";
    if (error.code === "23505") return "This player is already checked in";
    return fallback;
  }

  async function ensureActiveLeagueNight() {
    const { data: activeRows, error: activeError } = await supabase
      .from("league_nights")
      .select("id")
      .eq("status", "active")
      .order("league_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1);

    if (activeError) throw activeError;
    if (activeRows && activeRows.length > 0) return activeRows[0].id as string;

    const today = new Date().toISOString().slice(0, 10);
    const { data: inserted, error: insertError } = await supabase
      .from("league_nights")
      .insert({ league_date: today, status: "active" })
      .select("id")
      .single();

    if (insertError) throw insertError;
    return inserted.id as string;
  }

  async function loadData() {
    if (!session) return;

    setIsLoadingData(true);
    setAppError("");
    try {
      const leagueNightId = await ensureActiveLeagueNight();
      setActiveLeagueNightId(leagueNightId);

      const [playersRes, checkInsRes, potRes, donationsRes] = await Promise.all([
        supabase
          .from("players")
          .select("id, name, rating, rating_type")
          .eq("is_active", true)
          .order("name", { ascending: true }),
        supabase
          .from("check_ins")
          .select(
            "id, player_id, league_fee_paid, league_fee_payment_method, ace_pot_paid, ace_pot_payment_method, checked_in_rating, checked_in_rating_type, players!inner(id, name, rating, rating_type)",
          )
          .eq("league_night_id", leagueNightId)
          .order("created_at", { ascending: true }),
        supabase.from("current_ace_pot_total").select("*").maybeSingle(),
        supabase
          .from("ace_pot_transactions")
          .select("id, note, amount")
          .eq("league_night_id", leagueNightId)
          .eq("transaction_type", "donation")
          .order("created_at", { ascending: false }),
      ]);

      if (playersRes.error) throw playersRes.error;
      if (checkInsRes.error) throw checkInsRes.error;
      if (potRes.error) throw potRes.error;
      if (donationsRes.error) throw donationsRes.error;

      const mappedRoster: RosterPlayer[] = (playersRes.data ?? []).map((p) => ({
        id: p.id as string,
        name: p.name as string,
        rating: Number(p.rating ?? 0),
        ratingType: (p.rating_type as "PDGA" | "UDisc" | "Other") ?? "Other",
      }));

      const mappedCheckIns: CheckedInPlayer[] = (checkInsRes.data ?? []).map((row) => {
        const player = Array.isArray(row.players) ? row.players[0] : row.players;
        return {
          uid: row.id as string,
          rosterId: row.player_id as string,
          name: (player?.name as string) ?? "",
          rating: Number((row.checked_in_rating as number) ?? player?.rating ?? 0),
          ratingType:
            ((row.checked_in_rating_type as "PDGA" | "UDisc" | "Other") ??
              (player?.rating_type as "PDGA" | "UDisc" | "Other") ??
              "Other"),
          leagueFeePaid: Boolean(row.league_fee_paid),
          leagueFeeMethod: (row.league_fee_payment_method as "" | "Cash" | "Venmo" | "PayPal") ?? "",
          acePotPaid: Boolean(row.ace_pot_paid),
          acePotMethod: (row.ace_pot_payment_method as "" | "Cash" | "Venmo" | "PayPal") ?? "",
        };
      });

      const potData = (potRes.data as Record<string, unknown> | null) ?? {};
      const potValueCandidate = Object.values(potData)[0];
      const mappedAcePot = Number(potValueCandidate ?? 0);

      const mappedDonations: AcePotDonation[] = (donationsRes.data ?? []).map((d) => ({
        id: d.id as string,
        note: (d.note as string) || "Donation",
        amount: Number(d.amount ?? 0),
      }));

      setRosterPlayers(mappedRoster);
      setCheckedInPlayers(mappedCheckIns);
      setAcePot(Number.isFinite(mappedAcePot) ? mappedAcePot : 0);
      setAcePotDonations(mappedDonations);
    } catch (error) {
      const dbError = error as PostgrestError;
      console.error("Failed loading doubles data:", dbError);
      setAppError(mapDbError(dbError, "Unable to load data right now."));
    } finally {
      setIsLoadingData(false);
    }
  }

  useEffect(() => {
    if (!session) return;
    void loadData();
  }, [session]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!hasSupabaseConfig) {
      setAuthError(
        "Missing Supabase config. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      );
      return;
    }
    setAuthError("");
    setAuthNotice("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      console.error("Sign-in failed:", error);
      const errorMessage = (error.message || "").toLowerCase();
      if (errorMessage.includes("fetch")) {
        setAuthError("Unable to reach Supabase. Check URL/anon key config and network.");
      } else {
        setAuthError("Invalid email or password");
      }
    }
  }

  async function handleRequestPasswordReset() {
    if (!hasSupabaseConfig) {
      setAuthError(
        "Missing Supabase config. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      );
      return;
    }
    setAuthError("");
    setAuthNotice("");
    if (!email.trim()) {
      setAuthError("Enter your admin email first, then click reset password.");
      return;
    }

    const redirectTo = `${window.location.origin}/doubles`;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    if (error) {
      console.error("Reset password request failed:", error);
      setAuthError("Could not send reset email right now. Please try again.");
      return;
    }
    setAuthNotice("Password reset email sent. Open the link and return to this page.");
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setAuthNotice("");

    if (newPassword.length < 8) {
      setAuthError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      console.error("Update password failed:", error);
      setAuthError("Unable to update password. Please request a new reset link.");
      return;
    }

    await supabase.auth.signOut();
    setIsRecoveryMode(false);
    setSession(null);
    setNewPassword("");
    setConfirmPassword("");
    setPassword("");
    setAuthNotice("Password updated. Please log in with your new password.");
  }

  async function handleAddExistingPlayer(player: RosterPlayer, data: CheckInData) {
    if (!session || !activeLeagueNightId) return;
    setIsWorking(true);
    setAppError("");
    try {
      const { error: checkInError } = await supabase.from("check_ins").insert({
        league_night_id: activeLeagueNightId,
        player_id: player.id,
        league_fee_paid: data.leagueFeePaid,
        league_fee_payment_method: data.leagueFeeMethod || null,
        ace_pot_paid: data.acePotPaid,
        ace_pot_payment_method: data.acePotMethod || null,
        checked_in_rating: data.rating,
        checked_in_rating_type: data.ratingType,
      });
      if (checkInError) throw checkInError;

      if (data.acePotPaid) {
        const { error: aceError } = await supabase.from("ace_pot_transactions").insert({
          league_night_id: activeLeagueNightId,
          player_id: player.id,
          transaction_type: "player_buy_in",
          amount: 2,
          payment_method: data.acePotMethod || null,
          note: "Ace pot player buy-in",
        });
        if (aceError) throw aceError;
      }

      await loadData();
    } catch (error) {
      const dbError = error as PostgrestError;
      console.error("Add existing player failed:", dbError);
      setAppError(mapDbError(dbError, "Unable to check in this player."));
    } finally {
      setIsWorking(false);
    }
  }

  async function handleAddNewPlayer(data: CheckInData) {
    if (!session || !activeLeagueNightId) return;
    setIsWorking(true);
    setAppError("");
    try {
      const { data: insertedPlayer, error: playerError } = await supabase
        .from("players")
        .insert({
          name: data.name,
          rating: data.rating,
          rating_type: data.ratingType,
          is_active: true,
        })
        .select("id")
        .single();
      if (playerError) throw playerError;

      const playerId = insertedPlayer.id as string;
      const { error: checkInError } = await supabase.from("check_ins").insert({
        league_night_id: activeLeagueNightId,
        player_id: playerId,
        league_fee_paid: data.leagueFeePaid,
        league_fee_payment_method: data.leagueFeeMethod || null,
        ace_pot_paid: data.acePotPaid,
        ace_pot_payment_method: data.acePotMethod || null,
        checked_in_rating: data.rating,
        checked_in_rating_type: data.ratingType,
      });
      if (checkInError) throw checkInError;

      if (data.acePotPaid) {
        const { error: aceError } = await supabase.from("ace_pot_transactions").insert({
          league_night_id: activeLeagueNightId,
          player_id: playerId,
          transaction_type: "player_buy_in",
          amount: 2,
          payment_method: data.acePotMethod || null,
          note: "Ace pot player buy-in",
        });
        if (aceError) throw aceError;
      }

      await loadData();
    } catch (error) {
      const dbError = error as PostgrestError;
      console.error("Add new player failed:", dbError);
      setAppError(mapDbError(dbError, "Unable to add and check in this player."));
    } finally {
      setIsWorking(false);
    }
  }

  async function handleUpdatePlayer(uid: string, data: CheckInData) {
    if (!session || !activeLeagueNightId) return;
    setIsWorking(true);
    setAppError("");
    try {
      const existing = checkedInPlayers.find((p) => p.uid === uid);
      if (!existing?.rosterId) throw new Error("Player record not found");

      const { error: playerUpdateError } = await supabase
        .from("players")
        .update({
          name: data.name,
          rating: data.rating,
          rating_type: data.ratingType,
        })
        .eq("id", existing.rosterId);
      if (playerUpdateError) throw playerUpdateError;

      const { error: checkInUpdateError } = await supabase
        .from("check_ins")
        .update({
          league_fee_paid: data.leagueFeePaid,
          league_fee_payment_method: data.leagueFeeMethod || null,
          ace_pot_paid: data.acePotPaid,
          ace_pot_payment_method: data.acePotMethod || null,
          checked_in_rating: data.rating,
          checked_in_rating_type: data.ratingType,
        })
        .eq("id", uid);
      if (checkInUpdateError) throw checkInUpdateError;

      if (!existing.acePotPaid && data.acePotPaid) {
        const { error: addAceError } = await supabase.from("ace_pot_transactions").insert({
          league_night_id: activeLeagueNightId,
          player_id: existing.rosterId,
          transaction_type: "player_buy_in",
          amount: 2,
          payment_method: data.acePotMethod || null,
          note: "Ace pot player buy-in",
        });
        if (addAceError) throw addAceError;
      }

      if (existing.acePotPaid && !data.acePotPaid) {
        const { error: removeAceError } = await supabase.from("ace_pot_transactions").insert({
          league_night_id: activeLeagueNightId,
          player_id: existing.rosterId,
          transaction_type: "adjustment",
          amount: -2,
          payment_method: data.acePotMethod || null,
          note: "Ace pot buy-in removed during edit",
        });
        if (removeAceError) throw removeAceError;
      }

      await loadData();
    } catch (error) {
      const dbError = error as PostgrestError;
      console.error("Update player failed:", dbError);
      setAppError(mapDbError(dbError, "Unable to update this player."));
    } finally {
      setIsWorking(false);
    }
  }

  async function handleRemovePlayer(uid: string) {
    if (!session || !activeLeagueNightId) return;
    setIsWorking(true);
    setAppError("");
    try {
      const existing = checkedInPlayers.find((p) => p.uid === uid);

      const { error: deleteError } = await supabase.from("check_ins").delete().eq("id", uid);
      if (deleteError) throw deleteError;

      if (existing?.acePotPaid && existing.rosterId) {
        const { error: adjustError } = await supabase.from("ace_pot_transactions").insert({
          league_night_id: activeLeagueNightId,
          player_id: existing.rosterId,
          transaction_type: "adjustment",
          amount: -2,
          note: "Ace pot buy-in removed after check-out",
        });
        if (adjustError) throw adjustError;
      }

      await loadData();
    } catch (error) {
      const dbError = error as PostgrestError;
      console.error("Remove player failed:", dbError);
      setAppError(mapDbError(dbError, "Unable to remove this player."));
    } finally {
      setIsWorking(false);
    }
  }

  async function handleDeletePlayer(uid: string) {
    if (!session || !activeLeagueNightId) return;
    setIsWorking(true);
    setAppError("");
    try {
      const existing = checkedInPlayers.find((p) => p.uid === uid);
      if (!existing?.rosterId) throw new Error("Player record not found");

      if (existing.acePotPaid) {
        const { error: adjustError } = await supabase.from("ace_pot_transactions").insert({
          league_night_id: activeLeagueNightId,
          player_id: existing.rosterId,
          transaction_type: "adjustment",
          amount: -2,
          note: "Ace pot buy-in removed after player deletion",
        });
        if (adjustError) throw adjustError;
      }

      const { error: deletePlayerError } = await supabase
        .from("players")
        .delete()
        .eq("id", existing.rosterId);
      if (deletePlayerError) throw deletePlayerError;

      await loadData();
    } catch (error) {
      const dbError = error as PostgrestError;
      console.error("Delete player failed:", dbError);
      setAppError(mapDbError(dbError, "Unable to delete this player from the database."));
    } finally {
      setIsWorking(false);
    }
  }

  async function handleAddDonation(donation: AcePotDonation) {
    if (!session || !activeLeagueNightId) return;
    setIsWorking(true);
    setAppError("");
    try {
      const { error } = await supabase.from("ace_pot_transactions").insert({
        league_night_id: activeLeagueNightId,
        transaction_type: "donation",
        amount: donation.amount,
        payment_method: "Other",
        note: donation.note,
      });
      if (error) throw error;
      await loadData();
    } catch (error) {
      const dbError = error as PostgrestError;
      console.error("Add donation failed:", dbError);
      setAppError(mapDbError(dbError, "Unable to add donation."));
    } finally {
      setIsWorking(false);
    }
  }

  async function handleEndWeek(acePotHit: boolean, aceCount: number) {
    if (!session || !activeLeagueNightId) return;
    setIsWorking(true);
    setAppError("");
    try {
      const nightId = activeLeagueNightId;
      const effectiveAcePot = Math.max(0, acePot);

      if (acePotHit) {
        if (effectiveAcePot > 0) {
          const note =
            aceCount > 0
              ? `End week — ace pot payout (${aceCount} ace${aceCount !== 1 ? "s" : ""})`
              : "End week — ace pot payout";
          const { error: payoutError } = await supabase.from("ace_pot_transactions").insert({
            league_night_id: nightId,
            transaction_type: "payout",
            amount: -Math.abs(effectiveAcePot),
            payment_method: "Other",
            note,
          });
          if (payoutError) throw payoutError;
        }

        const { error: donationDeleteError } = await supabase
          .from("ace_pot_transactions")
          .delete()
          .eq("league_night_id", nightId)
          .eq("transaction_type", "donation");
        if (donationDeleteError) throw donationDeleteError;
      }

      const { error: checkInsDeleteError } = await supabase.from("check_ins").delete().eq("league_night_id", nightId);
      if (checkInsDeleteError) throw checkInsDeleteError;

      await loadData();
    } catch (error) {
      const dbError = error as PostgrestError;
      console.error("End week failed:", dbError);
      setAppError(mapDbError(dbError, "Unable to end the week."));
    } finally {
      setIsWorking(false);
    }
  }

  if (isCheckingSession) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f0f7ff", color: "#002b4d" }}>
        Checking session...
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ minHeight: "100vh", background: "#f0f7ff", display: "grid", placeItems: "center", padding: "24px" }}>
        {isRecoveryMode ? (
          <form
            onSubmit={handleUpdatePassword}
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "#ffffff",
              border: "1.5px solid #dbeafe",
              borderRadius: "16px",
              boxShadow: "0 6px 24px rgba(0,43,77,0.08)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <h2 style={{ margin: 0, color: "#002b4d" }}>Reset Password</h2>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Enter your new admin password.</p>
            <input
              type="password"
              required
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{
                minHeight: "48px",
                borderRadius: "10px",
                border: "1.5px solid #bfdbfe",
                padding: "12px 14px",
                fontSize: "16px",
                color: "#002b4d",
              }}
            />
            <input
              type="password"
              required
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                minHeight: "48px",
                borderRadius: "10px",
                border: "1.5px solid #bfdbfe",
                padding: "12px 14px",
                fontSize: "16px",
                color: "#002b4d",
              }}
            />
            {authError ? <p style={{ margin: 0, color: "#dc2626", fontSize: "14px" }}>{authError}</p> : null}
            {authNotice ? <p style={{ margin: 0, color: "#0f766e", fontSize: "14px" }}>{authNotice}</p> : null}
            <button
              type="submit"
              style={{
                minHeight: "48px",
                borderRadius: "10px",
                border: "none",
                background: "#0077cc",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              Update Password
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleSignIn}
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "#ffffff",
              border: "1.5px solid #dbeafe",
              borderRadius: "16px",
              boxShadow: "0 6px 24px rgba(0,43,77,0.08)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <h2 style={{ margin: 0, color: "#002b4d" }}>Admin Login</h2>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
              Sign in to access Random Doubles: Player Check-In.
            </p>
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                minHeight: "48px",
                borderRadius: "10px",
                border: "1.5px solid #bfdbfe",
                padding: "12px 14px",
                fontSize: "16px",
                color: "#002b4d",
              }}
            />
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  minHeight: "48px",
                  width: "100%",
                  borderRadius: "10px",
                  border: "1.5px solid #bfdbfe",
                  padding: "12px 44px 12px 14px",
                  fontSize: "16px",
                  color: "#002b4d",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  color: "#64748b",
                  cursor: "pointer",
                  padding: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {authError ? <p style={{ margin: 0, color: "#dc2626", fontSize: "14px" }}>{authError}</p> : null}
            {authNotice ? <p style={{ margin: 0, color: "#0f766e", fontSize: "14px" }}>{authNotice}</p> : null}
            <button
              type="submit"
              style={{
                minHeight: "48px",
                borderRadius: "10px",
                border: "none",
                background: "#0077cc",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              Login
            </button>
            <button
              type="button"
              onClick={handleRequestPasswordReset}
              style={{
                minHeight: "40px",
                borderRadius: "10px",
                border: "1.5px solid #bfdbfe",
                background: "#eff6ff",
                color: "#005fa3",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Forgot password?
            </button>
          </form>
        )}
      </div>
    );
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
              rosterPlayers={rosterPlayers}
              isWorking={isWorking || isLoadingData}
              onAddExistingPlayer={handleAddExistingPlayer}
              onAddNewPlayer={handleAddNewPlayer}
              onRemovePlayer={handleRemovePlayer}
              onDeletePlayer={handleDeletePlayer}
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
              isWorking={isWorking || isLoadingData}
              onAddDonation={handleAddDonation}
              onEndWeek={handleEndWeek}
            />
          </div>
        </div>
      </main>
      {appError ? (
        <div style={{ width: "100%", maxWidth: "1400px", margin: "0 auto", padding: "8px 20px 16px", color: "#b91c1c" }}>
          {appError}
        </div>
      ) : null}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}
