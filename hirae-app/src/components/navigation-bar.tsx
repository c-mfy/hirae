import { useRouter, usePathname } from 'expo-router';
import { View, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ThemedText } from './themed-text';
import { Colors, Spacing, Fonts, ScreenPadding } from '@/constants/theme';

export default function NavigationBar() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: 'home', label: 'Home', route: '/', icon: 'home' },
    { name: 'map', label: 'Map', route: '/map', icon: 'map' },
    { name: 'journal', label: 'Journal', route: '/journal', icon: 'notebook' },
    { name: 'profile', label: 'Profile', route: '/profile', icon: 'account' },
  ];

  const isActive = (route: string) => pathname === route;

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.name}
          onPress={() => router.replace(tab.route as any)}
          style={styles.tabButton}>
          <MaterialCommunityIcons
            name={tab.icon as any}
            size={24}
            color={isActive(tab.route) ? Colors.primary : Colors.secondary}
          />
          <ThemedText
            style={[
              styles.label,
              { color: isActive(tab.route) ? Colors.primary : Colors.secondary },
            ]}>
            {tab.label}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.secondary,
    paddingHorizontal: ScreenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 12,
  },
});