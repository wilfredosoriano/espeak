import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { updateStreak } from '../db/database';
import { syncContent } from '../db/aiSync';
import {
  setupNotificationHandler,
  scheduleWordNotifications,
} from '../notifications/wordNotifications';

SplashScreen.preventAutoHideAsync();

// Set up notification handling before any notification can arrive
setupNotificationHandler();

export default function RootLayout() {
  useEffect(() => {
    updateStreak();
    SplashScreen.hideAsync();

    // Runs silently in background — does not block app startup
    (async () => {
      await syncContent().catch(() => {});
      // Reschedule after sync so new AI words get notifications too
      await scheduleWordNotifications().catch(() => {});
    })();
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="dark" />
    </>
  );
}
