import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import {
  getWordOfTheDay,
  getOrInitProgress,
  toggleSaveWord,
  Word,
  Progress,
} from '../../db/database';
import { Colors, Radius, Spacing } from '../../constants/theme';

// Update these once your Cloudflare project is live
const PRIVACY_URL = 'https://espeak.pages.dev/privacy/';
const TERMS_URL   = 'https://espeak.pages.dev/terms/';
const FEEDBACK_EMAIL = 'wil.soriano.jr@gmail.com';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

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
  const [settingsVisible, setSettingsVisible] = useState(false);

  const slideAnim = useRef(new Animated.Value(400)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const dragStartY = useRef(0);

  useEffect(() => {
    const w = getWordOfTheDay();
    const p = getOrInitProgress();
    setWord(w);
    setProgress(p);
    setIsSaved(!!w?.is_saved);
  }, []);

  function openSettings() {
    setSettingsVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, bounciness: 0, speed: 16, useNativeDriver: false }),
    ]).start();
  }

  function closeSettings() {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 400, duration: 220, useNativeDriver: false }),
    ]).start(() => setSettingsVisible(false));
  }

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
          <View style={styles.headerRight}>
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {progress?.streak ?? 0} day streak</Text>
            </View>
            <TouchableOpacity onPress={openSettings} hitSlop={8} style={styles.settingsBtn}>
              <Ionicons name="settings-outline" size={22} color={Colors.primary} />
            </TouchableOpacity>
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

      {/* Settings bottom sheet */}
      <Modal visible={settingsVisible} transparent animationType="none" onRequestClose={closeSettings}>
        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeSettings} />

          <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
            {/* Drag handle */}
            <View
              style={styles.handleArea}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={(e) => { dragStartY.current = e.nativeEvent.pageY; }}
              onResponderMove={(e) => {
                const dy = e.nativeEvent.pageY - dragStartY.current;
                if (dy > 0) slideAnim.setValue(dy);
              }}
              onResponderRelease={(e) => {
                const dy = e.nativeEvent.pageY - dragStartY.current;
                if (dy > 80) { closeSettings(); }
                else { Animated.spring(slideAnim, { toValue: 0, bounciness: 4, useNativeDriver: false }).start(); }
              }}
            >
              <View style={styles.handle} />
            </View>

            <Text style={styles.sheetTitle}>Settings</Text>

            {/* App Version */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
                <Text style={styles.rowLabel}>App Version</Text>
              </View>
              <Text style={styles.rowValue}>v{APP_VERSION}</Text>
            </View>
            <View style={styles.separator} />

            {/* Privacy Policy */}
            <TouchableOpacity
              style={styles.row}
              onPress={() => Linking.openURL(PRIVACY_URL)}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
                <Text style={styles.rowLabel}>Privacy Policy</Text>
              </View>
              <Ionicons name="open-outline" size={16} color={Colors.muted} />
            </TouchableOpacity>
            <View style={styles.separator} />

            {/* Terms of Service */}
            <TouchableOpacity
              style={styles.row}
              onPress={() => Linking.openURL(TERMS_URL)}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
                <Text style={styles.rowLabel}>Terms of Service</Text>
              </View>
              <Ionicons name="open-outline" size={16} color={Colors.muted} />
            </TouchableOpacity>
            <View style={styles.separator} />

            {/* Send Feedback */}
            <TouchableOpacity
              style={styles.row}
              onPress={() => Linking.openURL(
                `mailto:${FEEDBACK_EMAIL}?subject=ESpeak Feedback&body=App version: ${APP_VERSION}%0A%0A`
              )}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <Ionicons name="mail-outline" size={20} color={Colors.primary} />
                <Text style={styles.rowLabel}>Send Feedback</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.muted} />
            </TouchableOpacity>

            <View style={styles.sheetFooter}>
              <Text style={styles.footerText}>Made with ❤️ for Filipino professionals</Text>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
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
    paddingBottom: 110,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  settingsBtn: {
    padding: 2,
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

  // Settings sheet
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.horizontal,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  handleArea: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
  },
  rowValue: {
    fontSize: 14,
    color: Colors.muted,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
  },
  sheetFooter: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.muted,
  },
});
