import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { File } from 'expo-file-system';
import { useStore } from '../../store/useStore';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function Activities() {
  const { activities, setActivities } = useStore();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    notes: '',
    source: 'manual'
  });

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/activities?limit=100`);
      setActivities(res.data);
    } catch (error) {
      console.error('Failed to load activities:', error);
      Alert.alert('Error', 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${BACKEND_URL}/api/activities/manual`, {
        ...formData,
        timestamp: new Date().toISOString()
      });
      setFormData({ title: '', url: '', notes: '', source: 'manual' });
      setModalVisible(false);
      loadActivities();
      Alert.alert('Success', 'Activity added successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to add activity');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFile = async () => {
    try {
      const picked = await File.pickFileAsync(undefined, 'application/json');
      const file = Array.isArray(picked) ? picked[0] : picked;
      if (!file) return;

      setLoading(true);
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: 'application/json',
        name: file.name
      } as any);

      const response = await axios.post(
        `${BACKEND_URL}/api/activities/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      Alert.alert(
        'Upload Complete',
        `Created: ${response.data.created}\nDuplicates skipped: ${response.data.duplicates_skipped}`
      );
      loadActivities();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to upload file');
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Learning Activities</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={handleUploadFile}>
            <Ionicons name="cloud-upload" size={24} color="#6366f1" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle" size={24} color="#6366f1" />
          </TouchableOpacity>
        </View>
      </View>

      {loading && activities.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {activities.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color="#475569" />
              <Text style={styles.emptyText}>No activities yet</Text>
              <Text style={styles.emptySubtext}>Add your first learning activity or upload history</Text>
            </View>
          ) : (
            activities.map((activity: any) => (
              <View key={activity.id} style={styles.activityCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  {activity.category && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{activity.category}</Text>
                    </View>
                  )}
                </View>
                {activity.url && (
                  <Text style={styles.url} numberOfLines={1}>{activity.url}</Text>
                )}
                {activity.notes && (
                  <Text style={styles.notes}>{activity.notes}</Text>
                )}
                <View style={styles.cardFooter}>
                  <Text style={styles.meta}>
                    {new Date(activity.timestamp).toLocaleDateString()} • {activity.source}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#64748b" />
                </View>
              </View>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Add Activity Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Activity</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Enter activity title"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.label}>URL (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.url}
                onChangeText={(text) => setFormData({ ...formData, url: text })}
                placeholder="https://..."
                placeholderTextColor="#64748b"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Add your notes"
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddActivity}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Add Activity</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1e293b',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  url: {
    fontSize: 12,
    color: '#6366f1',
    marginBottom: 8,
  },
  notes: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: {
    fontSize: 12,
    color: '#64748b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#334155',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
