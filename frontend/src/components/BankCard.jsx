// Renders a card in real ID-1 proportions (85.60mm x 53.98mm, ratio ~1.586:1)
const THEMES = {
  Credit: { from: "#1a2540", via: "#25325c", to: "#3d2e0f", chip: "#f9c723" },
  Debit: { from: "#1a3f7a", via: "#2d6aaa", to: "#1a3f7a", chip: "#e2eaf4" },
};

function maskedNumber(cardNumber) {
  const digits = (cardNumber || "").replace(/\s/g, "");
  const last4 = digits.slice(-4) || "0000";
  return `•••• •••• •••• ${last4}`;
}

function formatExpiry(expiryDate) {
  if (!expiryDate) return "••/••";
  const d = new Date(expiryDate);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${yy}`;
}

function BankCard({ card, className = "" }) {
  const { cardType, cardNumber, cardHolderName, expiryDate, status } = card;
  const theme = THEMES[cardType] || THEMES.Debit;
  const isBlocked = status === "Blocked";
  const isInactive = status === "Inactive";
  const gradientId = `card-grad-${cardType}-${card._id || "x"}`;

  return (
    <svg
      viewBox="0 0 340 214"
      className={className}
      role="img"
      aria-label={`${cardType} card ending ${(cardNumber || "").slice(-4)}`}
      style={{ filter: isInactive ? "grayscale(55%) opacity(0.65)" : "none" }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={theme.from} />
          <stop offset="55%" stopColor={theme.via} />
          <stop offset="100%" stopColor={theme.to} />
        </linearGradient>
        <clipPath id={`clip-${gradientId}`}>
          <rect width="340" height="214" rx="18" />
        </clipPath>
      </defs>

      <g clipPath={`url(#clip-${gradientId})`}>
        <rect width="340" height="214" fill={`url(#${gradientId})`} />
        {/* faint decorative arcs */}
        <circle cx="300" cy="20" r="90" fill="rgba(255,255,255,0.04)" />
        <circle cx="330" cy="200" r="60" fill="rgba(255,255,255,0.05)" />

        {/* bank wordmark */}
        <text x="24" y="34" fill="#ffffff" fontSize="15" fontWeight="700" letterSpacing="1" fontFamily="'Space Grotesk', sans-serif">
          ABK
        </text>
        <text x="24" y="48" fill="rgba(255,255,255,0.65)" fontSize="8" letterSpacing="2" fontFamily="'JetBrains Mono', monospace">
          {cardType === "Credit" ? "CREDIT" : "DEBIT"}
        </text>

        {/* status pill */}
        {status !== "Active" && (
          <g transform="translate(232,16)">
            <rect
              width={isBlocked ? 92 : 78}
              height="20"
              rx="10"
              fill={isBlocked ? "rgba(239,68,68,0.9)" : "rgba(148,163,184,0.85)"}
            />
            <text x={(isBlocked ? 92 : 78) / 2} y="14" fill="#fff" fontSize="9.5" fontWeight="700" textAnchor="middle" letterSpacing="1" fontFamily="'JetBrains Mono', monospace">
              {status.toUpperCase()}
            </text>
          </g>
        )}

        {/* EMV chip */}
        <g transform="translate(24,64)">
          <rect width="42" height="32" rx="6" fill={theme.chip} />
          <rect x="6" y="6" width="30" height="20" rx="3" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
          <line x1="21" y1="6" x2="21" y2="26" stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
          <line x1="6" y1="16" x2="36" y2="16" stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
        </g>

        {/* contactless icon */}
        <g transform="translate(84,68) rotate(90)" stroke="rgba(255,255,255,0.75)" strokeWidth="2.2" fill="none" strokeLinecap="round">
          <path d="M0 4 A 6 6 0 0 1 0 -4" />
          <path d="M0 10 A 12 12 0 0 1 0 -10" />
          <path d="M0 16 A 18 18 0 0 1 0 -16" />
        </g>

        {/* card number */}
        <text x="24" y="134" fill="#ffffff" fontSize="19" letterSpacing="2.5" fontFamily="'JetBrains Mono', monospace">
          {maskedNumber(cardNumber)}
        </text>

        {/* cardholder + expiry */}
        <text x="24" y="176" fill="rgba(255,255,255,0.55)" fontSize="7.5" letterSpacing="1.5" fontFamily="'JetBrains Mono', monospace">
          CARD HOLDER
        </text>
        <text x="24" y="192" fill="#ffffff" fontSize="13" letterSpacing="1" fontFamily="'Space Grotesk', sans-serif">
          {(cardHolderName || "").toUpperCase()}
        </text>

        <text x="216" y="176" fill="rgba(255,255,255,0.55)" fontSize="7.5" letterSpacing="1.5" fontFamily="'JetBrains Mono', monospace">
          EXPIRES
        </text>
        <text x="216" y="192" fill="#ffffff" fontSize="13" letterSpacing="1" fontFamily="'Space Grotesk', sans-serif">
          {formatExpiry(expiryDate)}
        </text>

        {/* generic network mark, bottom-right corner, clear of the expiry text */}
        <g transform="translate(311,197)">
          <circle cx="-7" cy="0" r="11" fill="#f9c723" opacity="0.9" />
          <circle cx="7" cy="0" r="11" fill="#ffffff" opacity="0.55" />
        </g>
      </g>
    </svg>
  );
}

export default BankCard;
