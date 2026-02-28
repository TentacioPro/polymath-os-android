import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function ExportScreen() {
  const [loading, setLoading] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);

  const exportData = async (format: string) => {
    try {
      setLoading(true);
      const res = await axios.post(`${BACKEND_URL}/api/export/${format}`);

      let file: File;

      if (format === 'json') {
        const jsonString = JSON.stringify(res.data, null, 2);
        file = new File(Paths.cache, 'polymath_export.json');
        file.create({ overwrite: true });
        file.write(jsonString);
      } else if (format === 'markdown') {
        file = new File(Paths.cache, res.data.filename);
        file.create({ overwrite: true });
        file.write(res.data.content);
      } else if (format === 'csv') {
        file = new File(Paths.cache, res.data.filename);
        file.create({ overwrite: true });
        file.write(res.data.content);
      } else {
        throw new Error(`Unknown format: ${format}`);
      }

      await Sharing.shareAsync(file.uri);
      Alert.alert('Success', `Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      const picked = await File.pickFileAsync(undefined, 'application/json');
      const file = Array.isArray(picked) ? picked[0] : picked;
      if (!file) return;

      setLoading(true);
      const fileContent = await file.text();
      const data = JSON.parse(fileContent);

      const res = await axios.post(`${BACKEND_URL}/api/import/restore`, data);

      Alert.alert(
        'Import Complete',
        `Imported:\n• ${res.data.activities_imported} activities\n• ${res.data.journals_imported} journals\n• ${res.data.connections_imported} connections`
      );
      setImportModalVisible(false);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to import data. Please check file format.');
      console.error('Import error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Export & Restore</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Export Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="download-outline" size={24} color="#6366f1" />
            <Text style={styles.sectionTitle}>Export Data</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Download your complete learning data in various formats
          </Text>

          <TouchableOpacity
            style={styles.exportCard}
            onPress={() => exportData('json')}
            disabled={loading}
          >
            <View style={styles.cardIcon}>
              <Ionicons name="code-slash" size={32} color="#6366f1" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>JSON Export</Text>
              <Text style={styles.cardDescription}>
                Complete data backup for app restoration
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exportCard}
            onPress={() => exportData('markdown')}
            disabled={loading}
          >
            <View style={styles.cardIcon}>
              <Ionicons name="document-text" size={32} color="#10b981" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Markdown Export</Text>
              <Text style={styles.cardDescription}>
                Human-readable format for documentation
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exportCard}
            onPress={() => exportData('csv')}
            disabled={loading}
          >
            <View style={styles.cardIcon}>
              <Ionicons name="grid" size={32} color="#f59e0b" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>CSV Export</Text>
              <Text style={styles.cardDescription}>
                Spreadsheet format for analysis
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Restore Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="refresh-outline" size={24} color="#ec4899" />
            <Text style={styles.sectionTitle}>Restore Data</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Import previously exported data to restore your app state
          </Text>

          <TouchableOpacity
            style={[styles.exportCard, styles.restoreCard]}
            onPress={() => setImportModalVisible(true)}
            disabled={loading}
          >
            <View style={styles.cardIcon}>
              <Ionicons name="cloud-upload" size={32} color="#ec4899" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Import JSON Backup</Text>
              <Text style={styles.cardDescription}>
                Restore from a previous export file
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#6366f1" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Data Portability</Text>
            <Text style={styles.infoText}>
              Export your data anytime. After exporting, you can delete the app and reinstall later,
              then import the backup to restore your complete learning history.
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Import Modal */}
      <Modal
        visible={importModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setImportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Import Data</Text>
              <TouchableOpacity onPress={() => setImportModalVisible(false)}>
                <Ionicons name="close" size={28} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Ionicons name="warning" size={48} color="#f59e0b" />
              <Text style={styles.warningTitle}>Important</Text>
              <Text style={styles.warningText}>
                Importing will add the data from your backup file. Duplicate entries will be skipped based on their unique identifiers.
              </Text>

              <TouchableOpacity
                style={styles.importButton}
                onPress={handleImport}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload" size={20} color="#fff" />
                    <Text style={styles.importButtonText}>Select JSON File</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 16,
    backgroundColor: '#1e293b',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
  },
  exportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  restoreCard: {
    borderColor: '#ec4899',
    borderWidth: 2,
  },
  cardIcon: {
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#94a3b8',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: '#6366f1',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalBody: {
    padding: 24,
    alignItems: 'center',
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  importButton: {
    backgroundColor: '#ec4899',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  importButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
});
