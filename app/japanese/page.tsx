"use client";

import Link from "next/link";
import { CSSProperties, useEffect, useState } from "react";

type SubjectCard = {
  title: string;
  englishTitle: string;
  description: string;
  icon: string;
  href: string;
  comingSoon?: boolean;
};

const subjectCards: SubjectCard[] = [
  {
    title: "現代文",
    englishTitle: "Modern Japanese",
    description: "読解テクニック・評論キーワード・接続語・指示語",
    icon: "📚",
    href: "/japanese/modern",
  },
  {
    title: "古文",
    englishTitle: "Classical Japanese",
    description: "古文単語・助動詞・助詞・敬語・文法",
    icon: "🏯",
    href: "/japanese/classical",
  },
  {
    title: "漢文",
    englishTitle: "Kanbun",
    description: "返り点・再読文字・句法・用法まとめ",
    icon: "📜",
    href: "/japanese/kanbun",
  },
  {
    title: "語彙",
    englishTitle: "Vocabulary",
    description: "評論語・慣用句・ことわざ・故事成語・四字熟語",
    icon: "💬",
    href: "/japanese/vocabulary",
  },
  {
    title: "文学",
    englishTitle: "Literature",
    description: "和歌・短歌・俳句・川柳・詩・お気に入り作品",
    icon: "🎋",
    href: "/japanese/literature",
  },
  {
    title: "漢字",
    englishTitle: "Kanji",
    description: "漢字学習ページは今後追加予定",
    icon: "✏️",
    href: "/japanese/kanji",
    comingSoon: true,
  },
];

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "32px 16px 70px",
    background:
      "linear-gradient(145deg, #faf7f4 0%, #f8f4f1 45%, #f3ece9 100%)",
    color: "#292524",
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
    marginBottom: "38px",
    flexWrap: "wrap",
  },
  brand: {
    margin: 0,
    color: "#7f1d1d",
    fontSize: "13px",
    fontWeight: 900,
    letterSpacing: "0.14em",
  },
  homeLink: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: "42px",
    padding: "0 15px",
    border: "1px solid #e2d4d1",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.8)",
    color: "#7f1d1d",
    fontSize: "14px",
    fontWeight: 850,
    textDecoration: "none",
  },
  hero: {
    marginBottom: "38px",
    padding: "42px clamp(22px, 6vw, 60px)",
    border: "1px solid #e5d6d2",
    borderRadius: "28px",
    background:
      "linear-gradient(135deg, rgba(127,29,29,0.98), rgba(107,33,33,0.95))",
    boxShadow: "0 24px 60px rgba(88, 28, 28, 0.16)",
    color: "#ffffff",
  },
  heroSmall: {
    margin: "0 0 10px",
    color: "#fecaca",
    fontSize: "12px",
    fontWeight: 900,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
  },
  heroTitle: {
    margin: 0,
    fontSize: "clamp(42px, 8vw, 72px)",
    lineHeight: 1,
    letterSpacing: "-0.05em",
  },
  heroJapanese: {
    display: "block",
    marginTop: "12px",
    fontSize: "clamp(20px, 4vw, 30px)",
    fontWeight: 800,
    letterSpacing: "0.08em",
  },
  heroText: {
    maxWidth: "650px",
    margin: "20px 0 0",
    color: "#fee2e2",
    fontSize: "15px",
    lineHeight: 1.9,
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
    color: "#3f2927",
    fontSize: "24px",
  },
  sectionText: {
    margin: 0,
    color: "#8a6e69",
    fontSize: "13px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },
  card: {
    position: "relative",
    display: "block",
    minHeight: "170px",
    padding: "22px",
    overflow: "hidden",
    border: "1px solid #e4d8d4",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.9)",
    boxShadow: "0 12px 30px rgba(89, 60, 55, 0.07)",
    color: "#292524",
    textDecoration: "none",
    transition:
      "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
  },
  cardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "5px",
    height: "100%",
    background: "#991b1b",
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
    width: "52px",
    height: "52px",
    borderRadius: "15px",
    background: "#fef2f2",
    fontSize: "27px",
  },
  arrow: {
    color: "#a86464",
    fontSize: "22px",
    fontWeight: 900,
  },
  cardTitle: {
    margin: "18px 0 4px",
    color: "#4c2828",
    fontSize: "21px",
  },
  englishTitle: {
    margin: 0,
    color: "#9f7370",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
  description: {
    margin: "11px 0 0",
    color: "#6f5a57",
    fontSize: "13px",
    lineHeight: 1.75,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: "27px",
    marginTop: "14px",
    padding: "0 9px",
    border: "1px solid #e7d1cd",
    borderRadius: "999px",
    background: "#fff7f6",
    color: "#9f3737",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "0.08em",
  },
  footer: {
    marginTop: "34px",
    paddingTop: "20px",
    borderTop: "1px solid #e3d8d4",
    color: "#9a7f7a",
    fontSize: "12px",
    textAlign: "center",
  },
};

export default function JapaneseHomePage() {
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(
    null,
  );

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
        <div style={styles.topBar}>
          <p style={styles.brand}>STUDY OS / JAPANESE</p>

          <Link href="/" style={styles.homeLink}>
            ← ホームへ戻る
          </Link>
        </div>

        <section style={styles.hero}>
          <p style={styles.heroSmall}>Japanese Study</p>

          <h1 style={styles.heroTitle}>
            Japanese
            <span style={styles.heroJapanese}>国語</span>
          </h1>

          <p style={styles.heroText}>
            言葉を学び、文章を読み、自分の考えを深める。
            現代文から古文、漢文、文学までを整理する国語学習ホーム。
          </p>
        </section>

        <section>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>学習メニュー</h2>
              <p style={styles.sectionText}>
                学びたい分野を選んでください。
              </p>
            </div>
          </div>

          <div
            style={{
              ...styles.grid,
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(2, minmax(0, 1fr))",
            }}
          >
            {subjectCards.map((card) => {
              const isHovered = hoveredCard === card.title;

              const cardContent = (
                <>
                  <span style={styles.cardAccent} />

                  <div style={styles.cardTop}>
                    <div style={styles.iconBox}>{card.icon}</div>

                    <span style={styles.arrow}>
                      {card.comingSoon ? "—" : "→"}
                    </span>
                  </div>

                  <h3 style={styles.cardTitle}>{card.title}</h3>

                  <p style={styles.englishTitle}>
                    {card.englishTitle}
                  </p>

                  <p style={styles.description}>
                    {card.description}
                  </p>

                  {card.comingSoon && (
                    <span style={styles.badge}>COMING SOON</span>
                  )}
                </>
              );

              if (card.comingSoon) {
                return (
                  <div
                    key={card.title}
                    style={{
                      ...styles.card,
                      opacity: 0.68,
                      cursor: "not-allowed",
                    }}
                  >
                    {cardContent}
                  </div>
                );
              }

              return (
                <Link
                  key={card.title}
                  href={card.href}
                  style={{
                    ...styles.card,
                    transform: isHovered
                      ? "translateY(-5px)"
                      : "translateY(0)",
                    boxShadow: isHovered
                      ? "0 20px 42px rgba(89, 37, 37, 0.14)"
                      : styles.card.boxShadow,
                    borderColor: isHovered
                      ? "#c99a94"
                      : "#e4d8d4",
                  }}
                  onMouseEnter={() =>
                    setHoveredCard(card.title)
                  }
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {cardContent}
                </Link>
              );
            })}
          </div>
        </section>

        <footer style={styles.footer}>
          STUDY OS — Japanese
        </footer>
      </div>
    </main>
  );
}