import * as SQLite from 'expo-sqlite';
import { seedDatabase } from './seed';

const db = SQLite.openDatabaseSync('espeak.db');

// Run synchronously at module load — before any screen queries the DB
initDatabase();

export type Word = {
  id: number;
  word: string;
  part_of_speech: string;
  definition: string;
  example_email: string;
  example_interview: string;
  example_slack: string;
  date_assigned: string;
  is_saved: number;
};

export type Drill = {
  id: number;
  taglish: string;
  professional: string;
  tip: string;
  is_completed: number;
};

export type Phrase = {
  id: number;
  phrase: string;
  example: string;
  category: string;
  is_saved: number;
};

export type Progress = {
  id: number;
  streak: number;
  last_opened_date: string;
  initialized: number;
};

export function initDatabase(): void {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL,
      part_of_speech TEXT NOT NULL,
      definition TEXT NOT NULL,
      example_email TEXT NOT NULL,
      example_interview TEXT NOT NULL,
      example_slack TEXT NOT NULL,
      date_assigned TEXT NOT NULL,
      is_saved INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS drills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      taglish TEXT NOT NULL,
      professional TEXT NOT NULL,
      tip TEXT NOT NULL,
      is_completed INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS phrases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phrase TEXT NOT NULL,
      example TEXT NOT NULL,
      category TEXT NOT NULL,
      is_saved INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY CHECK(id=1),
      streak INTEGER DEFAULT 0,
      last_opened_date TEXT DEFAULT '',
      initialized INTEGER DEFAULT 0
    );
  `);

  const row = db.getFirstSync<Progress>('SELECT * FROM progress WHERE id = 1');
  if (!row) {
    db.runSync("INSERT INTO progress (id, streak, last_opened_date, initialized) VALUES (1, 0, '', 0)");
  }

  const progress = db.getFirstSync<Progress>('SELECT * FROM progress WHERE id = 1');
  if (progress && !progress.initialized) {
    seedDatabase(db);
    db.runSync('UPDATE progress SET initialized = 1 WHERE id = 1');
  }
}

export function getWordOfTheDay(): Word | null {
  const today = new Date().toISOString().split('T')[0];
  let word = db.getFirstSync<Word>('SELECT * FROM words WHERE date_assigned = ?', today);
  if (!word) {
    const allWords = db.getAllSync<Word>('SELECT * FROM words ORDER BY id ASC');
    if (!allWords.length) return null;
    const dayOfYear = getDayOfYear(new Date());
    word = allWords[dayOfYear % allWords.length];
  }
  return word ?? null;
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function toggleSaveWord(id: number, value: boolean): void {
  db.runSync('UPDATE words SET is_saved = ? WHERE id = ?', value ? 1 : 0, id);
}

export function getIncompleteDrills(): Drill[] {
  return db.getAllSync<Drill>('SELECT * FROM drills WHERE is_completed = 0 ORDER BY id ASC');
}

export function getCompletedCount(): number {
  const row = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM drills WHERE is_completed = 1');
  return row?.count ?? 0;
}

export function completeDrill(id: number): void {
  db.runSync('UPDATE drills SET is_completed = 1 WHERE id = ?', id);
}

export function resetDrills(): void {
  db.runSync('UPDATE drills SET is_completed = 0');
}

export function getPhrasesByCategory(category: string): Phrase[] {
  return db.getAllSync<Phrase>('SELECT * FROM phrases WHERE category = ? ORDER BY id ASC', category);
}

export function toggleSavePhrase(id: number, value: boolean): void {
  db.runSync('UPDATE phrases SET is_saved = ? WHERE id = ?', value ? 1 : 0, id);
}

export function getSavedWords(): Word[] {
  return db.getAllSync<Word>('SELECT * FROM words WHERE is_saved = 1 ORDER BY word ASC');
}

export function getSavedPhrases(): Phrase[] {
  return db.getAllSync<Phrase>('SELECT * FROM phrases WHERE is_saved = 1 ORDER BY phrase ASC');
}

export function getOrInitProgress(): Progress {
  let row = db.getFirstSync<Progress>('SELECT * FROM progress WHERE id = 1');
  if (!row) {
    db.runSync("INSERT INTO progress (id, streak, last_opened_date, initialized) VALUES (1, 0, '', 0)");
    row = db.getFirstSync<Progress>('SELECT * FROM progress WHERE id = 1')!;
  }
  return row;
}

export function updateStreak(): void {
  const row = getOrInitProgress();
  const today = new Date().toISOString().split('T')[0];

  if (row.last_opened_date === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const newStreak = row.last_opened_date === yesterdayStr ? row.streak + 1 : 1;
  db.runSync('UPDATE progress SET streak = ?, last_opened_date = ? WHERE id = 1', newStreak, today);
}

export function getAllWords(): Word[] {
  return db.getAllSync<Word>('SELECT * FROM words ORDER BY date_assigned ASC');
}

// --- AI sync helpers ---

export function getWordCount(): number {
  return db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM words')?.count ?? 0;
}

export function getDrillCount(): number {
  return db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM drills')?.count ?? 0;
}

export function getPhraseCountByCategory(category: string): number {
  return (
    db.getFirstSync<{ count: number }>(
      'SELECT COUNT(*) as count FROM phrases WHERE category = ?',
      category
    )?.count ?? 0
  );
}

export function getWordNames(): string[] {
  return db.getAllSync<{ word: string }>('SELECT word FROM words').map((r) => r.word);
}

export function getExistingTaglish(): string[] {
  return db.getAllSync<{ taglish: string }>('SELECT taglish FROM drills').map((r) => r.taglish);
}

export function getNextWordDate(): string {
  const row = db.getFirstSync<{ max_date: string | null }>(
    'SELECT MAX(date_assigned) as max_date FROM words'
  );
  const base = row?.max_date ?? new Date().toISOString().split('T')[0];
  const next = new Date(base);
  next.setDate(next.getDate() + 1);
  return next.toISOString().split('T')[0];
}

export function insertWord(w: Omit<Word, 'id' | 'is_saved'>): void {
  db.runSync(
    `INSERT INTO words (word, part_of_speech, definition, example_email, example_interview, example_slack, date_assigned)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    w.word, w.part_of_speech, w.definition,
    w.example_email, w.example_interview, w.example_slack, w.date_assigned
  );
}

export function insertDrill(d: Omit<Drill, 'id' | 'is_completed'>): void {
  db.runSync(
    'INSERT INTO drills (taglish, professional, tip) VALUES (?, ?, ?)',
    d.taglish, d.professional, d.tip
  );
}

export function insertPhrase(p: Omit<Phrase, 'id' | 'is_saved'>): void {
  db.runSync(
    'INSERT INTO phrases (phrase, example, category) VALUES (?, ?, ?)',
    p.phrase, p.example, p.category
  );
}
