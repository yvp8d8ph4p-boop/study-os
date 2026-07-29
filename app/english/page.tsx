import Link from "next/link";

import FeatureCard from "@/components/study/FeatureCard";
import SectionTitle from "@/components/study/SectionTitle";
import SubjectHero from "@/components/study/SubjectHero";

type QuickAction = {
  title: string;
  description: string;
  emoji: string;
  href: string;
  color: string;
  background: string;
};

const quickActions: QuickAction[] = [
  {
    title: "単語を確認",
    description: "登録した英単語をすぐに開く",
    emoji: "📚",
    href: "/english/vocabulary",
    color: "#1D4ED8",
    background: "#DBEAFE",
  },
  {
    title: "熟語を確認",
    description: "英熟語をまとめて復習する",
    emoji: "🔤",
    href: "/english/idioms",
    color: "#7C3AED",
    background: "#EDE9FE",
  },
  {
    title: "文法ノート",
    description: "要点や自分のメモを見直す",
    emoji: "📖",
    href: "/english/grammar",
    color: "#15803D",
    background: "#DCFCE7",
  },
];

const todayTasks = [
  {
    emoji: "📚",
    title: "英単語",
    detail: "新しい単語を少し確認",
    color: "#2563EB",
    background: "#DBEAFE",
  },
  {
    emoji: "🔤",
    title: "英熟語",
    detail: "苦手な熟語を復習",
    color: "#7C3AED",
    background: "#EDE9FE",
  },
  {
    emoji: "📖",
    title: "英文法",
    detail: "文法ノートを1単元見る",
    color: "#15803D",
    background: "#DCFCE7",
  },
];

