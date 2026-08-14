import { View, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { Colors, Fonts, Radius } from '@/constants/theme';

type Props = {
  value: string;
  unit?: string;
  label: string;
};

export default function StatCard({ value, unit, label }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.valueRow}>
        <ThemedText style={styles.value}>{value}</ThemedText>
        {unit && <ThemedText style={styles.unit}>{unit}</ThemedText>}
      </View>
      <ThemedText style={styles.label}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surfaceTranslucent,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 1,
  },
  value: {
    fontFamily: Fonts.semibold,
    fontSize: 26,
  },
  unit: {
    fontFamily: Fonts.medium,
    fontSize: 14,
  },
  label: {
    fontFamily: Fonts.regular,
    fontSize: 14,
  },
});