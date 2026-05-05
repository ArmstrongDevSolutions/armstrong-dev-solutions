import type { Metadata } from "next";
import DoublesCheckInApp from "@/components/doubles/DoublesCheckInApp";

export const metadata: Metadata = {
  title: "Random Doubles: Player Check-In",
  description: "Disc golf random doubles player check-in and live totals page.",
};

export default function DoublesPage() {
  return <DoublesCheckInApp />;
}
