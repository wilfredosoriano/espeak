import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, color }: { name: IconName; color: string | import('react-native').ColorValue }) {
  return <Ionicons name={name} size={22} color={color as string} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.muted,
        tabBarStyle: { borderTopColor: '#E5E7EB', backgroundColor: Colors.background },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="drills"
        options={{
          title: 'Drills',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'pencil' : 'pencil-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="phrases"
        options={{
          title: 'Phrases',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'chatbubble' : 'chatbubble-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'bookmark' : 'bookmark-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
