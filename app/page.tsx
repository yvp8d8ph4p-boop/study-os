"use client";

import Link from "next/link";
import { CSSProperties, useEffect, useState } from "react";

type Subject = {
  title: string;
  englishTitle: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  lightColor: string;
  borderColor: string;
  comingSoon?: boolean;
};

const subjects: Subject[] = [
  {
    title: "英語",
    englishTitle: "English",
    description: "単語・熟語・文法を整理して、英語力を伸ばす。",
    icon: "📘",
    href: "/english",
    color: "#2563eb",
    lightColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  {
    title: "国語",
    englishTitle: "Japanese",
    description: "現代文・古文・漢文・語彙・文学を学ぶ。",
    icon: "📖",
    href: "/japanese",
    color: "#8b1e2d",
    lightColor: "#fef2f2",
    borderColor: "#e7c7c7",
  },
  {
    title: "数学",
    englishTitle: "Mathematics",
    description: "公式・解法・問題演習をまとめる予定。",
    icon: "📐",
    href: "/math",
    color: "#7c3aed",
    lightColor: "#f5f3ff",
    borderColor: "#ddd6fe",
    comingSoon: true,
  },
  {
    title: "理科",
    englishTitle: "Science",
    description: "物理・化学・生物・地学をまとめる予定。",
    icon: "🧪",
    href: "/science",
    color: "#15803d",
    lightColor: "#f0fdf4",
    borderColor: "#bbf7d0",
    comingSoon: true,
  },
  {
    title: "社会",
    englishTitle: "Social Studies",
    description: "地理・歴史・公民をまとめる予定。",
    icon: "🌍",
    href: "/social",
    color: "#9a5b21",
    lightColor: "#fff7ed",
    borderColor: "#fed7aa",
    comingSoon: true,
  },
];

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "32px 16px 60px",
    background:
      "linear-gradient(145deg, #f7f8fb 0%, #f4f5f8 45%, #eef1f5 100%)",
    color: "#1f2937",
  },
  container: {
    width: "100%",
    maxWidth: "1120px",
    margin: "0 auto",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "34px",
    flexWrap: "wrap",
  },
  brand: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 950,
    letterSpacing: "0.16em",
    color: "#111827",
  },
  status: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    minHeight: "40px",
    padding: "0 14px",
    border: "1px solid #dfe3ea",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.8)",
    color: "#667085",
    fontSize: "12px",
    fontWeight: 800,
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 0 4px rgba(34,197,94,0.13)",
  },
  hero: {
    position: "relative",
    overflow: "hidden",
    marginBottom: "42px",
    padding: "52px clamp(24px, 6vw, 64px)",
    border: "1px solid #202938",
    borderRadius: "30px",
    background:
      "linear-gradient(135deg, #111827 0%, #1f2937 55%, #293548 100%)",
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.18)",
    color: "#ffffff",
  },
  heroGlow: {
    position: "absolute",
    top: "-100px",
    right: "-70px",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(96,165,250,0.25), rgba(96,165,250,0))",
    pointerEvents: "none",
  },
  heroSmall: {
    position: "relative",
    margin: "0 0 12px",
    color: "#93c5fd",
    fontSize: "12px",
    fontWeight: 900,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  heroTitle: {
    position: "relative",
    margin: 0,
    fontSize: "clamp(46px, 9vw, 82px)",
    lineHeight: 0.95,
    letterSpacing: "-0.055em",
  },
  heroText: {
    position: "relative",
    maxWidth: "680px",
    margin: "24px 0 0",
    color: "#d1d5db",
    fontSize: "15px",
    lineHeight: 1.9,
  },
  heroTags: {
    position: "relative",
    display: "flex",
    gap: "9px",
    marginTop: "26px",
    flexWrap: "wrap",
  },
  heroTag: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: "31px",
    padding: "0 11px",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.07)",
    color: "#e5e7eb",
    fontSize: "11px",
    fontWeight: 800,
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "14px",
    marginBottom: "18px",
    flexWrap: "wrap",
  },
  sectionTitle: {
    margin: 0,
    color: "#202938",
    fontSize: "25px",
  },
  sectionText: {
    margin: "6px 0 0",
    color: "#7c8493",
    fontSize: "13px",
  },
  count: {
    color: "#98a2b3",
    fontSize: "12px",
    fontWeight: 800,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },
  card: {
    position: "relative",
    display: "block",
    minHeight: "190px",
    padding: "23px",
    overflow: "hidden",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.92)",
    boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
    color: "#1f2937",
    textDecoration: "none",
    transition:
      "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
  },
  cardLine: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "5px",
    height: "100%",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "14px",
  },
  iconBox: {
    display: "grid",
    placeItems: "center",
    width: "55px",
    height: "55px",
    borderRadius: "16px",
    fontSize: "29px",
  },
  arrow: {
    fontSize: "23px",
    fontWeight: 900,
  },
  cardTitle: {
    margin: "18px 0 4px",
    fontSize: "22px",
  },
  englishTitle: {
    margin: 0,
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "0.11em",
    textTransform: "uppercase",
  },
  description: {
    margin: "12px 0 0",
    color: "#667085",
    fontSize: "13px",
    lineHeight: 1.75,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: "27px",
    marginTop: "14px",
    padding: "0 9px",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "0.08em",
  },
  footer: {
    marginTop: "38px",
    paddingTop: "20px",
    borderTop: "1px solid #dfe3ea",
    color: "#98a2b3",
    fontSize: "12px",
    textAlign: "center",
  },
};

