// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the Icons Directory.
 * - see SF Symbols in the SF Symbols app.
 */
const MAPPING = {
  'house.fill': 'maps-home-work',
  'paperplane.fill': 'explore',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'add.circle.fill': 'add',
  'person.2.fill': 'people',
  'person.2fill': 'people',       // Fix untuk Profile
  'map.fill': 'map',
  'map': 'map',                   // Alternative
  'location.fill': 'location-on',
  'globe': 'public',      // icon MAP WEB VIEW
  'event.list': 'event',
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
