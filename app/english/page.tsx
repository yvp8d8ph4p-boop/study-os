import Link from "next/link";

type MenuCard = {
  title: string;
  description: string;
  href: string;
  emoji: string;
  background: string;
  color: string;
  available: boolean;
};

const menuCards: MenuCard[] = [
  {
    title: "単語帳",
    description: "英単語の登録・流し聞き・クイズ・苦手復習",
    href: "/english/vocabulary",
    emoji: "📚",
    background: "#DBEAFE",
    color: "#1D4ED8",
    available: true,
  },
  {
    title: "熟語帳",
    description: "英熟語の登録・流し聞き・クイズ・苦手復習",
    href: "/english/idioms",
    emoji: "🔤",
    background: "#EDE9FE",
    color: "#7C3AED",
    available: true,
  },
  {
    title: "英文法",
    description: "基本文法のまとめを見ながら、メモや表を書き足せる文法ノート",
    href: "/english/grammar",
    emoji: "📖",
    background: "#DCFCE7",
    color: "#15803D",
    available: true,
  },
  {
    title: "リスニング",
    description: "英語を聞いて内容を答える練習",
    href: "#",
    emoji: "🎧",
    background: "#FEF3C7",
    color: "#B45309",
    available: false,
  },
  {
    title: "英作文",
    description: "英作文の練習・保存・添削",
    href: "#",
    emoji: "✍️",
    background: "#FFE4E6",
    color: "#BE123C",
    available: false,
  },
  {
    title: "英検対策",
    description: "英検の単語・文法・作文・リスニング対策",
    href: "#",
    emoji: "🎯",
    background: "#E0F2FE",
    color: "#0369A1",
    available: false,
  },
];

export default function EnglishPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 20px 60px",
        background:
          "linear-gradient(180deg, #EFF6FF 0%, #F8FAFC 55%, #FFFFFF 100%)",
        color: "#0F172A",
      }}
    >
      <section
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            textAlign: "center",
            marginBottom: "38px",
          }}
        >
          <div
            style={{
              display: "inline-grid",
              placeItems: "center",
              width: "88px",
              height: "88px",
              marginBottom: "16px",
              borderRadius: "28px",
              background: "white",
              boxShadow: "0 12px 30px rgba(37, 99, 235, 0.14)",
              fontSize: "48px",
            }}
          >
            📘
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(42px, 8vw, 66px)",
              color: "#2563EB",
            }}
          >
            英語
          </h1>

          <p
            style={{
              margin: "12px auto 0",
              maxWidth: "620px",
              color: "#64748B",
              fontSize: "19px",
              lineHeight: 1.8,
            }}
          >
            単語・熟語・文法・リスニング・英作文をまとめて勉強するページ
          </p>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "18px",
          }}
        >
          {menuCards.map((card) =>
            card.available ? (
              <Link
                key={card.title}
                href={card.href}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <article
                  style={{
                    height: "100%",
                    minHeight: "190px",
                    padding: "24px",
                    borderRadius: "22px",
                    background: "white",
                    boxShadow: "0 10px 28px rgba(15, 23, 42, 0.08)",
                    border: "1px solid #E2E8F0",
                    boxSizing: "border-box",
                    cursor: "pointer",
                    transition:
                      "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      placeItems: "center",
                      width: "64px",
                      height: "64px",
                      marginBottom: "18px",
                      borderRadius: "18px",
                      background: card.background,
                      fontSize: "34px",
                    }}
                  >
                    {card.emoji}
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: "27px",
                      color: card.color,
                    }}
                  >
                    {card.title}
                  </h2>

                  <p
                    style={{
                      margin: "10px 0 0",
                      color: "#64748B",
                      fontSize: "17px",
                      lineHeight: 1.7,
                    }}
                  >
                    {card.description}
                  </p>

                  <p
                    style={{
                      margin: "18px 0 0",
                      color: card.color,
                      fontWeight: "bold",
                      fontSize: "17px",
                    }}
                  >
                    開く →
                  </p>
                </article>
              </Link>
            ) : (
              <article
                key={card.title}
                style={{
                  minHeight: "190px",
                  padding: "24px",
                  borderRadius: "22px",
                  background: "#F8FAFC",
                  border: "1px dashed #CBD5E1",
                  boxSizing: "border-box",
                  opacity: 0.78,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: "64px",
                    height: "64px",
                    marginBottom: "18px",
                    borderRadius: "18px",
                    background: card.background,
                    fontSize: "34px",
                  }}
                >
                  {card.emoji}
                </div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: "27px",
                    color: card.color,
                  }}
                >
                  {card.title}
                </h2>

                <p
                  style={{
                    margin: "10px 0 0",
                    color: "#64748B",
                    fontSize: "17px",
                    lineHeight: 1.7,
                  }}
                >
                  {card.description}
                </p>

                <span
                  style={{
                    display: "inline-block",
                    marginTop: "17px",
                    padding: "7px 12px",
                    borderRadius: "999px",
                    background: "#E2E8F0",
                    color: "#475569",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  準備中
                </span>
              </article>
            ),
          )}
        </div>

        <div
          style={{
            marginTop: "34px",
            textAlign: "center",
          }}
        >
          <Link
            href="/"
            style={{
              color: "#2563EB",
              fontSize: "20px",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            ← ホームへ戻る
          </Link>
        </div>
      </section>
    </main>
  );
}