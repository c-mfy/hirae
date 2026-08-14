import { useEffect, useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenContainer from '@/components/screen-container';
import StatCard from '@/components/stat-card';
import { ThemedText } from '@/components/themed-text';
import { getAdventureById, updateAdventure } from '@/data/adventures';
import type { Adventure } from '@/types/adventure';
import { formatDistance, formatLongDate, formatTime, formatDuration } from '@/utils/format';
import { Colors, Fonts, Radius } from '@/constants/theme';

const TITLE_MAX = 35;
const NOTE_MAX = 150;

export default function AdventureDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [adventure, setAdventure] = useState<Adventure | null>(null);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    getAdventureById(id).then((a) => {
      if (!a) return;
      setAdventure(a);
      setTitle(a.title);
      setNote(a.note ?? '');
    });
  }, [id]);

  const handleDone = async () => {
    await updateAdventure(id, { title, note: note || null });
    router.back();
  };

  if (!adventure) {
    return (
      <ScreenContainer>
        <ActivityIndicator style={{ marginTop: 60 }} color={Colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.topRow}>
        <Pressable onPress={handleDone} hitSlop={12}>
          <ThemedText style={styles.done}>Done</ThemedText>
        </Pressable>
      </View>

      <View style={styles.titleBlock}>
        <View style={styles.titleRow}>
          <TextInput
            value={title}
            onChangeText={(t) => t.length <= TITLE_MAX && setTitle(t)}
            style={styles.titleInput}
            placeholder="Untitled adventure"
            placeholderTextColor={Colors.secondary}
          />
          <ThemedText style={styles.counter}>
            {title.length}/{TITLE_MAX}
          </ThemedText>
        </View>
        <View style={styles.titleUnderline} />
      </View>

      <ThemedText style={styles.meta}>
        <ThemedText style={styles.metaBold}>Date: </ThemedText>
        {formatLongDate(adventure.startedAt)}
        <ThemedText style={styles.metaBold}> · Time: </ThemedText>
        {formatTime(adventure.startedAt)}
      </ThemedText>

      <View style={styles.mapPlaceholder} />

      <View style={styles.statGrid}>
        <View style={styles.statRow}>
          <StatCard value={`+ ${adventure.percentRevealed}`} unit="%" label="explored" />
          <StatCard value={String(adventure.landmarkCount)} label="landmarks" />
        </View>
        <View style={styles.statRow}>
          <StatCard value={formatDistance(adventure.distanceMeters)} label="traveled" />
          <StatCard value={formatDuration(adventure.durationMinutes)} label="elapsed" />
        </View>
      </View>

      <View style={styles.noteSection}>
        <ThemedText style={styles.noteLabel}>NOTE</ThemedText>
        <View style={styles.noteDivider} />
        <View style={styles.noteBox}>
          <TextInput
            value={note}
            onChangeText={(t) => t.length <= NOTE_MAX && setNote(t)}
            style={styles.noteInput}
            multiline
            placeholder="Add a note about this adventure…"
            placeholderTextColor={Colors.secondary}
          />
          <ThemedText style={styles.noteCounter}>
            {note.length}/{NOTE_MAX}
          </ThemedText>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topRow: { alignItems: 'flex-end', paddingTop: 20 },
  done: { fontFamily: Fonts.semibold, fontSize: 16 },
  titleBlock: { gap: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  titleInput: {
    flex: 1,
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: Colors.text,
    padding: 0,
  },
  counter: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.secondary },
  titleUnderline: { height: 1, backgroundColor: Colors.border },
  meta: { fontFamily: Fonts.regular, fontSize: 13 },
  metaBold: { fontFamily: Fonts.semibold, fontSize: 13 },
  mapPlaceholder: {
    height: 200,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.secondary,
  },
  statGrid: { gap: 12 },
  statRow: { flexDirection: 'row', gap: 12 },
  noteSection: { gap: 8 },
  noteLabel: { fontFamily: Fonts.handBold, fontSize: 14, letterSpacing: 1 },
  noteDivider: { height: 1, backgroundColor: Colors.border },
  noteBox: {
    backgroundColor: Colors.surfaceTranslucent,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    minHeight: 130,
  },
  noteInput: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.text,
    textAlignVertical: 'top',
    padding: 0,
  },
  noteCounter: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: Colors.secondary,
    textAlign: 'right',
    marginTop: 8,
  },
});