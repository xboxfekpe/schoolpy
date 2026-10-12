import React, { useState } from 'react';
import { View, Text, Alert, SafeAreaView } from 'react-native';
import { C, Field, Btn } from '../ui';
import { api } from '../api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@school.com');
  const [password, setPassword] = useState('admin123');
  const go = async () => {
    try { const d = await api('/login', 'POST', { email, password }); onLogin(d.token, d.user); }
    catch (e) { Alert.alert('Could not sign in', e.message); }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.ink, justifyContent: 'center', padding: 24 }}>
      <Text style={{ color: '#fff', fontSize: 30, fontWeight: '800' }}>School Manager</Text>
      <Text style={{ color: '#B8C0D4', marginBottom: 24 }}>Sign in with the account your school gave you.</Text>
      <View><Field placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Field placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <Btn title="Sign in" onPress={go} /></View>
    </SafeAreaView>
  );
}
