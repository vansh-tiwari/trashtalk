import React from "react";
import LandingExperience from "@/components/landing/LandingExperience";
import { PREPARED_TOURIST_VS_PETR } from "@/lib/demo/prepared-battles";

export default function Home() {
  return <LandingExperience demo={PREPARED_TOURIST_VS_PETR} />;
}