export default function StudyOSHomePage() {
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth < 720);
    };

    checkWidth();
    window.addEventListener("resize", checkWidth);

    return () => {
      window.removeEventListener("resize", checkWidth);
    };
  }, []);

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.topBar}>
          <p style={styles.brand}>STUDY OS</p>

          <div style={styles.status}>
            <span style={styles.statusDot} />
            SYSTEM ONLINE
          </div>
        </header>

        <section style={styles.hero}>
          <span style={styles.heroGlow} />

          <p style={styles.heroSmall}>Personal Study Workspace</p>

          <h1 style={styles.heroTitle}>STUDY OS</h1>

          <p style={styles.heroText}>
            教科ごとの知識を整理し、必要なときにすぐ開ける。
            自分専用の学習システム。
          </p>

          <div style={styles.heroTags}>
            <span style={styles.heroTag}>📘 English</span>
            <span style={styles.heroTag}>📖 Japanese</span>
            <span style={styles.heroTag}>More subjects coming soon</span>
          </div>
        </section>

        <section>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Subjects</h2>
              <p style={styles.sectionText}>
                学習する教科を選んでください。
              </p>
            </div>

            <span style={styles.count}>2 SUBJECTS AVAILABLE</span>
          </div>

          <div
            style={{
              ...styles.grid,
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(2, minmax(0, 1fr))",
            }}
          >
            {subjects.map((subject) => {
              const isHovered = hoveredCard === subject.title;

              const content = (
                <>
                  <span
                    style={{
                      ...styles.cardLine,
                      background: subject.color,
                    }}
                  />

                  <div style={styles.cardTop}>
                    <div
                      style={{
                        ...styles.iconBox,
                        background: subject.lightColor,
                      }}
                    >
                      {subject.icon}
                    </div>

                    <span
                      style={{
                        ...styles.arrow,
                        color: subject.color,
                      }}
                    >
                      {subject.comingSoon ? "—" : "→"}
                    </span>
                  </div>

                  <h3
                    style={{
                      ...styles.cardTitle,
                      color: subject.color,
                    }}
                  >
                    {subject.title}
                  </h3>

                  <p
                    style={{
                      ...styles.englishTitle,
                      color: subject.color,
                    }}
                  >
                    {subject.englishTitle}
                  </p>

                  <p style={styles.description}>
                    {subject.description}
                  </p>

                  {subject.comingSoon && (
                    <span
                      style={{
                        ...styles.badge,
                        background: subject.lightColor,
                        color: subject.color,
                        border: `1px solid ${subject.borderColor}`,
                      }}
                    >
                      COMING SOON
                    </span>
                  )}
                </>
              );

              if (subject.comingSoon) {
                return (
                  <div
                    key={subject.title}
                    style={{
                      ...styles.card,
                      border: `1px solid ${subject.borderColor}`,
                      opacity: 0.62,
                      cursor: "not-allowed",
                    }}
                  >
                    {content}
                  </div>
                );
              }

              return (
                <Link
                  key={subject.title}
                  href={subject.href}
                  style={{
                    ...styles.card,
                    border: `1px solid ${
                      isHovered
                        ? subject.color
                        : subject.borderColor
                    }`,
                    transform: isHovered
                      ? "translateY(-5px)"
                      : "translateY(0)",
                    boxShadow: isHovered
                      ? "0 20px 44px rgba(15,23,42,0.13)"
                      : styles.card.boxShadow,
                  }}
                  onMouseEnter={() =>
                    setHoveredCard(subject.title)
                  }
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {content}
                </Link>
              );
            })}
          </div>
        </section>

        <footer style={styles.footer}>
          STUDY OS — Personal Learning System
        </footer>
      </div>
    </main>
  );
}