export default function EnglishPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px 16px 48px",
        background:
          "linear-gradient(180deg, #EAF7FF 0%, #F8FBFF 42%, #FFFFFF 100%)",
        color: "#0F172A",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1080px",
          margin: "0 auto",
        }}
      >
        <SubjectHero
          emoji="📘"
          title="英語"
          englishTitle="English"
          description="単語・熟語・文法を、自分のペースで少しずつ積み上げよう。"
          accentColor="#38BDF8"
        />

        <section
          style={{
            marginTop: "28px",
          }}
        >
          <SectionTitle
            eyebrow="TODAY"
            title="今日の英語"
            description="迷ったら、まずはこの3つから始めよう。"
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
            }}
          >
            {todayTasks.map((task) => (
              <article
                key={task.title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "18px",
                  borderRadius: "24px",
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: "54px",
                    height: "54px",
                    flexShrink: 0,
                    borderRadius: "18px",
                    background: task.background,
                    fontSize: "28px",
                  }}
                >
                  {task.emoji}
                </div>

                <div>
                  <h3
                    style={{
                      margin: 0,
                      color: task.color,
                      fontSize: "18px",
                    }}
                  >
                    {task.title}
                  </h3>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#64748B",
                      fontSize: "14px",
                      lineHeight: 1.6,
                    }}
                  >
                    {task.detail}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          style={{
            marginTop: "36px",
          }}
        >
          <SectionTitle
            eyebrow="MAIN STUDY"
            title="メイン学習"
            description="英語学習の中心になる3つの機能。"
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "18px",
            }}
          >
            <FeatureCard
              emoji="📚"
              title="単語帳"
              description="英単語の登録・流し聞き・クイズ・苦手復習"
              href="/english/vocabulary"
              accentColor="#1D4ED8"
              iconBackground="#DBEAFE"
              badge="使える"
              available
            />

            <FeatureCard
              emoji="🔤"
              title="熟語帳"
              description="英熟語の登録・流し聞き・クイズ・苦手復習"
              href="/english/idioms"
              accentColor="#7C3AED"
              iconBackground="#EDE9FE"
              badge="使える"
              available
            />

            <FeatureCard
              emoji="📖"
              title="英文法"
              description="文法の要点を確認しながら、自分のメモや表を書き足せる"
              href="/english/grammar"
              accentColor="#15803D"
              iconBackground="#DCFCE7"
              badge="使える"
              available
            />
          </div>
        </section>

        <section
          style={{
            marginTop: "36px",
          }}
        >
          <SectionTitle
            eyebrow="QUICK ACCESS"
            title="すぐに開く"
            description="よく使う機能へ、そのまま移動できる。"
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "14px",
            }}
          >
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                style={{
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                <article
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "14px",
                    height: "100%",
                    padding: "17px",
                    borderRadius: "22px",
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "13px",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        placeItems: "center",
                        width: "48px",
                        height: "48px",
                        flexShrink: 0,
                        borderRadius: "16px",
                        background: action.background,
                        fontSize: "25px",
                      }}
                    >
                      {action.emoji}
                    </div>

                    <div>
                      <h3
                        style={{
                          margin: 0,
                          color: action.color,
                          fontSize: "17px",
                        }}
                      >
                        {action.title}
                      </h3>

                      <p
                        style={{
                          margin: "4px 0 0",
                          color: "#64748B",
                          fontSize: "13px",
                          lineHeight: 1.5,
                        }}
                      >
                        {action.description}
                      </p>
                    </div>
                  </div>

                  <span
                    style={{
                      color: action.color,
                      fontSize: "20px",
                      fontWeight: 700,
                    }}
                  >
                    →
                  </span>
                </article>
              </Link>
            ))}
          </div>
        </section>

        <section
          style={{
            marginTop: "36px",
          }}
        >
          <SectionTitle
            eyebrow="TOOLS"
            title="学習ツール"
            description="これから追加していく英語学習機能。"
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "18px",
            }}
          >
            <FeatureCard
              emoji="🎧"
              title="リスニング"
              description="英語の音声を聞いて内容をつかむ練習"
              accentColor="#B45309"
              iconBackground="#FEF3C7"
              badge="準備中"
              available={false}
            />

            <FeatureCard
              emoji="✍️"
              title="英作文"
              description="英作文を書いて保存し、自分の文章を見直す"
              accentColor="#BE123C"
              iconBackground="#FFE4E6"
              badge="準備中"
              available={false}
            />

            <FeatureCard
              emoji="🎯"
              title="英検対策"
              description="単語・文法・作文などを英検向けに整理する"
              accentColor="#0369A1"
              iconBackground="#E0F2FE"
              badge="準備中"
              available={false}
            />
          </div>
        </section>

        <section
          style={{
            marginTop: "36px",
          }}
        >
          <SectionTitle
            eyebrow="STATUS"
            title="学習状況"
            description="今後、実際の学習データとつなげられる場所。"
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "14px",
            }}
          >
            <article
              style={{
                padding: "20px",
                borderRadius: "24px",
                background: "#0F172A",
                color: "#FFFFFF",
                boxShadow: "0 14px 30px rgba(15, 23, 42, 0.14)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#BAE6FD",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                }}
              >
                TODAY
              </p>

              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "30px",
                  fontWeight: 700,
                }}
              >
                0分
              </p>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#CBD5E1",
                  fontSize: "14px",
                }}
              >
                今日の英語学習
              </p>
            </article>

            <article
              style={{
                padding: "20px",
                borderRadius: "24px",
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#2563EB",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                }}
              >
                VOCABULARY
              </p>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "#0F172A",
                  fontSize: "30px",
                  fontWeight: 700,
                }}
              >
                0語
              </p>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748B",
                  fontSize: "14px",
                }}
              >
                登録した単語
              </p>
            </article>

            <article
              style={{
                padding: "20px",
                borderRadius: "24px",
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#7C3AED",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                }}
              >
                IDIOMS
              </p>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "#0F172A",
                  fontSize: "30px",
                  fontWeight: 700,
                }}
              >
                0個
              </p>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748B",
                  fontSize: "14px",
                }}
              >
                登録した熟語
              </p>
            </article>

            <article
              style={{
                padding: "20px",
                borderRadius: "24px",
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#15803D",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                }}
              >
                GRAMMAR
              </p>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "#0F172A",
                  fontSize: "30px",
                  fontWeight: 700,
                }}
              >
                0単元
              </p>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748B",
                  fontSize: "14px",
                }}
              >
                学習した文法
              </p>
            </article>
          </div>
        </section>

        <section
          style={{
            marginTop: "36px",
            padding: "24px",
            borderRadius: "28px",
            background:
              "linear-gradient(135deg, #E0F2FE 0%, #EFF6FF 55%, #F5F3FF 100%)",
            border: "1px solid #BAE6FD",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "15px",
            }}
          >
            <div
              style={{
                display: "grid",
                placeItems: "center",
                width: "52px",
                height: "52px",
                flexShrink: 0,
                borderRadius: "18px",
                background: "#FFFFFF",
                fontSize: "27px",
                boxShadow: "0 8px 20px rgba(37, 99, 235, 0.1)",
              }}
            >
              💡
            </div>

            <div>
              <p
                style={{
                  margin: 0,
                  color: "#0369A1",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                }}
              >
                TODAY&apos;S MESSAGE
              </p>

              <h2
                style={{
                  margin: "6px 0 0",
                  color: "#0F172A",
                  fontSize: "22px",
                }}
              >
                完璧より、続けること。
              </h2>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "#475569",
                  fontSize: "15px",
                  lineHeight: 1.8,
                }}
              >
                単語を5個見るだけでも十分。少しずつ続ければ、英語はちゃんと積み上がる。
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}