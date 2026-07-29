type SubjectHeroProps = {
  emoji: string;
  title: string;
  englishTitle?: string;
  description: string;
  accentColor?: string;
};

export default function SubjectHero({
  emoji,
  title,
  englishTitle,
  description,
  accentColor = "#38BDF8",
}: SubjectHeroProps) {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "32px",
        borderRadius: "32px",
        color: "#FFFFFF",
        background: `
          linear-gradient(
            135deg,
            #0F172A 0%,
            #172554 55%,
            ${accentColor} 160%
          )
        `,
        boxShadow: "0 22px 50px rgba(15, 23, 42, 0.18)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-60px",
          right: "-40px",
          width: "190px",
          height: "190px",
          borderRadius: "999px",
          background: "rgba(255, 255, 255, 0.1)",
          filter: "blur(2px)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "grid",
            placeItems: "center",
            width: "72px",
            height: "72px",
            borderRadius: "24px",
            background: "rgba(255, 255, 255, 0.14)",
            backdropFilter: "blur(14px)",
            fontSize: "38px",
          }}
        >
          {emoji}
        </div>

        {englishTitle && (
          <p
            style={{
              margin: "22px 0 4px",
              color: "#BAE6FD",
              fontSize: "15px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            {englishTitle}
          </p>
        )}

        <h1
          style={{
            margin: 0,
            fontSize: "clamp(38px, 8vw, 60px)",
            lineHeight: 1.15,
          }}
        >
          {title}
        </h1>

        <p
          style={{
            maxWidth: "620px",
            margin: "14px 0 0",
            color: "#CBD5E1",
            fontSize: "17px",
            lineHeight: 1.8,
          }}
        >
          {description}
        </p>
      </div>
    </section>
  );
}