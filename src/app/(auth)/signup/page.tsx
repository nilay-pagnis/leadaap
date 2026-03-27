import type { Metadata } from "next";
import { SignupFlow } from "./signup-flow";

export const metadata: Metadata = {
  title: "Sign up — LeadAap",
  description:
    "Create your LeadAap account in one step — verify your email and start capturing leads.",
};

export default function SignupPage() {
  return <SignupFlow />;
}
