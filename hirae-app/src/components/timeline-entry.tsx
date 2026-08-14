import { View, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { Colors, Fonts, Radius } from '@/constants/theme';

const DOT_SIZE = 34;
const ROW_GAP = 16;

type Props = {
  title: string;
  distance: string;
  date: string;
  percent: string;
  note?: string;
  hasLandmark?: boolean;
  isLast?: boolean;
  onPress?: () => void;
};

export default function TimelineEntry({
  title,
  distance,
  date,
  percent,
  note,
  hasLandmark = false,
  isLast = false,
  onPress,
}: Props) {
  return (
    <View style={[styles.row, !isLast && styles.rowSpacing]}>
      <View style={styles.gutter}>
        {!isLast && <View style={styles.line} />}
        <View
          style={[
            styles.dot,
            { backgroundColor: hasLandmark ? Colors.landmark : Colors.primary },
          ]}
        />
      </View>

      <Pressable style={styles.card} onPress={onPress}>
        <View style={styles.titleRow}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <View style={styles.percentRow}>
            <ThemedText style={styles.percent}>+ {percent}</ThemedText>
            <ThemedText style={styles.percentUnit}>%</ThemedText>
          </View>
        </View>

        <ThemedText style={styles.meta}>
          {distance} · {date}
        </ThemedText>

        {note && (
          <>
            <View style={styles.divider} />
            <ThemedText style={styles.note} numberOfLines={1}>
              {note}
            </ThemedText>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
  },
  rowSpacing: {
    marginBottom: ROW_GAP,
  },
  gutter: {
    width: DOT_SIZE,
    alignItems: 'center',
  },
  line: {
    position: 'absolute',
    top: 0,
    bottom: -ROW_GAP,
    width: 1.5,
    backgroundColor: Colors.line,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.surfaceTranslucent,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 8,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.semibold,
    fontSize: 16,
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
  meta: {
    fontFamily: Fonts.regular,
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: 10,
    marginBottom: 8,
  },
  note: {
    fontFamily: Fonts.regular,
    fontSize: 13,
  },
});