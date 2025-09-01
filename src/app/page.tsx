import CRTScreen from "@/components/crt-screen";
import PplxInput from "@/components/pplx-input";
import React from "react";

export default function Page() {
  return (
    <CRTScreen 
      autoTurnOn={true}
      turnOnDelay={1000}
      liveVideoId="ENSD0fGGm60"
      >
        <PplxInput/>
      </CRTScreen>
  )
}



