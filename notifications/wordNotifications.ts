import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getAllWords } from '../db/database';

const CHANNEL_ID = 'word-of-day';

// Must be called before any notification is received (call at app module level)
export function setupNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Word of the Day',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 200, 0, 200],
    });
  }

  const { status: current } = await Notifications.getPermissionsAsync();
  if (current === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleWordNotifications(): Promise<void> {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return;

  // Cancel any previously scheduled word-of-day notifications
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of existing) {
    if (n.content.data?.type === 'word_of_day') {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  const words = getAllWords();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  for (const word of words) {
    // Only schedule future words
    if (!word.date_assigned || word.date_assigned <= todayStr) continue;

    const [y, m, d] = word.date_assigned.split('-').map(Number);
    const fireAt = new Date(y, m - 1, d, 8, 0, 0); // 8:00 AM on that day
    if (fireAt <= now) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Word of the Day: ${word.word}`,
        body: word.definition,
        data: { type: 'word_of_day' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireAt,
        channelId: CHANNEL_ID,
      },
    });
  }
}
