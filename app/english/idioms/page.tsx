"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  createIdiom,
  createIdiomFolder,
  deleteIdiomFolder,
  getDueIdiomMeanings,
  getFavoriteIdioms,
  getIdiomFolders,
  getIdioms,
  getIdiomStats,
  getWeakIdiomMeanings,
  updateIdiomFolder,
} from "./storage";

import type { IdiomFolder } from "./types";

type MeaningDraft = {
  meaning: string;
  example: string;
  note: string;
};

const folderColors = [
  "#7C3AED",
  "#2563EB",
  "#16A34A",
  "#EA580C",
  "#DC2626",
  "#0891B2",
  "#0F172A",
];

const folderIcons = [
  "📘",
  "📗",
  "📕",
  "📙",
  "🏫",
  "🔥",
  "⭐",
  "🎯",
  "📁",
];

export default function IdiomsPage() {
  const [folders, setFolders] = useState<IdiomFolder[]>([]);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showIdiomModal, setShowIdiomModal] = useState(false);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);

  function refresh() {
    setFolders(getIdiomFolders());
  }

  useEffect(() => {
    refresh();

    window.addEventListener(
      "study-os-idioms-updated",
      refresh,
    );

    return () => {
      window.removeEventListener(
        "study-os-idioms-updated",
        refresh,
      );
    };
  }, []);

  const idioms = getIdioms();
  const dueMeanings = getDueIdiomMeanings();
  const weakMeanings = getWeakIdiomMeanings();
  const favorites = getFavoriteIdioms();
  const stats = getIdiomStats();

  const orderedFolders = useMemo(() => {
    return [...folders].sort(
      (a, b) =>
        Number(b.pinned) - Number(a.pinned) ||
        a.sortOrder - b.sortOrder,
    );
  }, [folders]);

  function toggleFolder(folderId: string) {
    setSelectedFolders((current) =>
      current.includes(folderId)
        ? current.filter((id) => id !== folderId)
        : [...current, folderId],
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f3efff_0%,#faf8ff_42%,#ffffff_100%)] px-4 pb-36 pt-6 text-slate-900">
      <div className="mx-auto w-full max-w-6xl">
        <section className="relative overflow-hidden rounded-[34px] bg-slate-950 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] sm:p-8">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-violet-400/20 blur-3xl" />

          <div className="absolute -bottom-24 left-16 h-52 w-52 rounded-full bg-sky-400/15 blur-3xl" />

          <div className="relative">
            <Link
              href="/english"
              className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black"
            >
              ← 英語ホーム
            </Link>

            <p className="mt-6 text-sm font-black tracking-[0.18em] text-violet-300">
              IDIOMS OS
            </p>

            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              📖 英熟語帳
            </h1>

            <p className="mt-3 max-w-xl text-sm font-medium leading-7 text-slate-300">
              1つの熟語に複数の意味を登録し、意味ごとに忘却曲線で復習。
            </p>

            <div className="mt-6 grid grid-cols-4 gap-2 sm:gap-3">
              <HeroStat
                label="熟語"
                value={`${idioms.length}個`}
              />

              <HeroStat
                label="今日の復習"
                value={`${dueMeanings.length}個`}
              />

              <HeroStat
                label="苦手"
                value={`${weakMeanings.length}個`}
              />

              <HeroStat
                label="学習時間"
                value={`${Math.floor(
                  stats.totalSeconds / 60,
                )}分`}
              />
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black tracking-[0.15em] text-violet-500">
                TODAY&apos;S MISSION
              </p>

              <h2 className="mt-1 text-2xl font-black">
                今日やること
              </h2>
            </div>

            <Link
              href="/english/idioms/review"
              className="rounded-full bg-violet-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-200"
            >
              ▶ 復習を始める
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MissionCard
              icon="🔁"
              title="期限が来た意味"
              value={`${dueMeanings.length}個`}
              href="/english/idioms/review"
            />

            <MissionCard
              icon="❌"
              title="苦手な意味"
              value={`${weakMeanings.length}個`}
              href="/english/idioms/quiz?smart=weak"
            />

            <MissionCard
              icon="⭐"
              title="お気に入り"
              value={`${favorites.length}個`}
              href="/english/idioms/quiz?smart=favorite"
            />
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black tracking-[0.15em] text-violet-500">
                FOLDERS
              </p>

              <h2 className="mt-1 text-2xl font-black">
                自分のフォルダ
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                色・アイコン・説明を自由に設定できる。
              </p>
            </div>

            <button
              onClick={() => setShowFolderModal(true)}
              className="rounded-2xl bg-violet-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-violet-200"
            >
              ＋ フォルダ作成
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {orderedFolders.map((folder) => {
              const idiomCount = idioms.filter(
                (idiom) =>
                  idiom.folderIds.includes(folder.id),
              ).length;

              return (
                <article
                  key={folder.id}
                  className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:p-5"
                >
                  <Link
                    href={`/english/idioms/folder/${folder.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className="grid h-14 w-14 place-items-center rounded-2xl text-3xl"
                        style={{
                          backgroundColor: `${folder.color}18`,
                        }}
                      >
                        {folder.icon}
                      </div>

                      {folder.pinned && <span>📌</span>}
                    </div>

                    <h3 className="mt-4 truncate text-lg font-black">
                      {folder.name}
                    </h3>

                    <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
                      {folder.description || "説明なし"}
                    </p>

                    <p
                      className="mt-4 text-sm font-black"
                      style={{
                        color: folder.color,
                      }}
                    >
                      {idiomCount}個 →
                    </p>
                  </Link>

                  <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                    <button
                      onClick={() =>
                        updateIdiomFolder(folder.id, {
                          pinned: !folder.pinned,
                        })
                      }
                      className="flex-1 rounded-xl bg-slate-100 px-2 py-2 text-[11px] font-black"
                    >
                      {folder.pinned
                        ? "ピン解除"
                        : "ピン"}
                    </button>

                    <button
                      onClick={() => {
                        const name = window.prompt(
                          "新しいフォルダ名",
                          folder.name,
                        );

                        if (name?.trim()) {
                          updateIdiomFolder(folder.id, {
                            name: name.trim(),
                          });
                        }
                      }}
                      className="rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-black"
                    >
                      編集
                    </button>

                    <button
                      onClick={() => {
                        const accepted =
                          window.confirm(
                            `「${folder.name}」を削除しますか？\n熟語そのものは残ります。`,
                          );

                        if (accepted) {
                          deleteIdiomFolder(folder.id);
                        }
                      }}
                      className="rounded-xl bg-rose-50 px-3 py-2 text-[11px] font-black text-rose-600"
                    >
                      削除
                    </button>
                  </div>
                </article>
              );
            })}

            <button
              onClick={() => setShowFolderModal(true)}
              className="min-h-56 rounded-[26px] border-2 border-dashed border-violet-200 bg-violet-50/60 p-5 text-center transition hover:bg-violet-50"
            >
              <span className="text-4xl">＋</span>

              <p className="mt-3 font-black text-violet-700">
                新しいフォルダ
              </p>
            </button>
          </div>
        </section>

        <section className="mt-8 rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-black tracking-[0.15em] text-violet-500">
            MIX STUDY
          </p>

          <h2 className="mt-1 text-2xl font-black">
            まとめて問題を出す
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            複数のフォルダを選び、熟語と意味を混ぜて出題。
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {orderedFolders.map((folder) => {
              const checked =
                selectedFolders.includes(folder.id);

              return (
                <button
                  key={folder.id}
                  onClick={() =>
                    toggleFolder(folder.id)
                  }
                  className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                    checked
                      ? "border-violet-400 bg-violet-50 ring-2 ring-violet-100"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <span className="text-2xl">
                    {folder.icon}
                  </span>

                  <span className="min-w-0 flex-1 truncate text-sm font-black">
                    {folder.name}
                  </span>

                  <span>{checked ? "✓" : ""}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link
              href={
                selectedFolders.length > 0
                  ? `/english/idioms/quiz?folders=${selectedFolders.join(
                      ",",
                    )}`
                  : "#"
              }
              className={`rounded-2xl py-4 text-center font-black text-white ${
                selectedFolders.length > 0
                  ? "bg-violet-600"
                  : "pointer-events-none bg-slate-300"
              }`}
            >
              📝 まとめクイズ
            </Link>

            <Link
              href={
                selectedFolders.length > 0
                  ? `/english/idioms/listen?folders=${selectedFolders.join(
                      ",",
                    )}`
                  : "#"
              }
              className={`rounded-2xl py-4 text-center font-black text-white ${
                selectedFolders.length > 0
                  ? "bg-sky-500"
                  : "pointer-events-none bg-slate-300"
              }`}
            >
              🎧 まとめて流し聞き
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => setShowIdiomModal(true)}
            className="rounded-[26px] bg-white p-5 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl"
          >
            <span className="text-3xl">➕</span>

            <h3 className="mt-3 text-lg font-black">
              熟語を追加
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              1つの熟語に意味を何個でも追加できる
            </p>
          </button>

          <Link
            href="/english/idioms/folder/all"
            className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl"
          >
            <span className="text-3xl">📖</span>

            <h3 className="mt-3 text-lg font-black">
              すべての熟語
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              熟語・意味・タグ・ファミリーを検索
            </p>
          </Link>
        </section>
      </div>

      {showFolderModal && (
        <FolderModal
          onClose={() => setShowFolderModal(false)}
          onSaved={() => {
            setShowFolderModal(false);
            refresh();
          }}
        />
      )}

      {showIdiomModal && (
        <IdiomModal
          folders={orderedFolders}
          onClose={() => setShowIdiomModal(false)}
          onSaved={() => {
            setShowIdiomModal(false);
            refresh();
          }}
        />
      )}
    </main>
  );
}

function HeroStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/10 px-2 py-4 text-center">
      <p className="text-[10px] font-bold text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-black text-white">
        {value}
      </p>
    </div>
  );
}

function MissionCard({
  icon,
  title,
  value,
  href,
}: {
  icon: string;
  title: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-3xl bg-slate-50 p-4 transition hover:bg-violet-50"
    >
      <span className="text-3xl">{icon}</span>

      <div>
        <p className="text-xs font-bold text-slate-500">
          {title}
        </p>

        <p className="mt-1 text-xl font-black">
          {value}
        </p>
      </div>
    </Link>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end bg-slate-950/45 p-3 sm:items-center sm:justify-center">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-[30px] bg-white p-5 sm:max-w-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function FolderModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [icon, setIcon] = useState("📘");
  const [color, setColor] =
    useState("#7C3AED");

  return (
    <Modal
      title="新しいフォルダ"
      onClose={onClose}
    >
      <Field
        label="名前"
        value={name}
        onChange={setName}
        placeholder="英検2級"
      />

      <Field
        label="説明"
        value={description}
        onChange={setDescription}
        placeholder="英検2級で覚えたい熟語"
      />

      <p className="mt-5 text-sm font-black">
        アイコン
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        {folderIcons.map((item) => (
          <button
            key={item}
            onClick={() => setIcon(item)}
            className={`grid h-11 w-11 place-items-center rounded-xl text-xl ${
              icon === item
                ? "bg-violet-100 ring-2 ring-violet-500"
                : "bg-slate-100"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <p className="mt-5 text-sm font-black">
        色
      </p>

      <div className="mt-3 flex flex-wrap gap-3">
        {folderColors.map((item) => (
          <button
            key={item}
            onClick={() => setColor(item)}
            className="h-9 w-9 rounded-full"
            style={{
              backgroundColor: item,
              outline:
                color === item
                  ? `3px solid ${item}55`
                  : "none",
              outlineOffset: "3px",
            }}
          />
        ))}
      </div>

      <button
        onClick={() => {
          if (!name.trim()) {
            return;
          }

          createIdiomFolder({
            name: name.trim(),
            description: description.trim(),
            icon,
            color,
          });

          onSaved();
        }}
        className="mt-7 w-full rounded-2xl bg-violet-600 py-4 font-black text-white"
      >
        作成
      </button>
    </Modal>
  );
}

function IdiomModal({
  folders,
  onClose,
  onSaved,
}: {
  folders: IdiomFolder[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [phrase, setPhrase] = useState("");
  const [family, setFamily] = useState("");
  const [breakdown, setBreakdown] =
    useState("");
  const [tags, setTags] = useState("");
  const [folderIds, setFolderIds] =
    useState<string[]>([]);

  const [meanings, setMeanings] = useState<
    MeaningDraft[]
  >([
    {
      meaning: "",
      example: "",
      note: "",
    },
  ]);

  function updateMeaning(
    index: number,
    key: keyof MeaningDraft,
    value: string,
  ) {
    setMeanings((current) =>
      current.map((meaning, meaningIndex) =>
        meaningIndex === index
          ? {
              ...meaning,
              [key]: value,
            }
          : meaning,
      ),
    );
  }

  return (
    <Modal
      title="熟語を追加"
      onClose={onClose}
    >
      <Field
        label="英熟語"
        value={phrase}
        onChange={setPhrase}
        placeholder="take off"
      />

      <Field
        label="熟語ファミリー"
        value={family}
        onChange={setFamily}
        placeholder="take"
      />

      <Field
        label="構成・覚え方"
        value={breakdown}
        onChange={setBreakdown}
        placeholder="take（取る）+ off（離れて）"
      />

      <Field
        label="タグ（カンマ区切り）"
        value={tags}
        onChange={setTags}
        placeholder="英検2級, 頻出"
      />

      <div className="mt-6 space-y-4">
        {meanings.map((meaning, index) => (
          <section
            key={index}
            className="rounded-[24px] border border-violet-100 bg-violet-50/70 p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-black">
                意味 {index + 1}
              </h3>

              {meanings.length > 1 && (
                <button
                  onClick={() =>
                    setMeanings((current) =>
                      current.filter(
                        (_, meaningIndex) =>
                          meaningIndex !== index,
                      ),
                    )
                  }
                  className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-black text-rose-600"
                >
                  削除
                </button>
              )}
            </div>

            <Field
              label="意味"
              value={meaning.meaning}
              onChange={(value) =>
                updateMeaning(
                  index,
                  "meaning",
                  value,
                )
              }
              placeholder="離陸する"
            />

            <Field
              label="例文"
              value={meaning.example}
              onChange={(value) =>
                updateMeaning(
                  index,
                  "example",
                  value,
                )
              }
              placeholder="The plane took off."
            />

            <Field
              label="メモ"
              value={meaning.note}
              onChange={(value) =>
                updateMeaning(
                  index,
                  "note",
                  value,
                )
              }
              placeholder="飛行機が地面を離れる"
            />
          </section>
        ))}

        <button
          onClick={() =>
            setMeanings((current) => [
              ...current,
              {
                meaning: "",
                example: "",
                note: "",
              },
            ])
          }
          className="w-full rounded-2xl border-2 border-dashed border-violet-200 py-3 font-black text-violet-700"
        >
          ＋ 意味を追加
        </button>
      </div>

      <p className="mt-6 text-sm font-black">
        保存先（複数選択可）
      </p>

      <div className="mt-2 space-y-2">
        {folders.map((folder) => {
          const checked =
            folderIds.includes(folder.id);

          return (
            <button
              key={folder.id}
              onClick={() =>
                setFolderIds((current) =>
                  checked
                    ? current.filter(
                        (id) =>
                          id !== folder.id,
                      )
                    : [
                        ...current,
                        folder.id,
                      ],
                )
              }
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left ${
                checked
                  ? "bg-violet-100 ring-2 ring-violet-400"
                  : "bg-slate-100"
              }`}
            >
              <span className="font-bold">
                {folder.icon} {folder.name}
              </span>

              <span>{checked ? "✓" : ""}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => {
          const validMeanings =
            meanings.filter((meaning) =>
              meaning.meaning.trim(),
            );

          if (
            !phrase.trim() ||
            validMeanings.length === 0
          ) {
            return;
          }

          createIdiom({
            phrase: phrase.trim(),

            meanings: validMeanings.map(
              (meaning) => ({
                meaning:
                  meaning.meaning.trim(),
                example:
                  meaning.example.trim(),
                note: meaning.note.trim(),
              }),
            ),

            folderIds,

            tags: tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),

            family: family.trim(),
            breakdown: breakdown.trim(),
          });

          onSaved();
        }}
        className="mt-7 w-full rounded-2xl bg-violet-600 py-4 font-black text-white"
      >
        保存
      </button>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="mt-4 block">
      <span className="text-sm font-black">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-400"
      />
    </label>
  );
}