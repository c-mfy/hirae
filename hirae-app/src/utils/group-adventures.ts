import type { Adventure } from '@/types/adventure';
import { formatMonthLabel } from './format';

export type AdventureSection = {
  month: string;
  entries: Adventure[];
};

export function groupByMonth(adventures: Adventure[]): AdventureSection[] {
  // newest first
  const sorted = [...adventures].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );

  const sections: AdventureSection[] = [];

  for (const adventure of sorted) {
    const month = formatMonthLabel(adventure.startedAt);
    const last = sections[sections.length - 1];

    if (last && last.month === month) {
      last.entries.push(adventure);
    } else {
      sections.push({ month, entries: [adventure] });
    }
  }

  return sections;
}