import { NextResponse } from "next/server";

type PaymentMethod = "Cash" | "Venmo" | "PayPal";

type LeagueReportPayload = {
  date: string;
  players: Array<{
    name: string;
    leagueFeePaid: boolean;
    leagueFeeMethod: PaymentMethod | "Unspecified";
  }>;
  leagueFees: {
    total: number;
    byMethod: Record<PaymentMethod, number>;
  };
  payouts: {
    total: number;
    byMethod: Record<PaymentMethod, number>;
    rows: Array<{
      place: string;
      amount: number;
      method: PaymentMethod;
    }>;
  };
  remaining: {
    total: number;
    byMethod: Record<PaymentMethod, number>;
  };
  acePot: {
    wasHit: boolean;
    aceCount: number;
    currentTotal: number;
  };
};

function formatCurrency(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LeagueReportPayload;

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.LEAGUE_REPORT_FROM_EMAIL;
    const toEmail = process.env.LEAGUE_REPORT_TO_EMAIL || "mike@armstrongdevsolutions.com";

    if (!resendApiKey || !fromEmail) {
      return NextResponse.json(
        { error: "Missing RESEND_API_KEY or LEAGUE_REPORT_FROM_EMAIL environment variable." },
        { status: 500 },
      );
    }

    const reportDate = new Date(payload.date);
    const humanDate = reportDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const subject = `League Report ${humanDate}`;

    const playersByMethod: Record<PaymentMethod, string[]> = {
      Cash: [],
      Venmo: [],
      PayPal: [],
    };
    for (const player of payload.players) {
      if (!player.leagueFeePaid) continue;
      if (player.leagueFeeMethod === "Cash" || player.leagueFeeMethod === "Venmo" || player.leagueFeeMethod === "PayPal") {
        playersByMethod[player.leagueFeeMethod].push(player.name);
      }
    }
    for (const method of ["Cash", "Venmo", "PayPal"] as const) {
      playersByMethod[method].sort((a, b) => a.localeCompare(b));
    }

    const playersSection = [
      "-- Cash --",
      ...(playersByMethod.Cash.length > 0 ? playersByMethod.Cash : ["(none)"]),
      "",
      "-- Venmo --",
      ...(playersByMethod.Venmo.length > 0 ? playersByMethod.Venmo : ["(none)"]),
      "",
      "-- PayPal --",
      ...(playersByMethod.PayPal.length > 0 ? playersByMethod.PayPal : ["(none)"]),
    ].join("\n");

    const payoutRowsSection =
      payload.payouts.rows.length > 0
        ? payload.payouts.rows
            .map((row) => `- ${row.place}: ${formatCurrency(row.amount)} via ${row.method}`)
            .join("\n")
        : "- No payouts recorded.";

    const body = [
      `League Report for ${humanDate}`,
      "",
      "Players and league fee payment method:",
      playersSection,
      "",
      `Total league fees collected: ${formatCurrency(payload.leagueFees.total)}`,
      `- Cash: ${formatCurrency(payload.leagueFees.byMethod.Cash)}`,
      `- Venmo: ${formatCurrency(payload.leagueFees.byMethod.Venmo)}`,
      `- PayPal: ${formatCurrency(payload.leagueFees.byMethod.PayPal)}`,
      "",
      `Total winnings paid out: ${formatCurrency(payload.payouts.total)}`,
      payoutRowsSection,
      "",
      `Remaining after payouts: ${formatCurrency(payload.remaining.total)}`,
      `- Expected Cash balance: ${formatCurrency(payload.remaining.byMethod.Cash)}`,
      `- Expected Venmo balance: ${formatCurrency(payload.remaining.byMethod.Venmo)}`,
      `- Expected PayPal balance: ${formatCurrency(payload.remaining.byMethod.PayPal)}`,
      "",
      payload.acePot.wasHit
        ? `Ace Pot paid out tonight (${payload.acePot.aceCount} ace${payload.acePot.aceCount !== 1 ? "s" : ""}) from ${formatCurrency(payload.acePot.currentTotal)}.`
        : `Ace Pot carried over at ${formatCurrency(payload.acePot.currentTotal)}.`,
    ].join("\n");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject,
        text: body,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText || "Failed sending report email." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("League report email failed:", error);
    return NextResponse.json({ error: "Unexpected error while generating report email." }, { status: 500 });
  }
}
