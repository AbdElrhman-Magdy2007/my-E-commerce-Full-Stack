// src/components/ThreeScene.tsx
import { useEffect } from "react";



export default function ThreeScene() {
  // إضافة السكربت ديناميكيًا
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@splinetool/viewer@1.9.82/build/spline-viewer.js";
    script.type = "module";
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* مشهد Spline كخلفية */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          zIndex: 1,
        }}
      >
        <spline-viewer
          id="spline-viewer"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          url="https://prod.spline.design/o0JJWvjkRR9NilrV/scene.splinecode"
        />
      </div>

      {/* شريط أسود */}
      <div
        style={{
          position: "absolute",
          bottom: "0%",
          left: 0,
          // top: 0,
          width: "100%",
          height: window.innerWidth < 768 ? "17%" : "22%",
          backgroundColor: "black",
          display: "flex",
          zIndex: 3,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
      </div>
    </div>
  );
}

