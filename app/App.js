import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { C } from './ui';
import { setToken } from './api';
import Login from './screens/Login';
import { Overview, People, Classes } from './screens/Admin';
import { Attendance, Grades } from './screens/Teacher';
import Summary from './screens/Family';

const TABS = {
  admin: [['Overview', Overview], ['People', People], ['Classes', Classes]],
  teacher: [['Attendance', Attendance], ['Grades', Grades]],
  student: [['My progress', Summary]],
  parent: [['My child', Summary]],
};

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState(0);
  if (!user) return <Login onLogin={(t, u) => { setToken(t); setUser(u); setTab(0); }} />;
  const tabs = TABS[user.role];
  const Screen = tabs[tab][1];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.paper }}>
      <StatusBar barStyle="light-content" backgroundColor={C.ink} />
      <View style={{ backgroundColor: C.ink, padding: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{user.name} ({user.role})</Text>
        <TouchableOpacity onPress={() => { setToken(null); setUser(null); }}><Text style={{ color: '#fff' }}>Sign out</Text></TouchableOpacity>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 16 }}><Screen user={user} /></View>
      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: C.line, backgroundColor: '#fff' }}>
        {tabs.map(([name], i) => (
          <TouchableOpacity key={name} onPress={() => setTab(i)} style={{ flex: 1, padding: 16, alignItems: 'center', borderTopWidth: 3, borderColor: tab === i ? C.green : 'transparent' }}>
            <Text style={{ color: tab === i ? C.green : C.mute, fontWeight: '600' }}>{name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
