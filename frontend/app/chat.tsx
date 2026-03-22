import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Keyboard,
  Platform,
  Animated,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedRN, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import axios from 'axios';
import { useTheme, spacing } from '../theme';
import { m3Typography, m3Radii, m3TouchTarget } from '../../shared/design-tokens';
import M3Progress from '../components/ui/M3Progress';
import { EmptyState } from '../components/ui/EmptyState';
import { hapticPress, hapticLight, hapticSuccess, hapticWarning, hapticSelection } from '../utils/haptics';
import { getBackendUrlSync } from '../utils/backend';
import { BlurView } from 'expo-blur';
import M3BottomSheet from '../components/ui/M3BottomSheet';
import M3Button from '../components/ui/M3Button';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  'Analyze patterns',
  'Summarize today',
  'Find connections',
  'What should I explore?',
];

const CHAT_STORAGE_KEY = 'polymath-chat-messages';

export default function ChatScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showPersona, setShowPersona] = useState(false);
  const [showIngest, setShowIngest] = useState(false);
  const [activePersona, setActivePersona] = useState('Core Polymath');
  const flatListRef = useRef<FlatList>(null);
  const dotAnim = useRef(new Animated.Value(0)).current;
  const keyboardHeight = useRef(new Animated.Value(0)).current;

  // Load persisted messages on mount
  useEffect(() => {
    AsyncStorage.getItem(CHAT_STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored).map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }));
          if (parsed.length > 0) {
            setMessages(parsed);
            return;
          }
        } catch {}
      }
      // Default welcome message
      setMessages([{
        id: '1',
        role: 'assistant',
        content: 'Hello. I am your Polymath agent. How can I assist your cognitive work today?',
        timestamp: new Date(),
      }]);
    });
  }, []);

  // Persist messages on change
  useEffect(() => {
    if (messages.length > 0) {
      AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages)).catch(() => {});
    }
  }, [messages]);

  const handleClearChat = useCallback(() => {
    hapticWarning();
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Chat cleared. How can I help you?',
      timestamp: new Date(),
    }]);
    AsyncStorage.removeItem(CHAT_STORAGE_KEY).catch(() => {});
  }, []);

  // Typing indicator animation
  useEffect(() => {
    if (sending) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(dotAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
  }, [sending, dotAnim]);

  // Keyboard listeners
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(keyboardHeight, {
        toValue: e.endCoordinates.height,
        duration: Platform.OS === 'ios' ? 250 : 100,
        useNativeDriver: false,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? 250 : 100,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const sendMessage = async (text?: string) => {
    const BACKEND_URL = getBackendUrlSync();
    const msg = (text || input).trim();
    if (!msg || sending) return;
    hapticPress();

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await axios.get(`${BACKEND_URL}/api/agent/chat`, {
        params: { message: msg },
      });
      hapticSuccess();
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: res.data.response || res.data.message || 'No response received.',
          timestamp: new Date(),
        },
      ]);
    } catch (error: any) {
      hapticWarning();
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Error: ${error?.response?.data?.detail || error.message || 'Failed to reach agent.'}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isUser = item.role === 'user';
    return (
      <AnimatedRN.View entering={FadeInUp.delay(50).springify()}>
        <View style={[styles.messageRow, isUser ? styles.userRow : styles.assistantRow]}>
          {!isUser && (
            <View style={[styles.inlineAvatar, { backgroundColor: theme.surfaceContainerHigh }]}>
              <MaterialIcons name="psychology" size={16} color={theme.onSurfaceVariant} />
            </View>
          )}
          <View
            style={[
              styles.bubble,
              isUser ? [styles.userBubble, styles.shadowLight, { backgroundColor: theme.primaryContainer }] : [styles.assistantBubble, { backgroundColor: 'transparent' }],
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                { color: isUser ? theme.onPrimaryContainer : theme.onSurface },
              ]}
            >
              {item.content}
            </Text>
            {/* Timestamp */}
            <Text
              style={[
                styles.timestamp,
                { color: isUser ? theme.onPrimaryContainer : theme.onSurfaceVariant, textAlign: isUser ? 'right' : 'left' },
              ]}
            >
              {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      </AnimatedRN.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <Animated.View style={[styles.kav, { paddingBottom: keyboardHeight }]}>
        {/* Agent Persona Strip */}
        <AnimatedRN.View
          entering={FadeInDown.duration(400)}
          style={[styles.personaStrip, { paddingTop: insets.top + 8 }]}
        >
          <BlurView intensity={60} tint="default" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.surfaceContainer, opacity: 0.85 }]} />
          
          <Pressable
            onPress={() => { hapticLight(); router.back(); }}
            style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
          >
            <MaterialIcons name="arrow-back" size={24} color={theme.onSurface} />
          </Pressable>
          <Pressable
            onPress={() => { hapticSelection(); setShowHistory(true); }}
            style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1, marginLeft: -spacing.sm }]}
          >
            <MaterialIcons name="history" size={24} color={theme.onSurfaceVariant} />
          </Pressable>
          <View style={styles.personaText}>
            <Pressable 
              style={({pressed}) => [{ flexDirection: 'row', alignItems: 'center', opacity: pressed ? 0.7 : 1 }]}
              onPress={() => { hapticSelection(); setShowPersona(true); }}
            >
              <Text style={[styles.personaName, { color: theme.onSurface }]}>{activePersona}</Text>
              <MaterialIcons name="keyboard-arrow-down" size={20} color={theme.onSurfaceVariant} style={{ marginTop: 2 }} />
            </Pressable>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, {
                backgroundColor: sending ? theme.warning : theme.success,
              }]} />
              <Text style={[styles.statusLabel, { color: theme.onSurfaceVariant }]}>
                {sending ? 'Thinking...' : 'Online'}
              </Text>
            </View>
          </View>
          {messages.length > 1 && (
            <Pressable
              onPress={handleClearChat}
              style={({ pressed }) => [styles.clearBtn, { backgroundColor: theme.surfaceContainerHigh, opacity: pressed ? 0.8 : 1 }]}
            >
              <MaterialIcons name="delete-outline" size={18} color={theme.onSurfaceVariant} />
            </Pressable>
          )}
        </AnimatedRN.View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !sending ? <EmptyState variant="empty-chat" /> : null
          }
          ListFooterComponent={
            sending ? (
              <View style={[styles.bubble, styles.assistantBubble, {
                backgroundColor: theme.surfaceContainerHigh,
              }]}>
                <Animated.View style={[styles.thinkingRow, {
                  opacity: Animated.add(0.4, Animated.multiply(dotAnim, 0.6)),
                }]}>
                  <MaterialIcons name="psychology" size={14} color={theme.primary} />
                  <Text style={[styles.thinkingText, { color: theme.onSurfaceVariant }]}>
                    Thinking...
                  </Text>
                </Animated.View>
              </View>
            ) : null
          }
        />

        {/* Suggestion chips */}
        {messages.length <= 1 && !sending && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsRow}
          >
            {SUGGESTIONS.map((s, i) => (
              <Pressable
                key={i}
                style={({ pressed }) => [styles.suggestionChip, styles.shadowLight, { backgroundColor: theme.surfaceContainerHigh, opacity: pressed ? 0.8 : 1 }]}
                onPress={() => sendMessage(s)}
              >
                <Text style={[styles.suggestionText, { color: theme.primary }]}>{s}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Input bar */}
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: theme.surface,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          <View style={[styles.inputPill, styles.shadowLight, { backgroundColor: theme.surfaceContainer }]}>
            <Pressable
              onPress={() => { 
                hapticSelection(); 
                Keyboard.dismiss();
                setShowIngest(true); 
              }}
              style={({ pressed }) => [styles.attachBtn, { opacity: pressed ? 0.6 : 1 }]}
            >
              <MaterialIcons name="add-circle" size={24} color={theme.onSurfaceVariant} />
            </Pressable>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={sending ? 'Agent is thinking...' : 'Type a message...'}
              placeholderTextColor={theme.onSurfaceVariant}
              style={[styles.textInput, { color: theme.onSurface }]}
              onSubmitEditing={() => sendMessage()}
              returnKeyType="send"
              editable={!sending}
              multiline
            />
            <Pressable
              onPress={() => sendMessage()}
              disabled={sending || !input.trim()}
              style={({ pressed }) => [
                styles.sendBtn,
                {
                  backgroundColor: theme.primary,
                  opacity: sending || !input.trim() ? 0.4 : pressed ? 0.8 : 1,
                },
              ]}
            >
              {sending ? (
                <M3Progress size="small" />
              ) : (
                <MaterialIcons name="send" size={18} color={theme.onPrimary} />
              )}
            </Pressable>
          </View>
        </View>
      </Animated.View>

      {/* Letta Persona Selector */}
      <M3BottomSheet visible={showPersona} onDismiss={() => setShowPersona(false)} snapPoints={[0.5]}>
        <View style={styles.sheetContent}>
          <Text style={[styles.sheetTitle, { color: theme.onSurface }]}>Agent Persona</Text>
          <Text style={[styles.sheetSub, { color: theme.onSurfaceVariant }]}>Select your active Letta system persona</Text>
          <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
            {['Core Polymath', 'Code Architect', 'Letta Analyst', 'Research Assistant'].map(persona => (
              <Pressable
                key={persona}
                style={({ pressed }) => [
                  styles.personaOption,
                  activePersona === persona && { backgroundColor: theme.primaryContainer, borderColor: theme.primary },
                  { opacity: pressed ? 0.7 : 1 }
                ]}
                onPress={() => {
                  hapticSuccess();
                  setActivePersona(persona);
                  setShowPersona(false);
                }}
              >
                <MaterialIcons name="psychology" size={24} color={activePersona === persona ? theme.primary : theme.onSurfaceVariant} />
                <Text style={[styles.personaOptionText, { color: activePersona === persona ? theme.onPrimaryContainer : theme.onSurface }]}>
                  {persona}
                </Text>
                {activePersona === persona && <MaterialIcons name="check" size={20} color={theme.primary} />}
              </Pressable>
            ))}
          </View>
        </View>
      </M3BottomSheet>

      {/* Data Ingestion & Memories */}
      <M3BottomSheet visible={showIngest} onDismiss={() => setShowIngest(false)} snapPoints={[0.6]}>
        <View style={styles.sheetContent}>
          <Text style={[styles.sheetTitle, { color: theme.onSurface }]}>Data Ingestion</Text>
          <Text style={[styles.sheetSub, { color: theme.onSurfaceVariant }]}>Provide context or inject memories</Text>
          <View style={styles.ingestGrid}>
            <Pressable style={({ pressed }) => [styles.ingestCard, { backgroundColor: theme.surfaceContainerHigh, opacity: pressed ? 0.7 : 1 }]} onPress={() => { hapticPress(); setShowIngest(false); }}>
              <MaterialIcons name="description" size={28} color={theme.primary} />
              <Text style={[styles.ingestCardTitle, { color: theme.onSurface }]}>Upload Document</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.ingestCard, { backgroundColor: theme.surfaceContainerHigh, opacity: pressed ? 0.7 : 1 }]} onPress={() => { hapticPress(); setShowIngest(false); }}>
              <MaterialIcons name="memory" size={28} color={theme.tertiary} />
              <Text style={[styles.ingestCardTitle, { color: theme.onSurface }]}>Add Custom Memory</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.ingestCard, { backgroundColor: theme.surfaceContainerHigh, opacity: pressed ? 0.7 : 1 }]} onPress={() => { hapticPress(); setShowIngest(false); }}>
              <MaterialIcons name="camera-alt" size={28} color={theme.secondary} />
              <Text style={[styles.ingestCardTitle, { color: theme.onSurface }]}>Take a Picture</Text>
            </Pressable>
          </View>
        </View>
      </M3BottomSheet>

      {/* History Drawer */}
      <M3BottomSheet visible={showHistory} onDismiss={() => setShowHistory(false)} snapPoints={[0.8]}>
        <View style={styles.sheetContent}>
          <Text style={[styles.sheetTitle, { color: theme.onSurface }]}>Chat History</Text>
          <View style={{ height: spacing.lg }} />
          {/* Mock history list */}
          {[1, 2, 3, 4, 5].map(i => (
            <Pressable key={i} style={({ pressed }) => [styles.historyItem, { opacity: pressed ? 0.7 : 1 }]} onPress={() => { hapticSelection(); setShowHistory(false); }}>
              <MaterialIcons name="chat-bubble-outline" size={20} color={theme.onSurfaceVariant} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.historyTitle, { color: theme.onSurface }]} numberOfLines={1}>
                  Conversation Thread #{i}
                </Text>
                <Text style={[styles.historyDate, { color: theme.onSurfaceVariant }]}>
                  {i} days ago
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </M3BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  kav: { flex: 1 },

  personaStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderColor: 'rgba(150,150,150,0.1)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: m3Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personaText: { flex: 1 },
  personaName: {
    fontSize: m3Typography.titleMedium.fontSize,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: m3Typography.labelSmall.fontSize,
  },
  clearBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Messages */
  messageList: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: '90%',
  },
  inlineAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: spacing.xs,
  },
  userRow: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  assistantRow: {
    alignSelf: 'flex-start',
  },
  bubble: {
    padding: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  userBubble: {
    borderRadius: m3Radii['2xl'],
    borderBottomRightRadius: m3Radii.sm,
  },
  assistantBubble: {
    borderRadius: 0,
    paddingHorizontal: 0, // Clean typography-only edge
  },
  bubbleText: {
    fontSize: m3Typography.bodyLarge.fontSize,
    lineHeight: m3Typography.bodyLarge.lineHeight,
  },
  timestamp: {
    fontSize: m3Typography.labelSmall.fontSize - 1,
    marginTop: spacing.xs,
    letterSpacing: 0.5,
  },
  thinkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  thinkingText: {
    fontSize: m3Typography.bodySmall.fontSize,
    fontStyle: 'italic',
  },

  /* Suggestions */
  suggestionsRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  suggestionChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: m3Radii.lg,
  },
  suggestionText: {
    fontSize: m3Typography.labelLarge.fontSize,
    fontWeight: '500',
  },

  /* Input */
  inputBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  inputPill: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: m3Radii.full,
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    minHeight: 48,
  },
  attachBtn: {
    padding: spacing.sm,
    marginBottom: 4,
  },
  textInput: {
    flex: 1,
    fontSize: m3Typography.bodyLarge.fontSize,
    paddingVertical: spacing.sm,
    maxHeight: 120,
    marginLeft: spacing.xs,
  },
  sendBtn: {
    width: m3TouchTarget.min,
    height: m3TouchTarget.min,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: m3TouchTarget.min / 2,
  },
  shadowLight: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  /* Bottom Sheets */
  sheetContent: {
    padding: spacing.lg,
    flex: 1,
  },
  sheetTitle: {
    fontSize: m3Typography.headlineSmall.fontSize,
    fontWeight: '700',
  },
  sheetSub: {
    fontSize: m3Typography.bodyMedium.fontSize,
    marginTop: 4,
  },
  personaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: m3Radii.lg,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: spacing.md,
  },
  personaOptionText: {
    fontSize: m3Typography.titleMedium.fontSize,
    fontWeight: '600',
    flex: 1,
  },
  ingestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  ingestCard: {
    width: '46%',
    aspectRatio: 1.1,
    borderRadius: m3Radii.xl,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  ingestCardTitle: {
    fontSize: m3Typography.labelMedium.fontSize,
    fontWeight: '600',
    textAlign: 'center',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderColor: 'rgba(150,150,150,0.1)',
  },
  historyTitle: {
    fontSize: m3Typography.bodyLarge.fontSize,
    fontWeight: '500',
  },
  historyDate: {
    fontSize: m3Typography.labelSmall.fontSize,
    marginTop: 2,
  },
});
