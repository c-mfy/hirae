import { ScrollView, View, StyleSheet, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, ScreenPadding } from '@/constants/theme';

type Props = ViewProps & {
  scroll?: boolean;
};

export default function ScreenContainer({ children, scroll = true, style, ...rest }: Props) {
  const Inner = scroll ? ScrollView : View;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Inner
        style={styles.flex}
        contentContainerStyle={scroll ? styles.content : undefined}
        showsVerticalScrollIndicator={false}
        {...rest}>
        {children}
      </Inner>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: ScreenPadding,
    paddingBottom: 24,
    gap: 20,
  },
});