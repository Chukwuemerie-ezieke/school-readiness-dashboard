// Harmony Digital Consults — Logo Component
// Uses the official shield logo (HD lettermark with circuit accents + book swoosh)

import logoShield from "/harmony-shield.png";
import logoFull from "/harmony-logo-full.png";

interface LogoProps {
  className?: string;
  variant?: "shield" | "full";
}

export function HarmonyLogo({ className = "", variant = "shield" }: LogoProps) {
  const src = variant === "full" ? logoFull : logoShield;
  return (
    <img
      src={src}
      alt="Harmony Digital Consults"
      className={className}
      loading="eager"
      decoding="async"
    />
  );
}

export default HarmonyLogo;
