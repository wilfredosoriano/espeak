import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { getSavedWords, getSavedPhrases, Word, Phrase } from '../../db/database';
import { Colors, Spacing } from '../../constants/theme';

type SavedTab = 'words' | 'phrases';

export default function SavedScreen() {
  const [activeTab, setActiveTab] = useState<SavedTab>('words');
  const [savedWords, setSavedWords] = useState<Word[]>([]);
  const [savedPhrases, setSavedPhrases] = useState<Phrase[]>([]);

  useFocusEffect(
    useCallback(() => {
      setSavedWords(getSavedWords());
      setSavedPhrases(getSavedPhrases());
    }, [])
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerBlock}>
        <Text style={styles.title}>Saved</Text>
      </View>

      {/* Underline Tabs */}
      <View style={styles.tabRow}>
        {(['words', 'phrases'] as SavedTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tabButton}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
            {activeTab === tab && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'words' ? (
        <FlatList
          data={savedWords}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState message={"No saved words yet.\nSave words from the Home screen."} />}
          renderItem={({ item }) => (
            <View style={styles.wordRow}>
              <View style={styles.wordRowLeft}>
                <Text style={styles.wordText}>{item.word}</Text>
                <Text style={styles.definitionText} numberOfLines={2}>{item.definition}</Text>
              </View>
              <View style={styles.dot} />
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <FlatList
          data={savedPhrases}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState message={"No saved phrases yet.\nBookmark phrases from the Phrases screen."} />}
          renderItem={({ item }) => (
            <View style={styles.phraseRow}>
              <Text style={styles.phraseText}>{item.phrase}</Text>
              <Text style={styles.phraseExample} numberOfLines={2}>{item.example}</Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.emptyState}>
      {message.split('\n').map((line, i) => (
        <Text key={i} style={styles.emptyText}>{line}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBlock: {
    paddingHorizontal: Spacing.horizontal,
    paddingTop: 16,
    paddingBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.horizontal,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabButton: {
    marginRight: 24,
    paddingVertical: 12,
    position: 'relative',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.muted,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primary,
    borderRadius: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.horizontal,
    paddingTop: 8,
    paddingBottom: 32,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  wordRowLeft: {
    flex: 1,
    marginRight: 12,
  },
  wordText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  definitionText: {
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 18,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
  },
  phraseRow: {
    paddingVertical: 14,
  },
  phraseText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  phraseExample: {
    fontSize: 13,
    color: Colors.muted,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  emptyState: {
    paddingTop: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
