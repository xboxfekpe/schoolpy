import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export const C = { ink: '#1F2A44', green: '#2F7D5B', paper: '#F6F7F9', line: '#DDE1E8', red: '#B3402F', mute: '#6B7385', gold: '#C98A00' };

export const H = ({ children }) => <Text style={s.h}>{children}</Text>;
export const Empty = ({ children }) => <Text style={s.empty}>{children}</Text>;
export const Card = ({ children, style }) => <View style={[s.card, style]}>{children}</View>;
export const Field = (p) => <TextInput placeholderTextColor={C.mute} autoCapitalize="none" style={s.input} {...p} />;
export const Btn = ({ title, onPress }) => (
  <TouchableOpacity onPress={onPress} style={s.btn} activeOpacity={0.8}><Text style={s.btnT}>{title}</Text></TouchableOpacity>
);
export const Chips = ({ options, value, onChange }) => (
  <View style={s.row}>
    {options.map((o) => (
      <TouchableOpacity key={o.id} onPress={() => onChange(o.id)} style={[s.chip, value === o.id && s.chipOn]}>
        <Text style={[s.chipT, value === o.id && { color: '#fff' }]}>{o.label}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

export const s = StyleSheet.create({
  h: { fontSize: 22, fontWeight: '700', color: C.ink, marginVertical: 12 },
  empty: { color: C.mute, paddingVertical: 12 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.line },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 10, color: C.ink },
  btn: { backgroundColor: C.green, borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 12 },
  btnT: { color: '#fff', fontWeight: '700', fontSize: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  chip: { borderWidth: 1, borderColor: C.line, backgroundColor: '#fff', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, marginRight: 8, marginBottom: 8 },
  chipOn: { backgroundColor: C.ink, borderColor: C.ink },
  chipT: { color: C.ink },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bold: { fontWeight: '600', color: C.ink, fontSize: 16 },
  mute: { color: C.mute },
});
