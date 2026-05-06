export interface CheckedInPlayer {
  uid: string;
  rosterId?: string;
  firstName: string;
  lastName: string;
  rating: number;
  ratingType: "PDGA" | "UDisc" | "Other";
  leagueFeePaid: boolean;
  leagueFeeMethod: "" | "Cash" | "Venmo" | "PayPal";
  acePotPaid: boolean;
  acePotMethod: "" | "Cash" | "Venmo" | "PayPal";
}

export interface AcePotDonation {
  id: string;
  note: string;
  amount: number;
}

export interface RosterPlayer {
  id: string;
  firstName: string;
  lastName: string;
  rating: number;
  ratingType: "PDGA" | "UDisc" | "Other";
}

export function formatFullName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim();
}
