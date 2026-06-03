// Floating, expanding-pill tab bar — adapted for ESpeak.
// Active tab shows an accent pill (icon + label) with a smooth Reanimated glide.
// Uses SF Symbols on iOS, Ionicons on Android.

import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const TRANSITION = LinearTransition.duration(240);

interface TabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (event: any) => any;
    navigate: (name: string) => void;
  };
}

interface IconDef {
  sf: SymbolViewProps['name'];
  ion: keyof typeof Ionicons.glyphMap;
  label: string;
}

const TABS: Record<string, IconDef> = {
  index:   { sf: 'house.fill',       ion: 'home',        label: 'Home' },
  drills:  { sf: 'pencil',           ion: 'pencil',      label: 'Drills' },
  phrases: { sf: 'text.bubble.fill', ion: 'chatbubble',  label: 'Phrases' },
  saved:   { sf: 'bookmark.fill',    ion: 'bookmark',    label: 'Saved' },
};

function TabIcon({ name, color }: { name: string; color: string }) {
  const def = TABS[name];
  if (!def) return null;

  if (Platform.OS === 'ios') {
    return <SymbolView name={def.sf} size={22} tintColor={color} type="monochrome" />;
  }
  return <Ionicons name={def.ion} size={22} color={color} />;
}

function TabButton({
  name,
  label,
  focused,
  onPress,
}: {
  name: string;
  label: string;
  focused: boolean;
  onPress: () => void;
}) {
  const opacity = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(focused ? 1 : 0, { duration: 220 });
  }, [focused, opacity]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      accessibilityLabel={label}
      onPress={onPress}
      layout={TRANSITION}
      style={styles.tab}
    >
      <Animated.View style={[styles.pill, pillStyle]} />
      <TabIcon
        name={name}
        color={focused ? Colors.primary : Colors.muted}
      />
      {focused && (
        <Animated.Text
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(120)}
          style={styles.label}
          numberOfLines={1}
          maxFontSizeMultiplier={1.0}
        >
          {label}
        </Animated.Text>
      )}
    </AnimatedPressable>
  );
}

export default function FloatingTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.wrap, { bottom: Math.max(insets.bottom, 16) + 8 }]}
      pointerEvents="box-none"
    >
      <Animated.View style={styles.bar} layout={TRANSITION}>
        {state.routes.map((route, index) => {
          const def = TABS[route.name];
          if (!def) return null;
          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabButton
              key={route.key}
              name={route.name}
              label={def.label}
              focused={focused}
              onPress={onPress}
            />
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 40,
    overflow: 'hidden',
  },
  pill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(30, 58, 95, 0.08)',
    borderRadius: 40,
  },
  label: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
