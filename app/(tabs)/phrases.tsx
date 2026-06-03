import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getPhrasesByCategory, toggleSavePhrase, Phrase } from '../../db/database';
import { Colors, Radius, Spacing } from '../../constants/theme';

const CATEGORIES = [
  'Opening Emails',
  'Disagreeing',
  'Presenting',
  'Negotiating',
  'Small Talk',
];

export default function PhrasesScreen() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhrase, setSelectedPhrase] = useState<Phrase | null>(null);

  // useNativeDriver: false for slideAnim because we also drive it
  // directly via setValue() during the drag — mixing setValue with
  // a native-driver animation silently breaks the gesture tracking.
  const slideAnim = useRef(new Animated.Value(400)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dragStartY = useRef(0);

  // Phrase detail modal animations
  const detailFade = useRef(new Animated.Value(0)).current;
  const detailScale = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    setPhrases(getPhrasesByCategory(activeCategory));
  }, [activeCategory]);

  function openModal() {
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, bounciness: 0, speed: 16, useNativeDriver: false }),
    ]).start();
  }

  function closeModal() {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 400, duration: 220, useNativeDriver: false }),
    ]).start(() => setModalVisible(false));
  }

  function selectCategory(cat: string) {
    setActiveCategory(cat);
    closeModal();
  }

  function openDetail(phrase: Phrase) {
    setSelectedPhrase(phrase);
    detailFade.setValue(0);
    detailScale.setValue(0.88);
    Animated.parallel([
      Animated.timing(detailFade, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(detailScale, { toValue: 1, bounciness: 4, speed: 18, useNativeDriver: true }),
    ]).start();
  }

  function closeDetail() {
    Animated.parallel([
      Animated.timing(detailFade, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(detailScale, { toValue: 0.88, duration: 160, useNativeDriver: true }),
    ]).start(() => setSelectedPhrase(null));
  }

  function handleBookmark(phrase: Phrase) {
    const next = !phrase.is_saved;
    toggleSavePhrase(phrase.id, next);
    setPhrases((prev) =>
      prev.map((p) => (p.id === phrase.id ? { ...p, is_saved: next ? 1 : 0 } : p))
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Phrase Bank</Text>
        <TouchableOpacity style={styles.filterButton} onPress={openModal} activeOpacity={0.7}>
          <Text style={styles.filterButtonText}>{activeCategory}</Text>
          <Ionicons name="chevron-down" size={14} color={Colors.primary} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>

      {/* Phrase Cards */}
      <FlatList
        data={phrases}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => openDetail(item)} activeOpacity={0.75}>
            <View style={styles.cardTop}>
              <Text style={styles.phraseText}>{item.phrase}</Text>
              <TouchableOpacity onPress={() => handleBookmark(item)} hitSlop={8}>
                <Ionicons
                  name={item.is_saved ? 'bookmark' : 'bookmark-outline'}
                  size={20}
                  color={item.is_saved ? Colors.accent : Colors.muted}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.exampleText}>{item.example}</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      {/* Phrase Detail — centered modal */}
      <Modal visible={!!selectedPhrase} transparent animationType="none" onRequestClose={closeDetail}>
        <Animated.View style={[styles.detailOverlay, { opacity: detailFade }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeDetail} />
          <Animated.View style={[styles.detailCard, { transform: [{ scale: detailScale }] }]}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailCategory}>{selectedPhrase?.category?.toUpperCase()}</Text>
              <TouchableOpacity onPress={closeDetail} hitSlop={12}>
                <Ionicons name="close" size={20} color={Colors.muted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.detailPhrase}>{selectedPhrase?.phrase}</Text>
            <View style={styles.detailDivider} />
            <Text style={styles.detailLabel}>EXAMPLE</Text>
            <Text style={styles.detailExample}>{selectedPhrase?.example}</Text>

            {selectedPhrase && (
              <TouchableOpacity
                style={[
                  styles.detailBookmarkBtn,
                  selectedPhrase.is_saved ? styles.detailBookmarkBtnSaved : null,
                ]}
                onPress={() => {
                  handleBookmark(selectedPhrase);
                  setSelectedPhrase((p) =>
                    p ? { ...p, is_saved: p.is_saved ? 0 : 1 } : null
                  );
                }}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={selectedPhrase.is_saved ? 'bookmark' : 'bookmark-outline'}
                  size={16}
                  color={selectedPhrase.is_saved ? '#FFFFFF' : Colors.primary}
                  style={{ marginRight: 6 }}
                />
                <Text style={[
                  styles.detailBookmarkText,
                  selectedPhrase.is_saved ? { color: '#FFFFFF' } : null,
                ]}>
                  {selectedPhrase.is_saved ? 'Saved' : 'Save Phrase'}
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Bottom Sheet Modal */}
      <Modal visible={modalVisible} transparent animationType="none" onRequestClose={closeModal}>
        {/*
          Single flex container — fade applies to everything.
          TouchableOpacity takes flex:1 (space ABOVE the sheet only).
          Sheet sits below it, so the overlay never overlaps it.
        */}
        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeModal} />

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
                const vy = (e.nativeEvent as any).velocity?.y ?? 0;
                if (dy > 80 || vy > 0.5) {
                  closeModal();
                } else {
                  Animated.spring(slideAnim, { toValue: 0, bounciness: 4, useNativeDriver: false }).start();
                }
              }}
            >
              <View style={styles.handle} />
            </View>

            <Text style={styles.sheetTitle}>Select Category</Text>

            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.sheetOption, isActive && styles.sheetOptionActive]}
                  onPress={() => selectCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.sheetOptionText, isActive && styles.sheetOptionTextActive]}>
                    {cat}
                  </Text>
                  {isActive && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
                </TouchableOpacity>
              );
            })}

            <View style={styles.sheetBottom} />
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.horizontal,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    maxWidth: 160,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    flexShrink: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.horizontal,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  phraseText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 24,
  },
  exampleText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: Colors.muted,
    lineHeight: 20,
  },

  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 0,
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
    fontSize: 13,
    fontWeight: '600',
    color: Colors.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sheetOptionActive: {
    // no background fill — checkmark + bold text indicate selection
  },
  sheetOptionText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  sheetOptionTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  sheetBottom: {
    height: 24,
  },

  // Phrase detail modal
  detailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  detailCard: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.muted,
    letterSpacing: 1,
  },
  detailPhrase: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    lineHeight: 30,
    marginBottom: 16,
  },
  detailDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.muted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  detailExample: {
    fontSize: 15,
    fontStyle: 'italic',
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 24,
  },
  detailBookmarkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
  },
  detailBookmarkBtnSaved: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  detailBookmarkText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
});
