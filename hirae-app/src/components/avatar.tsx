import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

type Props = {
  size?: number;
};

export default function Avatar({ size = 48 }: Props) {
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: Colors.secondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});