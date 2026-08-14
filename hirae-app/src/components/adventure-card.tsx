import { View, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { Colors, Fonts, Radius } from '@/constants/theme';

type Props = {
  title: string;
  distance: string;
  date: string;
  percent: string;
  onPress?: () => void;
};

export default function AdventureCard({ title, distance, date, percent, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.thumb} />

      <View style={styles.body}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.meta}>
          {distance} · {date}
        </ThemedText>
      </View>

      <View style={styles.percentRow}>
        <ThemedText style={styles.percent}>+ {percent}</ThemedText>
        <ThemedText style={styles.percentUnit}>%</ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surfaceTranslucent,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: Fonts.semibold,
    fontSize: 16,
  },
  meta: {
    fontFamily: Fonts.regular,
    fontSize: 12,
  },
  percentRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 1,
  },
  percent: {
    fontFamily: Fonts.medium,
    fontSize: 15,
  },
  percentUnit: {
    fontFamily: Fonts.medium,
    fontSize: 11,
  },
});