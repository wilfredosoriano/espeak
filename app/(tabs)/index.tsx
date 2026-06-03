import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getWordOfTheDay,
  getOrInitProgress,
  toggleSaveWord,
  Word,
  Progress,
} from '../../db/database';
import { Colors, Radius, Spacing } from '../../constants/theme';

type ExampleTab = 'email' | 'interview' | 'slack';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const [word, setWord] = useState<Word | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [activeTab, setActiveTab] = useState<ExampleTab>('email');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const w = getWordOfTheDay();
    const p = getOrInitProgress();
    setWord(w);
    setProgress(p);
    setIsSaved(!!w?.is_saved);
  }, []);

  function handleSave() {
    if (!word) return;
    const next = !isSaved;
    setIsSaved(next);
    toggleSaveWord(word.id, next);
  }

  function getExample(): string {
    if (!word) return '';
    if (activeTab === 'email') return word.example_email;
    if (activeTab === 'interview') return word.example_interview;
    return word.example_slack;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>ESpeak</Text>
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 {progress?.streak ?? 0} day streak</Text>
          </View>
        </View>

        <Text style={styles.greeting}>{getGreeting()} 👋</Text>

        {/* Word of the Day Card */}
        {word && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>WORD OF THE DAY</Text>
            <Text style={styles.wordText}>{word.word}</Text>
            <Text style={styles.posText}>{word.part_of_speech}</Text>
            <View style={styles.divider} />
            <Text style={styles.definitionText}>{word.definition}</Text>

            {/* Pill Tabs */}
            <View style={styles.pillRow}>
              {(['email', 'interview', 'slack'] as ExampleTab[]).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.pill, activeTab === tab && styles.pillActive]}
                  onPress={() => setActiveTab(tab)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, activeTab === tab && styles.pillTextActive]}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.exampleText}>"{getExample()}"</Text>

            <TouchableOpacity
              style={[styles.saveButton, isSaved && styles.saveButtonSaved]}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>{isSaved ? 'Word Saved ✓' : 'Save Word'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingHorizontal: Spacing.horizontal,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
  logo: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  streakBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  streakText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
  },
  greeting: {
    fontSize: 15,
    color: Colors.muted,
    marginBottom: 20,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.muted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  wordText: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  posText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: Colors.muted,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 16,
  },
  definitionText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: 20,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  pill: {
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  pillActive: {
    backgroundColor: Colors.primary,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  exampleText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonSaved: {
    backgroundColor: '#374151',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
