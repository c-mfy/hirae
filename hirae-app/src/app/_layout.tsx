import { Stack, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { Gaegu_400Regular, Gaegu_700Bold } from '@expo-google-fonts/gaegu';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { TrackingProvider } from '@/context/tracking-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Gaegu_400Regular,
    Gaegu_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={DefaultTheme}>
      <AnimatedSplashOverlay />
      <TrackingProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </TrackingProvider>
    </ThemeProvider>
  );
}