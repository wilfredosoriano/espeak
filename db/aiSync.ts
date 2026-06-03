import {
  getWordCount,
  getDrillCount,
  getPhraseCountByCategory,
  getWordNames,
  getExistingTaglish,
  getNextWordDate,
  insertWord,
  insertDrill,
  insertPhrase,
} from './database';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';
const API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '';

const WORD_TARGET = 50;
const DRILL_TARGET = 50;
const PHRASES_PER_CATEGORY = 10;
const MAX_PER_LAUNCH = 3;

const CATEGORIES = ['Opening Emails', 'Disagreeing', 'Presenting', 'Negotiating', 'Small Talk'];

async function groqJSON<T>(prompt: string): Promise<T | null> {
  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        response_format: { type: 'json_object' },
        max_tokens: 500,
        temperature: 0.9,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

async function syncWords(): Promise<void> {
  const count = getWordCount();
  if (count >= WORD_TARGET) return;

  const existing = getWordNames();
  const toGenerate = Math.min(MAX_PER_LAUNCH, WORD_TARGET - count);

  for (let i = 0; i < toGenerate; i++) {
    const result = await groqJSON<{
      word: string;
      part_of_speech: string;
      definition: string;
      example_email: string;
      example_interview: string;
      example_slack: string;
    }>(
      `You are generating vocabulary content for "ESpeak", an app that helps Filipino office workers improve their professional English.

Generate ONE professional English word useful in corporate/BPO/office settings in the Philippines.
Do NOT use any of these words: ${existing.join(', ')}.

Return ONLY valid JSON with these exact keys:
{
  "word": "single word",
  "part_of_speech": "noun/verb/adjective/etc",
  "definition": "one clear sentence definition",
  "example_email": "one sentence using the word in a professional email context",
  "example_interview": "one sentence using the word in a job interview context",
  "example_slack": "one casual-but-professional sentence using the word in Slack/chat"
}`
    );

    if (result?.word && !existing.includes(result.word)) {
      insertWord({ ...result, date_assigned: getNextWordDate() });
      existing.push(result.word);
    }
  }
}

async function syncDrills(): Promise<void> {
  const count = getDrillCount();
  if (count >= DRILL_TARGET) return;

  const existing = getExistingTaglish();
  const toGenerate = Math.min(MAX_PER_LAUNCH, DRILL_TARGET - count);

  for (let i = 0; i < toGenerate; i++) {
    const recent = existing.slice(-8).join(' | ');
    const result = await groqJSON<{
      taglish: string;
      professional: string;
      tip: string;
    }>(
      `You are generating drill content for "ESpeak", an app for Filipino office workers.

Generate ONE Taglish-to-Professional-English sentence drill.
Taglish = natural casual mix of Filipino (Tagalog) and English used in Philippine offices.

Do NOT use sentences similar to: ${recent}

Return ONLY valid JSON with these exact keys:
{
  "taglish": "a casual sentence a Filipino employee might actually say at work",
  "professional": "the polished, formal English version of the same message",
  "tip": "one sentence explaining the key improvement or vocabulary swap"
}`
    );

    if (result?.taglish && result?.professional && result?.tip) {
      insertDrill(result);
      existing.push(result.taglish);
    }
  }
}

async function syncPhrases(): Promise<void> {
  for (const category of CATEGORIES) {
    const count = getPhraseCountByCategory(category);
    if (count >= PHRASES_PER_CATEGORY) continue;

    const result = await groqJSON<{
      phrase: string;
      example: string;
    }>(
      `You are generating content for "ESpeak", an app for Filipino office workers improving professional English.

Generate ONE professional English phrase for the category: "${category}"

Return ONLY valid JSON with these exact keys:
{
  "phrase": "a concise, memorable professional phrase or expression",
  "example": "one full sentence showing how to use this phrase naturally in a real workplace situation"
}`
    );

    if (result?.phrase && result?.example) {
      insertPhrase({ phrase: result.phrase, example: result.example, category });
    }
  }
}

export async function syncContent(): Promise<void> {
  if (!API_KEY) return;
  await Promise.allSettled([syncWords(), syncDrills(), syncPhrases()]);
}
