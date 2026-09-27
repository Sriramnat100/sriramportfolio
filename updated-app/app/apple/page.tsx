import { Inter } from "next/font/google";
import AppleHome from "@/components/apple/AppleHome";

// Apple's own SF Pro is licensed for Apple platforms only, so Inter stands in —
// same geometric-neutral grotesque feel, and it takes tight tracking well.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--ap-font",
});

export const metadata = {
  title: "Sriram Natarajan",
  description:
    "CS + Linguistics at Illinois. Machine learning, embedded systems, and things that ship.",
};

export default function AppleStylePage() {
  return (
    <div className={inter.variable}>
      <AppleHome />
    </div>
  );
}
