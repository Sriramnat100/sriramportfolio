"use client";

import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";

// One shared WebGL context for every section diorama on the page. Each
// <SectionDiorama> is a drei <View>: a plain div in the document flow that
// this fixed, click-through canvas renders into, scissored to the div's
// on-screen rect every frame. Seven separate <Canvas>es would mean seven GL
// contexts — browsers cap those (and evict old ones), and it's a lot of
// memory for what's just a spinning toy in each box.
//
// Only views currently intersecting the viewport get rendered, and since the
// drawing buffer isn't preserved between frames, nothing smears as you scroll.
export default function DioramaCanvas() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      <View.Port />
    </Canvas>
  );
}
