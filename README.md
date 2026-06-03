# ESpeak — Advanced English for Career-Driven Filipinos

A mobile app that helps Filipino professionals improve their business English through daily vocabulary, sentence drills, and a professional phrase bank. Offline-first, no account required.

---

## Features

- **Word of the Day** — daily vocabulary with context examples for email, interview, and Slack
- **Sentence Drills** — Taglish-to-professional-English rewrites with tips
- **Phrase Bank** — categorized professional phrases (Opening Emails, Disagreeing, Presenting, Negotiating, Small Talk)
- **Saved** — bookmark words and phrases for quick review
- **Streak tracking** — daily streak to keep you consistent
- **AI content sync** — automatically generates new words, drills, and phrases in the background using Groq

---

## Tech Stack

- [Expo](https://expo.dev) SDK 56 (React Native)
- TypeScript
- `expo-router` — file-based navigation
- `expo-sqlite` — local offline storage
- `expo-notifications` — daily Word of the Day push notifications
- Groq API (`llama-3.3-70b-versatile`) — AI content generation

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo Go app on your phone, or an iOS/Android simulator

### Install

```bash
git clone https://github.com/YOUR_USERNAME/ESpeak.git
cd ESpeak
npm install
```

### Environment

Create a `.env` file in the root:

```
EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key_here
```

Get a free API key at [console.groq.com](https://console.groq.com).

### Run

```bash
npx expo start
```

Scan the QR code with Expo Go, or press `i` for iOS simulator / `a` for Android.

---

## Project Structure

```
app/
  _layout.tsx          # Root layout — DB init, streak, AI sync, notifications
  (tabs)/
    index.tsx          # Home — Word of the Day
    drills.tsx         # Sentence Drills
    phrases.tsx        # Phrase Bank
    saved.tsx          # Saved words & phrases
constants/
  theme.ts             # Design tokens (colors, spacing, radius)
db/
  database.ts          # SQLite operations
  seed.ts              # Initial seed data (10 words, 10 drills, 15 phrases)
  aiSync.ts            # Groq AI content generation
notifications/
  wordNotifications.ts # Daily Word of the Day push notifications
```

---

## Build

### Android (EAS Cloud Build)

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile production
```

### Android (Local)

```bash
npx expo run:android --variant release
```

---

## License

MIT
