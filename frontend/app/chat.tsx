import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Keyboard,
  Platform,
  Animated,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedRN, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import axios from 'axios';
import { useTheme, spacing } from '../theme';
import { m3Typography, m3Radii } from '../../shared/design-tokens';
import M3Progress from '../components/ui/M3Progress';
import { hapticPress, hapticLight, hapticSuccess, hapticWarning } from '../utils/haptics';
import { getBackendUrlSync } from '../utils/backend';

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

export default function ChatScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello. I am your Polymath agent. How can I assist your cognitive work today?',
      timestamp: new Date(),
    },
  ]);
  const flatListRef = useRef<FlatList>(null);
  const dotAnim = useRef(new Animated.Value(0)).current;
  const keyboardHeight = useRef(new Animated.Value(0)).current;

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
        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.assistantBubble,
            {
              backgroundColor: isUser ? theme.primaryContainer : theme.surfaceContainerHigh,
            },
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
          <Text
            style={[
              styles.timestamp,
              { color: isUser ? theme.onPrimaryContainer : theme.onSurfaceVariant },
            ]}
          >
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
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
          style={[styles.personaStrip, {
            paddingTop: insets.top + 8,
            backgroundColor: theme.surfaceContainer,
          }]}
        >
          <TouchableOpacity
            onPress={() => { hapticLight(); router.back(); }}
            style={[styles.backBtn, { backgroundColor: theme.surfaceContainerHigh }]}
          >
            <MaterialIcons name="arrow-back" size={20} color={theme.onSurface} />
          </TouchableOpacity>
          <View style={[styles.avatar, { backgroundColor: theme.primaryContainer }]}>
            <MaterialIcons name="psychology" size={20} color={theme.onPrimaryContainer} />
          </View>
          <View style={styles.personaText}>
            <Text style={[styles.personaName, { color: theme.onSurface }]}>Polymath Agent</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, {
                backgroundColor: sending ? theme.warning : theme.success,
              }]} />
              <Text style={[styles.statusLabel, { color: theme.onSurfaceVariant }]}>
                {sending ? 'Thinking...' : 'Online'}
              </Text>
            </View>
          </View>
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
              <TouchableOpacity
                key={i}
                style={[styles.suggestionChip, { backgroundColor: theme.surfaceContainerHigh }]}
                onPress={() => sendMessage(s)}
              >
                <Text style={[styles.suggestionText, { color: theme.primary }]}>{s}</Text>
              </TouchableOpacity>
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
          <View style={[styles.inputPill, { backgroundColor: theme.surfaceContainerHigh }]}>
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
            <TouchableOpacity
              onPress={() => sendMessage()}
              disabled={sending || !input.trim()}
              style={[
                styles.sendBtn,
                {
                  backgroundColor: theme.primary,
                  opacity: sending || !input.trim() ? 0.4 : 1,
                },
              ]}
            >
              {sending ? (
                <M3Progress size="small" />
              ) : (
                <MaterialIcons name="send" size={18} color={theme.onPrimary} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  kav: { flex: 1 },

  /* Persona strip */
  personaStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    borderBottomLeftRadius: m3Radii.xl,
    borderBottomRightRadius: m3Radii.xl,
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

  /* Messages */
  messageList: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  bubble: {
    padding: spacing.lg,
    borderRadius: m3Radii.xl,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: m3Radii.xs,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: m3Radii.xs,
  },
  bubbleText: {
    fontSize: m3Typography.bodyMedium.fontSize,
    lineHeight: m3Typography.bodyMedium.lineHeight,
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
    borderRadius: m3Radii.full,
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
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    minHeight: 52,
  },
  textInput: {
    flex: 1,
    fontSize: m3Typography.bodyLarge.fontSize,
    paddingVertical: spacing.sm,
    maxHeight: 120,
  },
  sendBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
});
