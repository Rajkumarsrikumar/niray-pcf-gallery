export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="lg-e1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#B45BC5" /><stop offset="1" stopColor="#742774" /></linearGradient>
        <linearGradient id="lg-e2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4AA8FF" /><stop offset="1" stopColor="#0B57D0" /></linearGradient>
        <linearGradient id="lg-e3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4CB648" /><stop offset="1" stopColor="#007B7F" /></linearGradient>
        <linearGradient id="lg-e4" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFD84D" /><stop offset="1" stopColor="#F2A60C" /></linearGradient>
      </defs>
      <rect x="4" y="4" width="44" height="44" rx="12" fill="url(#lg-e1)" />
      <rect x="52" y="4" width="44" height="44" rx="12" fill="url(#lg-e2)" />
      <rect x="4" y="52" width="44" height="44" rx="12" fill="url(#lg-e4)" />
      <rect x="52" y="52" width="44" height="44" rx="12" fill="url(#lg-e3)" />
      <rect x="22" y="22" width="56" height="56" rx="16" fill="#fff" />
      <image href="/brand/nmark.png" x="28" y="34" width="44" height="30" />
    </svg>
  );
}

export default function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="leading-none">
        <span className={`block text-[10px] font-bold tracking-[0.2em] ${dark ? "text-[#d9a6ff]" : "text-[#742774]"}`}>NIRAY</span>
        <span className={`font-display block text-xl font-bold tracking-tight ${dark ? "text-white" : "text-brand-navy"}`}>PCF Gallery</span>
      </span>
    </span>
  );
}
