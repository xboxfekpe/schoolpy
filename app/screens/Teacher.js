import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, Alert, View } from 'react-native';
import { C, H, Card, Field, Btn, Chips, Empty, s } from '../ui';
import { api } from '../api';

function useClass() {
  const [classes, setClasses] = useState([]); const [cid, setCid] = useState(null); const [students, setStudents] = useState([]);
  useEffect(() => { api('/classes').then((c) => { setClasses(c); if (c[0]) setCid(c[0].id); }).catch((e) => Alert.alert('Error', e.message)); }, []);
  useEffect(() => { if (cid) api(`/classes/${cid}/students`).then(setStudents).catch(() => {}); }, [cid]);
  const picker = <Chips value={cid} onChange={setCid} options={classes.map((c) => ({ id: c.id, label: c.name }))} />;
  return { picker, students, classes };
}

const NEXT = { present: 'absent', absent: 'late', late: 'present' };
const COLOR = { present: C.green, absent: C.red, late: C.gold };

export function Attendance() {
  const { picker, students, classes } = useClass(); const [marks, setMarks] = useState({});
  const save = async () => {
    try {
      await api('/attendance', 'POST', { date: new Date().toISOString().slice(0, 10),
        marks: students.map((st) => ({ student_id: st.id, status: marks[st.id] || 'present' })) });
      Alert.alert('Saved', "Today's attendance is saved.");
    } catch (e) { Alert.alert('Could not save', e.message); }
  };
  return (
    <ScrollView><H>Today's attendance</H>{picker}
      {classes.length === 0 && <Empty>No class is assigned to you yet. Ask the admin.</Empty>}
      {students.length > 0 && <Text style={s.mute}>Tap a name to switch present, absent or late.</Text>}
      {students.map((st) => { const v = marks[st.id] || 'present';
        return (
          <TouchableOpacity key={st.id} onPress={() => setMarks({ ...marks, [st.id]: NEXT[v] })}>
            <Card style={{ borderLeftWidth: 5, borderLeftColor: COLOR[v] }}>
              <View style={s.between}><Text style={s.bold}>{st.name}</Text><Text style={{ color: COLOR[v], fontWeight: '700' }}>{v}</Text></View>
            </Card></TouchableOpacity>); })}
      {students.length > 0 && <Btn title="Save attendance" onPress={save} />}
    </ScrollView>
  );
}

export function Grades() {
  const { picker, students } = useClass();
  const [f, setF] = useState({ subject: '', score: '', term: 'Term 1' });
  const save = async () => {
    try { await api('/grades', 'POST', { ...f, score: parseFloat(f.score) });
      Alert.alert('Saved', 'Grade recorded.'); setF({ ...f, score: '' }); }
    catch (e) { Alert.alert('Could not save', e.message); }
  };
  return (
    <ScrollView><H>Record a grade</H>{picker}
      <Text style={s.mute}>Student</Text>
      <Chips value={f.student_id} onChange={(v) => setF({ ...f, student_id: v })} options={students.map((st) => ({ id: st.id, label: st.name }))} />
      <Field placeholder="Subject" value={f.subject} onChangeText={(v) => setF({ ...f, subject: v })} />
      <Field placeholder="Score out of 100" value={f.score} onChangeText={(v) => setF({ ...f, score: v })} keyboardType="numeric" />
      <Chips value={f.term} onChange={(v) => setF({ ...f, term: v })} options={['Term 1', 'Term 2', 'Term 3'].map((t) => ({ id: t, label: t }))} />
      <Btn title="Save grade" onPress={save} />
    </ScrollView>
  );
}
