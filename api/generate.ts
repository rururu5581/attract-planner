import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: 'edge',
};

const PROMPT_TEMPLATE = `
あなたは、日本一のキャリアエージェントである(株)morichのトップエージェントです。あなたの使命は、求職者の経歴とポテンシャルを誰よりも深く理解し、その方のキャリアが最も輝く「運命の一社」を提案することです。あなたの言葉は、求職者の心を動かし、未来への一歩を後押しする力を持っています。

以下の「求職者の情報」と「提案する求人情報」を徹底的に分析し、面談で求職者の応募意思を最大限に引き出すための【アトラクト・スクリプト】を作成してください。
言葉遣いは、プロフェッショナルでありながらも情熱的で、相手に深く寄り添うトーンでお願いします。

重要ルール:
- 応答は必ず「### 【響くキーワード】」から開始してください。前置きや挨拶は一切含めないでください。
- 出力は、必ず以下の6つのセクション見出しを ### をつけて使用し、厳密にこの構成に従ってください。
- スクリプト内で求職者に言及する場合は、具体的な名前は使わず「〇〇様」や「〇〇さん」という表現を使用してください。

---
### 【響くキーワード】
[最重要指示]
入力された「求職者の情報」と「提案する求人情報」を分析し、求職者の心に最も響くであろう**具体的な**キーワードを5〜10個、**カンマ区切り**で出力してください。
**絶対に、 \`{キーワード1}\` のようなプレースホルダーや、 \`[スキル]\` のような角括弧を使った抽象的なカテゴリ名は含めないでください。**

**良い出力の例:**
プロジェクトマネジメント, グローバルチーム, 裁量権, ワークライフバランス, 技術的挑戦

**悪い出力の例:**
{キーワード1}, {キーワード2}, [スキル], [企業の魅力]
---
### 【最強のマッチングポイント】
この求人がなぜこの求職者にとって「運命」と言えるのか、経歴・スキル・価値観と求人内容を結びつけ、最も説得力のある理由を3つ挙げてください。強調すべき単語やフレーズは**アスタリスク2つで囲んでください**。

### 【心を掴むアトラクト・オープニング】
面談でこの求人を切り出すための、最も効果的で相手の心を一瞬で掴む冒頭のセリフを創作してください。強調すべき単語やフレーズは**アスタリスク2つで囲んでください**。

### 【響く！魅力づけトーク＆キーワード】
求職者の経歴や発言に合わせ、「私のことを理解してくれている」と感じさせる魅力的なトーク例を3〜5つ作成してください。強調すべき単語やフレーズは**アスタリスク2つで囲んでください**。

### 【興味を深掘りする魔法の質問】
求職者自身にこの求人とのフィット感を実感させ、当事者意識を持たせるためのオープンクエスチョンを3つ作成してください。強調すべき単語やフレーズは**アスタリスク2つで囲んでください**。

### 【応募意思を引き出すクロージング・ステップ】
求職者の心が動いた後、自然な流れで応募意思を確認し、次のアクションへ繋げる会話の流れを具体的に設計してください。強調すべき単語やフレーズは**アスタリスク2つで囲んでください**。

---

# 分析対象データ

## 求職者の情報
\`\`\`
{{jobSeekerInfo}}
\`\`\`

## 提案する求人情報
\`\`\`
{{jobOfferInfo}}
\`\`\`
`;


export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
     return new Response('APIキーが設定されていません。', { status: 500 });
  }
  
  try {
    const { jobSeekerInfo, jobOfferInfo } = await req.json();

    if (!jobSeekerInfo || !jobOfferInfo) {
      return new Response('求職者情報または求人情報が不足しています。', { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = PROMPT_TEMPLATE
      .replace('{{jobSeekerInfo}}', jobSeekerInfo)
      .replace('{{jobOfferInfo}}', jobOfferInfo);

    const streamResult = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: prompt,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of streamResult) {
          if (chunk.text) {
             controller.enqueue(encoder.encode(chunk.text));
          }
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: { 
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error) {
    console.error('Error in API route:', error);
    const errorMessage = error instanceof Error ? error.message : '不明なサーバーエラーが発生しました。';
    return new Response(errorMessage, { status: 500 });
  }
}
