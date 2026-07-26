import { NextResponse } from "next/server";

type GrammarRequest = {
  topic?: unknown;
  formula?: unknown;
  question?: unknown;
};

type OpenAIContentItem = {
  type?: string;
  text?: string;
};

type OpenAIOutputItem = {
  type?: string;
  content?: OpenAIContentItem[];
};

type OpenAIResponse = {
  output_text?: string;
  output?: OpenAIOutputItem[];
  error?: {
    message?: string;
  };
};

function getTextFromResponse(data: OpenAIResponse): string {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const texts =
    data.output
      ?.flatMap((item) => item.content ?? [])
      .filter(
        (content) =>
          content.type === "output_text" &&
          typeof content.text === "string",
      )
      .map((content) => content.text?.trim())
      .filter((text): text is string => Boolean(text)) ?? [];

  return texts.join("\n\n");
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEYが設定されていません。Vercelまたは.env.localにAPIキーを設定してください。",
        },
        { status: 500 },
      );
    }

    let body: GrammarRequest;

    try {
      body = (await request.json()) as GrammarRequest;
    } catch {
      return NextResponse.json(
        { error: "送信されたデータを読み取れませんでした。" },
        { status: 400 },
      );
    }

    const topic =
      typeof body.topic === "string" ? body.topic.trim() : "";

    const formula =
      typeof body.formula === "string" ? body.formula.trim() : "";

    const question =
      typeof body.question === "string" ? body.question.trim() : "";

    if (!topic || !question) {
      return NextResponse.json(
        { error: "単元と質問を入力してください。" },
        { status: 400 },
      );
    }

    if (question.length > 500) {
      return NextResponse.json(
        { error: "質問は500文字以内にしてください。" },
        { status: 400 },
      );
    }

    const instructions = `
あなたは「STUDY OS」という学習アプリ内の英文法専門AI先生です。
主な利用者は日本の中学生・高校生です。

次のルールを必ず守ってください。

・質問された英文法の単元に集中する
・日本語で分かりやすく答える
・難しい専門用語を使いすぎない
・最初に結論を書く
・必要に応じて短い英語例文と日本語訳を付ける
・説明は長くなりすぎない
・誤りのある英文について聞かれた場合は、正しい英文も示す
・自信がない内容を断定しない
・学校の宿題の答えだけを渡すのではなく、考え方も説明する
・回答にMarkdownの表は使わない

基本の回答形式：

【結論】
短い結論

【説明】
分かりやすい説明

【例文】
必要な場合のみ、英文と日本語訳

【注意】
間違えやすい点がある場合のみ
`.trim();

    const userInput = `
今回の単元：${topic}
基本形：${formula || "指定なし"}

生徒の質問：
${question}
`.trim();

    const openAIResponse = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-5-mini",
          instructions,
          input: userInput,
          max_output_tokens: 700,
        }),
      },
    );

    const data = (await openAIResponse.json()) as OpenAIResponse;

    if (!openAIResponse.ok) {
      console.error("OpenAI API error:", data.error);

      return NextResponse.json(
        {
          error:
            data.error?.message ??
            "AI先生から回答を取得できませんでした。",
        },
        { status: openAIResponse.status },
      );
    }

    const answer = getTextFromResponse(data);

    if (!answer) {
      return NextResponse.json(
        { error: "AI先生の回答が空でした。もう一度試してください。" },
        { status: 502 },
      );
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Grammar AI route error:", error);

    return NextResponse.json(
      { error: "サーバーで予期しないエラーが発生しました。" },
      { status: 500 },
    );
  }
}