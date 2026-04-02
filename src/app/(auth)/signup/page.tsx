import type { Metadata } from "next";
import { SignupFlow } from "./signup-flow";

export const metadata: Metadata = {
  title: "Sign up — Enquireo",
  description:
    "Create your Enquireo account in one step — verify your email and start capturing enquiries.",
};

export default function SignupPage() {
  return <SignupFlow />;
}
