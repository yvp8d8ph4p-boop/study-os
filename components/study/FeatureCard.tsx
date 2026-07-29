import Link from "next/link";

type FeatureCardProps = {
  title: string;
  description: string;
  emoji: string;
  href?: string;
  accentColor?: string;
  iconBackground?: string;
  badge?: string;
  available?: boolean;
};

export default function FeatureCard({
  title,
  description,
  emoji,
  href = "#",
  accentColor = "#2563EB",
  iconBackground = "#DBEAFE",
  badge,
  available = true,
}: FeatureCardProps) {
  const card = (
    <article
      style={{
        height: "100%",
        minHeight: "190px",
        padding: "22px",
        borderRadius: "26px",
        background: available ? "#FFFFFF" : "#F8FAFC",
        border: available ? "1px solid #E2E8F0" : "1px dashed #CBD5E1",
        boxShadow: available
          ? "0 12px 32px rgba(15, 23, 42, 0.08)"
          : "none",
        boxSizing: "border-box",
        opacity: available ? 1 : 0.72,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div
          style={{
            display: "grid",
            placeItems: "center",
            width: "62px",
            height: "62px",
            flexShrink: 0,
            borderRadius: "20px",
            background: iconBackground,
            fontSize: "32px",
          }}
        >
          {emoji}
        </div>

        {badge && (
          <span
            style={{
              padding: "6px 10px",
              borderRadius: "999px",
              background: "#F1F5F9",
              color: "#475569",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            {badge}
          </span>
        )}
      </div>

      <h3
        style={{
          margin: "18px 0 0",
          color: accentColor,
          fontSize: "24px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: "9px 0 0",
          color: "#64748B",
          fontSize: "15px",
          lineHeight: 1.7,
        }}
      >
        {description}
      </p>

      <p
        style={{
          margin: "18px 0 0",
          color: available ? accentColor : "#64748B",
          fontSize: "15px",
          fontWeight: 700,
        }}
      >
        {available ? "開く →" : "準備中"}
      </p>
    </article>
  );

  if (!available) {
    return card;
  }

  return (
    <Link
      href={href}
      style={{
        color: "inherit",
        textDecoration: "none",
      }}
    >
      {card}
    </Link>
  );
}