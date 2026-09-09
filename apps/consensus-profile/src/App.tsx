import React from "react";
import { ConsensusDashboard } from "@/components/ConsensusDashboard";
import "./styles/consensusTokens.css";

export function App() {
  return (
    <main className="min-h-screen bg-[#07060B] text-[#EAE6DF] relative overflow-x-hidden selection:bg-[#d8b46a]/20 selection:text-[#f3d99d]">
      {/* Ambient Celestial Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#d8b46a]/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-[#4aa3d8]/5 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-[#5fb37a]/5 rounded-full blur-[130px] pointer-events-none -z-10" />

      <ConsensusDashboard />
    </main>
  );
}

export default App;
