import { useEffect, useState } from "react";

export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState(() => {
    if (typeof window !== "undefined") {
      return { width: window.innerWidth, height: window.innerHeight };
    }
    return { width: 500, height: 500 };
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize((prev) => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // On mobile devices, ignore significant height shrinks (like a keyboard opening)
        // IF the width didn't change (which would indicate an orientation change).
        const isMobile = window.innerWidth < 1200;
        let finalHeight = height;

        if (
          isMobile &&
          prev.width === width &&
          prev.height > height &&
          prev.height - height > 100
        ) {
          finalHeight = prev.height;
        }

        // Ignore micro-adjustments caused by scrollbars appearing/disappearing
        // due to UI elements (like tags) slightly overflowing.
        if (
          Math.abs(prev.width - width) < 15 &&
          Math.abs(prev.height - finalHeight) < 15
        ) {
          return prev;
        }

        return { width, height: finalHeight };
      });
    };

    // Run once to sync just in case
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return screenSize;
};
