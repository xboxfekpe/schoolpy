import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Alert } from 'react-native';
import { H, Card, Field, Btn, Chips, Empty, s } from '../ui';
import { api } from '../api';

const fail = (e) => Alert.alert('Something went wrong', e.message);

export function Overview() {
  const [d, setD] = useState({});
  useEffect(() => { api('/stats').then(setD).catch(fail); }, []);
  const items = [['students', 'Students'], ['teacher', 'Teachers'], ['parent', 'Parents'], ['classes', 'Classes']];
  return (
    <ScrollView><H>School at a glance</H>
      {items.map(([k, l]) => (
        <Card key={k}><View style={s.between}><Text style={s.bold}>{l}</Text>
          <Text style={{ fontSize: 24, fontWeight: '700' }}>{d[k === 'students' ? 'student' : k] ?? 0}</Text></View></Card>
      ))}
    </ScrollView>
  );
}

export function People() {
  const blank = { name: '', email: '', password: '', role: 'student' };
  const [list, setList] = useState([]); const [classes, setClasses] = useState([]); const [f, setF] = useState(blank);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const load = () => Promise.all([api('/users'), api('/classes')]).then(([u, c]) => { setList(u); setClasses(c); }).catch(fail);
  useEffect(() => { load(); }, []);
  const save = async () => {
    try { await api('/users', 'POST', f); setF(blank); load(); } catch (e) { Alert.alert('Could not add person', e.message); }
  };
  return (
    <ScrollView><H>Add a person</H>
      <Field placeholder="Full name" value={f.name} onChangeText={(v) => set('name', v)} />
      <Field placeholder="Email" value={f.email} onChangeText={(v) => set('email', v)} keyboardType="email-address" />
      <Field placeholder="Temporary password" value={f.password} onChangeText={(v) => set('password', v)} />
      <Chips value={f.role} onChange={(v) => set('role', v)} options={['student', 'teacher', 'parent', 'admin'].map((r) => ({ id: r, label: r }))} />
      {f.role === 'student' && <><Text style={s.mute}>Class</Text>
        <Chips value={f.class_id} onChange={(v) => set('class_id', v)} options={classes.map((c) => ({ id: c.id, label: c.name }))} /></>}
      {f.role === 'parent' && <><Text style={s.mute}>Child</Text>
        <Chips value={f.parent_of} onChange={(v) => set('parent_of', v)} options={list.filter((u) => u.role === 'student').map((u) => ({ id: u.id, label: u.name }))} /></>}
      <Btn title="Add person" onPress={save} />
      <H>Everyone</H>
      {list.length === 0 && <Empty>No one yet. Add the first person above.</Empty>}
      {list.map((u) => <Card key={u.id}><Text style={s.bold}>{u.name}</Text><Text style={s.mute}>{u.role} · {u.email}</Text></Card>)}
    </ScrollView>
  );
}

export function Classes() {
  const [list, setList] = useState([]); const [teachers, setTeachers] = useState([]);
  const [f, setF] = useState({ name: '', level: 'Primary' });
  const load = () => Promise.all([api('/classes'), api('/users?role=teacher')]).then(([c, t]) => { setList(c); setTeachers(t); }).catch(fail);
  useEffect(() => { load(); }, []);
  const save = async () => {
    try { await api('/classes', 'POST', f); setF({ name: '', level: 'Primary' }); load(); } catch (e) { Alert.alert('Could not add class', e.message); }
  };
  return (
    <ScrollView><H>Add a class</H>
      <Field placeholder="Class name, e.g. Grade 4A" value={f.name} onChangeText={(v) => setF({ ...f, name: v })} />
      <Chips value={f.level} onChange={(v) => setF({ ...f, level: v })} options={['Primary', 'Junior', 'Senior'].map((l) => ({ id: l, label: l }))} />
      <Text style={s.mute}>Class teacher</Text>
      <Chips value={f.teacher_id} onChange={(v) => setF({ ...f, teacher_id: v })} options={teachers.map((t) => ({ id: t.id, label: t.name }))} />
      <Btn title="Add class" onPress={save} />
      <H>All classes</H>
      {list.length === 0 && <Empty>No classes yet. Add one above.</Empty>}
      {list.map((c) => <Card key={c.id}><Text style={s.bold}>{c.name} · {c.level}</Text>
        <Text style={s.mute}>{c.students} students · {c.teacher || 'No teacher yet'}</Text></Card>)}
    </ScrollView>
  );
}
