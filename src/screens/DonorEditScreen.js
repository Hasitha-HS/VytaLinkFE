import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, TextInput, Button } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import DonorService from '../services/DonorService';
import { Colors } from '../utils/Colors';

const DonorEditScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { donorId } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: 'OTHER',
    bloodType: 'O_POSITIVE',
    phone: '',
    email: '',
    address: '',
    weight: ''
  });

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const donor = await DonorService.getDonorById(donorId);
        setForm({
          name: donor.name || '',
          age: donor.age?.toString() || '',
          gender: donor.gender || 'OTHER',
          bloodType: donor.bloodType || 'O_POSITIVE',
          phone: donor.phone || '',
          email: donor.email || '',
          address: donor.address || '',
          weight: donor.weight ? String(donor.weight) : ''
        });
      } catch (e) {
        Alert.alert('Error', 'Failed to load donor');
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [donorId]);

  const onChange = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const onSave = async () => {
    try {
      setIsLoading(true);
      await DonorService.updateDonorProfile(donorId, form);
      Alert.alert('Success', 'Donor updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to update donor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>Edit Donor</Text>

          <TextInput label="Name" value={form.name} onChangeText={v => onChange('name', v)} style={styles.input} mode="outlined" />
          <TextInput label="Age" value={form.age} onChangeText={v => onChange('age', v)} style={styles.input} mode="outlined" keyboardType="numeric" />
          <TextInput label="Gender" value={form.gender} onChangeText={v => onChange('gender', v)} style={styles.input} mode="outlined" />
          <TextInput label="Blood Type" value={form.bloodType} onChangeText={v => onChange('bloodType', v)} style={styles.input} mode="outlined" />
          <TextInput label="Phone" value={form.phone} onChangeText={v => onChange('phone', v)} style={styles.input} mode="outlined" />
          <TextInput label="Email" value={form.email} onChangeText={v => onChange('email', v)} style={styles.input} mode="outlined" />
          <TextInput label="Address" value={form.address} onChangeText={v => onChange('address', v)} style={styles.input} mode="outlined" multiline />
          <TextInput label="Weight" value={form.weight} onChangeText={v => onChange('weight', v)} style={styles.input} mode="outlined" keyboardType="numeric" />

          <Button mode="contained" onPress={onSave} loading={isLoading} style={styles.saveButton}>Save</Button>
          <Button mode="text" onPress={() => navigation.goBack()} disabled={isLoading}>Cancel</Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  content: { padding: 16 },
  card: { paddingVertical: 8 },
  title: { marginBottom: 12, fontWeight: 'bold' },
  input: { marginBottom: 12 },
  saveButton: { marginTop: 8, backgroundColor: Colors.primary },
});

export default DonorEditScreen;


