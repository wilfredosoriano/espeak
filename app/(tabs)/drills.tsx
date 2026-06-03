import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getIncompleteDrills,
  getCompletedCount,
  completeDrill,
  resetDrills,
  Drill,
} from '../../db/database';
import { Colors, Radius, Spacing } from '../../constants/theme';

const TOTAL = 10;

export default function DrillsScreen() {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);

  function loadDrills() {
    const incomplete = getIncompleteDrills();
    const count = getCompletedCount();
    setDrills(incomplete);
    setCompletedCount(count);
    setCurrentIndex(0);
    setRevealed(false);
    setSessionDone(incomplete.length === 0 && count >= TOTAL);
  }

  useEffect(() => {
    loadDrills();
  }, []);

  const current = drills[currentIndex] ?? null;
  const progressFraction = completedCount / TOTAL;

  function handleReveal() {
    setRevealed(true);
  }

  function handleNext() {
    if (!current) return;
    completeDrill(current.id);
    const newCount = completedCount + 1;
    setCompletedCount(newCount);

    const nextIndex = currentIndex + 1;
    if (nextIndex >= drills.length) {
      if (newCount >= TOTAL) {
        setSessionDone(true);
      } else {
        const remaining = getIncompleteDrills();
        setDrills(remaining);
        setCurrentIndex(0);
      }
    } else {
      setCurrentIndex(nextIndex);
    }
    setRevealed(false);
  }

  function handleReset() {
    resetDrills();
    loadDrills();
    setSessionDone(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerBlock}>
          <Text style={styles.title}>Sentence Drills</Text>
          <Text style={styles.subtitle}>Rewrite in professional English</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>{completedCount}/{TOTAL}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressFraction * 100}%` as any }]} />
        </View>

        {sessionDone ? (
          <View style={styles.card}>
            <Text style={styles.sessionTitle}>Session Complete! 🎉</Text>
            <Text style={styles.sessionSub}>
              You've completed all {TOTAL} drills. Great work!
            </Text>
            <TouchableOpacity style={styles.revealButton} onPress={handleReset} activeOpacity={0.8}>
              <Text style={styles.revealButtonText}>Start Over</Text>
            </TouchableOpacity>
          </View>
        ) : current ? (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>TAGLISH</Text>
            <Text style={styles.taglishText}>{current.taglish}</Text>

            {!revealed ? (
              <TouchableOpacity style={styles.revealButton} onPress={handleReveal} activeOpacity={0.8}>
                <Text style={styles.revealButtonText}>Reveal Answer</Text>
              </TouchableOpacity>
            ) : (
              <>
                <View style={styles.divider} />
                <Text style={styles.proLabel}>PROFESSIONAL</Text>
                <Text style={styles.professionalText}>{current.professional}</Text>
                <Text style={styles.tipText}>💡 {current.tip}</Text>
                <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
                  <Text style={styles.nextButtonText}>
                    {currentIndex + 1 >= drills.length && completedCount + 1 >= TOTAL
                      ? 'Finish'
                      : 'Next →'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : null}
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
  headerBlock: {
    marginTop: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.muted,
    marginTop: 2,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.accent,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
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
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.muted,
    letterSpacing: 1,
    marginBottom: 10,
  },
  taglishText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 28,
    marginBottom: 24,
  },
  revealButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  revealButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  proLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
    letterSpacing: 1,
    marginBottom: 10,
  },
  professionalText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 28,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 20,
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  sessionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  sessionSub: {
    fontSize: 15,
    color: Colors.muted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
});
