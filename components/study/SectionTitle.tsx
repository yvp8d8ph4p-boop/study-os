type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export default function SectionTitle({
  eyebrow,
  title,
  description,
}: SectionTitleProps) {
  return (
    <header
      style={{
        marginBottom: "18px",
      }}
    >
      {eyebrow && (
        <p
          style={{
            margin: "0 0 5px",
            color: "#0284C7",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.08em",
          }}
        >
          {eyebrow}
        </p>
      )}

      <h2
        style={{
          margin: 0,
          color: "#0F172A",
          fontSize: "28px",
        }}
      >
        {title}
      </h2>

      {description && (
        <p
          style={{
            margin: "7px 0 0",
            color: "#64748B",
            fontSize: "15px",
            lineHeight: 1.7,
          }}
        >
          {description}
        </p>
      )}
    </header>
  );
}