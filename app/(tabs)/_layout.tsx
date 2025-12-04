import { Tabs } from 'expo-router';
import React from 'react';

import { MaterialIcons } from '@expo/vector-icons';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>

          {/* => ICON LOKASI */}
      <Tabs.Screen
        name="lokasi"
        options={{
          title: 'Events',
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={28} name="event" color={color} />
          ),
        }}
      />
          <Tabs.Screen
        name="mapweview"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="map" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.2.fill" color={color} />,
        }}
      />

    </Tabs>
  );
}
