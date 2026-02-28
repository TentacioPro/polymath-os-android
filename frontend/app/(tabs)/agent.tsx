import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function AgentMemory() {
  const [view, setView] = useState<'memories' | 'persona' | 'learning'>('memories');
  const [loading, setLoading] = useState(false);
  const [memories, setMemories] = useState<any[]>([]);
  const [persona, setPersona] = useState<any>(null);
  const [learningLogs, setLearningLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [editPersonaModal, setEditPersonaModal] = useState(false);
  const [chatModal, setChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');

  const [personaForm, setPersonaForm] = useState({
    name: '',
    role: '',
    focus_areas: '',
    behavior_traits: '',
    custom_instructions: ''
  });

  useEffect(() => {
    loadData();
  }, [view]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (view === 'memories') {
        const [memoriesRes, statsRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/agent/memory?limit=100`),
          axios.get(`${BACKEND_URL}/api/agent/stats`)
        ]);
        setMemories(memoriesRes.data);
        setStats(statsRes.data);
      } else if (view === 'persona') {
        const personaRes = await axios.get(`${BACKEND_URL}/api/agent/persona`);
        setPersona(personaRes.data);
        setPersonaForm({
          name: personaRes.data.name || '',
          role: personaRes.data.role || '',
          focus_areas: (personaRes.data.focus_areas || []).join(', '),
          behavior_traits: (personaRes.data.behavior_traits || []).join(', '),
          custom_instructions: personaRes.data.custom_instructions || ''
        });
      } else if (view === 'learning') {
        const logsRes = await axios.get(`${BACKEND_URL}/api/agent/learning-logs?limit=50`);
        setLearningLogs(logsRes.data);
      }
    } catch (error) {
      console.error('Failed to load agent data:', error);
      Alert.alert('Error', 'Failed to load agent data');
    } finally {
      setLoading(false);
    }
  };

  const triggerLearning = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${BACKEND_URL}/api/agent/learn`);
      Alert.alert(
        'Learning Complete',
        `Extracted ${res.data.insights_extracted} insights\nCreated ${res.data.memories_created} memories\nProcessed ${res.data.journals_processed} journals`
      );
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Learning failed');
    } finally {
      setLoading(false);
    }
  };

  const consolidateMemories = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${BACKEND_URL}/api/agent/consolidate`);
      Alert.alert(
        'Consolidation Complete',
        `Consolidated ${res.data.consolidated} memories\nArchived ${res.data.archived} short-term memories`
      );
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Consolidation failed');
    } finally {
      setLoading(false);
    }
  };

  const updatePersona = async () => {
    try {
      setLoading(true);
      await axios.put(`${BACKEND_URL}/api/agent/persona`, {
        name: personaForm.name,
        role: personaForm.role,
        focus_areas: personaForm.focus_areas.split(',').map(s => s.trim()).filter(s => s),
        behavior_traits: personaForm.behavior_traits.split(',').map(s => s.trim()).filter(s => s),
        custom_instructions: personaForm.custom_instructions
      });
      Alert.alert('Success', 'Persona updated successfully');
      setEditPersonaModal(false);
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update persona');
    } finally {
      setLoading(false);
    }
  };

  const chatWithAgent = async () => {
    if (!chatMessage.trim()) return;
    
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/agent/chat`, {
        params: { message: chatMessage }
      });
      setChatResponse(res.data.response);
      setChatMessage('');
    } catch (error) {
      Alert.alert('Error', 'Chat failed');
    } finally {
      setLoading(false);
    }
  };

  const deleteMemory = async (memoryId: string) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/agent/memory/${memoryId}`);
      Alert.alert('Success', 'Memory deleted');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete memory');
    }
  };

  const renderMemories = () => (
    <ScrollView style={styles.scrollView}>
      {/* Stats Overview */}
      {stats && (
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Memory Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.total_memories}</Text>
              <Text style={styles.statLabel}>Total Memories</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.breakdown?.long_term || 0}</Text>
              <Text style={styles.statLabel}>Long-term</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.total_learning_events || 0}</Text>
              <Text style={styles.statLabel}>Learning Events</Text>
            </View>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.learnButton} onPress={triggerLearning} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Ionicons name="flash" size={20} color="#fff" />
              <Text style={styles.buttonText}>Learn from Data</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.consolidateButton} onPress={consolidateMemories} disabled={loading}>
          <Ionicons name="layers" size={20} color="#fff" />
          <Text style={styles.buttonText}>Consolidate</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.chatButton} onPress={() => setChatModal(true)}>
          <Ionicons name="chatbubbles" size={20} color="#fff" />
          <Text style={styles.buttonText}>Chat</Text>
        </TouchableOpacity>
      </View>

      {/* Memory List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Memories ({memories.length})</Text>
        {memories.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bulb-outline" size={64} color="#475569" />
            <Text style={styles.emptyText}>No memories yet</Text>
            <Text style={styles.emptySubtext}>Tap "Learn from Data" to extract insights</Text>
          </View>
        ) : (
          memories.map((memory: any) => (
            <View key={memory.id} style={styles.memoryCard}>
              <View style={styles.memoryHeader}>
                <View style={[styles.typeBadge, { backgroundColor: getMemoryTypeColor(memory.memory_type) }]}>
                  <Text style={styles.typeBadgeText}>{memory.memory_type}</Text>
                </View>
                <TouchableOpacity onPress={() => {
                  Alert.alert('Delete Memory', 'Are you sure?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteMemory(memory.id) }
                  ]);
                }}>
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
              <Text style={styles.memoryContent}>{memory.content}</Text>
              <View style={styles.memoryFooter}>
                <View style={styles.importanceBar}>
                  <View style={[styles.importanceFill, { width: `${memory.importance * 100}%` }]} />
                </View>
                <Text style={styles.metaText}>
                  Importance: {(memory.importance * 100).toFixed(0)}% • 
                  Accessed: {memory.access_count || 0}x • 
                  {new Date(memory.timestamp).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );

  const renderPersona = () => (
    <ScrollView style={styles.scrollView}>
      {persona && (
        <View style={styles.personaContainer}>
          <View style={styles.personaHeader}>
            <View>
              <Text style={styles.personaName}>{persona.name}</Text>
              <Text style={styles.personaRole}>{persona.role}</Text>
            </View>
            <TouchableOpacity onPress={() => setEditPersonaModal(true)}>
              <Ionicons name="create-outline" size={28} color="#6366f1" />
            </TouchableOpacity>
          </View>

          {persona.focus_areas && persona.focus_areas.length > 0 && (
            <View style={styles.personaSection}>
              <Text style={styles.personaLabel}>Focus Areas</Text>
              <View style={styles.tagsContainer}>
                {persona.focus_areas.map((area: string, index: number) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{area}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {persona.behavior_traits && persona.behavior_traits.length > 0 && (
            <View style={styles.personaSection}>
              <Text style={styles.personaLabel}>Behavior Traits</Text>
              <View style={styles.tagsContainer}>
                {persona.behavior_traits.map((trait: string, index: number) => (
                  <View key={index} style={[styles.tag, styles.traitTag]}>
                    <Text style={styles.tagText}>{trait}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {persona.custom_instructions && (
            <View style={styles.personaSection}>
              <Text style={styles.personaLabel}>Custom Instructions</Text>
              <View style={styles.instructionsBox}>
                <Text style={styles.instructionsText}>{persona.custom_instructions}</Text>
              </View>
            </View>
          )}

          <View style={styles.personaSection}>
            <Text style={styles.personaLabel}>Last Updated</Text>
            <Text style={styles.metaText}>
              {new Date(persona.updated_at).toLocaleString()}
            </Text>
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  const renderLearningLogs = () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Learning Progression</Text>
        <Text style={styles.sectionSubtitle}>
          Track how the agent learns and improves over time
        </Text>

        {learningLogs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={64} color="#475569" />
            <Text style={styles.emptyText}>No learning logs yet</Text>
            <Text style={styles.emptySubtext}>Agent will learn from your interactions</Text>
          </View>
        ) : (
          learningLogs.map((log: any) => (
            <View key={log.id} style={styles.logCard}>
              <View style={styles.logHeader}>
                <Ionicons name="bulb" size={24} color="#f59e0b" />
                <Text style={styles.logDate}>
                  {new Date(log.learned_at).toLocaleString()}
                </Text>
              </View>
              <Text style={styles.logInsight}>{log.insight}</Text>
              {log.source_data && log.source_data.type && (
                <Text style={styles.logSource}>Source: {log.source_data.type}</Text>
              )}
            </View>
          ))
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Agent Memory</Text>
        <Text style={styles.subtitle}>Long-term learning assistant</Text>
      </View>

      {/* View Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, view === 'memories' && styles.activeTab]}
          onPress={() => setView('memories')}
        >
          <Ionicons name="bulb" size={20} color={view === 'memories' ? '#6366f1' : '#64748b'} />
          <Text style={[styles.tabText, view === 'memories' && styles.activeTabText]}>
            Memories
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, view === 'persona' && styles.activeTab]}
          onPress={() => setView('persona')}
        >
          <Ionicons name="person" size={20} color={view === 'persona' ? '#6366f1' : '#64748b'} />
          <Text style={[styles.tabText, view === 'persona' && styles.activeTabText]}>
            Persona
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, view === 'learning' && styles.activeTab]}
          onPress={() => setView('learning')}
        >
          <Ionicons name="trending-up" size={20} color={view === 'learning' ? '#6366f1' : '#64748b'} />
          <Text style={[styles.tabText, view === 'learning' && styles.activeTabText]}>
            Learning
          </Text>
        </TouchableOpacity>
      </View>

      {loading && memories.length === 0 && learningLogs.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <>
          {view === 'memories' && renderMemories()}
          {view === 'persona' && renderPersona()}
          {view === 'learning' && renderLearningLogs()}
        </>
      )}

      {/* Edit Persona Modal */}
      <Modal
        visible={editPersonaModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditPersonaModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Persona</Text>
              <TouchableOpacity onPress={() => setEditPersonaModal(false)}>
                <Ionicons name="close" size={28} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={personaForm.name}
                onChangeText={(text) => setPersonaForm({ ...personaForm, name: text })}
                placeholder="Learning Assistant"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.label}>Role</Text>
              <TextInput
                style={styles.input}
                value={personaForm.role}
                onChangeText={(text) => setPersonaForm({ ...personaForm, role: text })}
                placeholder="Polymath Guide"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.label}>Focus Areas (comma-separated)</Text>
              <TextInput
                style={styles.input}
                value={personaForm.focus_areas}
                onChangeText={(text) => setPersonaForm({ ...personaForm, focus_areas: text })}
                placeholder="AI, Technology, Learning"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.label}>Behavior Traits (comma-separated)</Text>
              <TextInput
                style={styles.input}
                value={personaForm.behavior_traits}
                onChangeText={(text) => setPersonaForm({ ...personaForm, behavior_traits: text })}
                placeholder="Curious, Analytical, Supportive"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.label}>Custom Instructions</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={personaForm.custom_instructions}
                onChangeText={(text) => setPersonaForm({ ...personaForm, custom_instructions: text })}
                placeholder="How should the agent behave?"
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={6}
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={updatePersona}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Save Persona</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Chat Modal */}
      <Modal
        visible={chatModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setChatModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chat with Agent</Text>
              <TouchableOpacity onPress={() => setChatModal(false)}>
                <Ionicons name="close" size={28} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.chatScroll}>
              {chatResponse && (
                <View style={styles.responseBox}>
                  <Ionicons name="chatbubble-ellipses" size={20} color="#6366f1" />
                  <Text style={styles.responseText}>{chatResponse}</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.chatInputContainer}>
              <TextInput
                style={styles.chatInput}
                value={chatMessage}
                onChangeText={setChatMessage}
                placeholder="Ask your learning assistant..."
                placeholderTextColor="#64748b"
                multiline
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={chatWithAgent}
                disabled={loading || !chatMessage.trim()}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Ionicons name="send" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getMemoryTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'short_term': '#3b82f6',
    'long_term': '#10b981',
    'insight': '#f59e0b',
    'pattern': '#ec4899',
    'archived': '#6b7280'
  };
  return colors[type] || colors['archived'];
};

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
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#334155',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#6366f1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    padding: 16,
    backgroundColor: '#1e293b',
    margin: 16,
    borderRadius: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#0f172a',
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  learnButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  consolidateButton: {
    flex: 1,
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  chatButton: {
    backgroundColor: '#ec4899',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
  memoryCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  memoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  memoryContent: {
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 22,
    marginBottom: 12,
  },
  memoryFooter: {
    gap: 8,
  },
  importanceBar: {
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    overflow: 'hidden',
  },
  importanceFill: {
    height: '100%',
    backgroundColor: '#6366f1',
  },
  metaText: {
    fontSize: 11,
    color: '#64748b',
  },
  personaContainer: {
    padding: 16,
  },
  personaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  personaName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  personaRole: {
    fontSize: 16,
    color: '#6366f1',
    marginTop: 4,
  },
  personaSection: {
    marginBottom: 24,
  },
  personaLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  traitTag: {
    backgroundColor: '#10b981',
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  instructionsBox: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  instructionsText: {
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 22,
  },
  logCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  logInsight: {
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 22,
    marginBottom: 8,
  },
  logSource: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
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
    fontSize: 20,
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
    height: 150,
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
  chatScroll: {
    maxHeight: 300,
    marginBottom: 16,
  },
  responseBox: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  responseText: {
    flex: 1,
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 22,
  },
  chatInputContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#334155',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 12,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
