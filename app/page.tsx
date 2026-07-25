import Link from "next/link";
export default function Home() {
  const subjects = ["英語", "数学", "国語", "理科", "社会"];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        padding: "40px",
      }}
    >
      <h1
        style={{
          fontSize: "60px",
          color: "#3B82F6",
          fontWeight: "900",
          letterSpacing: "3px",
          textShadow: "0 4px 12px rgba(59,130,246,0.3)",
          textAlign: "center",
          marginBottom: "40px",
        }}
      >
        STUDY OS
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "20px",
          maxWidth: "700px",
          margin: "0 auto",
        }}
      >
        {subjects.map((subject) => (
          <Link
            key={subject}
            href={subject === "英語" ? "/english" : "#"}
            style={{
              padding: "24px",
              fontSize: "24px",
              fontWeight: "bold",
              background: "white",
              color: "#1E293B",
              border: "1px solid #CBD5E1",
              borderRadius: "16px",
              cursor: "center",
              textDecoration: "none",
            }}
          >
            {subject}
          </Link>
        ))}
      </div>
    </main>
  );
}