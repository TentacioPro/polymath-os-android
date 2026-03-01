import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Keyboard,
  Platform,
  ActivityIndicator,
  Animated,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { useTheme, spacing, fs, sw } from '../theme';
import { hapticPress, hapticLight, hapticSuccess, hapticWarning } from '../utils/haptics';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

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

  // Colors
  const bg = theme.background;
  const surface = theme.surface;
  const text = theme.textPrimary;
  const textMuted = theme.textSecondary;
  const accent = theme.accent;
  const border = theme.borderMuted;

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

  // Keyboard listeners to handle gap issue
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

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    hapticPress();
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    const query = input.trim();
    setInput('');
    setSending(true);

    try {
      const res = await axios.get(`${BACKEND_URL}/api/agent/chat`, {
        params: { message: query },
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

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
          {
            backgroundColor: isUser ? accent : surface,
            borderColor: border,
          },
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            { color: isUser ? theme.accentContrast : text },
          ]}
        >
          {item.content}
        </Text>
        <Text
          style={[
            styles.timestamp,
            { color: isUser ? theme.accentContrast : textMuted },
          ]}
        >
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Animated.View
        style={[styles.kav, { paddingBottom: keyboardHeight }]}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: border }]}>
          <TouchableOpacity
            onPress={() => { hapticLight(); router.back(); }}
            style={[styles.iconBtn, { backgroundColor: surface }]}
          >
            <MaterialIcons name="arrow-back" size={20} color={text} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: text }]}>Agent Chat</Text>
            <Text style={[styles.subtitle, { color: textMuted }]}>
              {sending ? 'Thinking...' : 'Online'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => { hapticLight(); }}
            style={[styles.iconBtn, { backgroundColor: surface }]}
          >
            <MaterialIcons name="more-vert" size={20} color={text} />
          </TouchableOpacity>
        </View>

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
              <View style={[styles.bubble, styles.assistantBubble, { backgroundColor: surface, borderColor: border }]}>
                <Animated.View style={[styles.thinkingRow, { opacity: Animated.add(0.4, Animated.multiply(dotAnim, 0.6)) }]}>
                  <MaterialIcons name="psychology" size={14} color={accent} />
                  <Text style={[styles.thinkingText, { color: textMuted }]}>Thinking...</Text>
                </Animated.View>
              </View>
            ) : null
          }
        />

        {/* Input */}
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: surface,
              borderTopColor: border,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={sending ? 'Agent is thinking...' : 'Type a message...'}
            placeholderTextColor={textMuted}
            style={[styles.textInput, { color: text, backgroundColor: bg, borderColor: border }]}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            editable={!sending}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={sending || !input.trim()}
            style={[
              styles.sendBtn,
              { backgroundColor: accent, opacity: sending || !input.trim() ? 0.4 : 1 },
            ]}
          >
            {sending ? (
              <ActivityIndicator size="small" color={theme.accentContrast} />
            ) : (
              <MaterialIcons name="send" size={18} color={theme.accentContrast} />
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  kav: { flex: 1 },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
  },
  headerText: { flex: 1, marginLeft: spacing.sm },
  title: { fontSize: fs(18), fontWeight: '700' },
  subtitle: { fontSize: fs(11), marginTop: 2 },
  iconBtn: {
    width: sw(44),
    height: sw(44),
    borderRadius: sw(12),
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Messages */
  messageList: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  bubble: {
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: 16,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: fs(14),
    lineHeight: 21,
  },
  timestamp: {
    fontSize: fs(9),
    marginTop: spacing.xs,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  thinkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  thinkingText: {
    fontSize: fs(12),
    fontStyle: 'italic',
  },

  /* Input */
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fs(14),
    minHeight: sw(48),
  },
  sendBtn: {
    width: sw(48),
    height: sw(48),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
});
