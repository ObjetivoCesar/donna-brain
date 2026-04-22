import { useColorScheme } from 'react-native';

import { Colors } from '../constants/theme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const { colorScheme } = useColorScheme();
  const colorFromProps = props[colorScheme ?? 'light'];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[colorScheme ?? 'light'][colorName];
  }
}