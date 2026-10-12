import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { C, H, Card, Empty, s } from '../ui';
import { api } from '../api';

export default function Summary() {
  const [d, setD] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { api('/summary').then(setD).catch((e) => setErr(e.message)); }, []);
  if (err) return <Empty>{err}</Empty>;
  if (!d) return <Empty>Loading...</Empty>;
  const a = d.attendance;
  return (
    <ScrollView><H>{d.student.name}</H>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {[['present', C.green], ['late', C.gold], ['absent', C.red]].map(([k, col]) => (
          <Card key={k} style={{ flex: 1, marginHorizontal: 4, alignItems: 'center' }}>
            <Text style={{ fontSize: 26, fontWeight: '700', color: col }}>{a[k] || 0}</Text><Text style={s.mute}>{k}</Text>
          </Card>))}
      </View>
      <H>Grades</H>
      {d.grades.length === 0 && <Empty>No grades recorded yet.</Empty>}
      {d.grades.map((g, i) => <Card key={i}><View style={s.between}>
        <View><Text style={s.bold}>{g.subject}</Text><Text style={s.mute}>{g.term}</Text></View>
        <Text style={{ fontSize: 22, fontWeight: '700', color: g.score >= 50 ? C.green : C.red }}>{g.score}</Text></View></Card>)}
    </ScrollView>
  );
}
