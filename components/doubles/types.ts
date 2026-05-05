export interface CheckedInPlayer {
  uid: string;
  rosterId?: number;
  name: string;
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
