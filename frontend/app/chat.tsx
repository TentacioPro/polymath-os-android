import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Keyboard,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import SafeView from '../components/shared/SafeView';
import ThemedText from '../components/shared/ThemedText';
import { useTheme, createThemedStyles, spacing, fs, sw } from '../theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = useStyles();
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
  const insets = useSafeAreaInsets();
  const dotAnim = useRef(new Animated.Value(0)).current;

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

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
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

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        item.role === 'user' ? styles.userBubble : styles.assistantBubble,
        {
          backgroundColor:
            item.role === 'user' ? theme.accent : theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <Text
        style={{
          color: item.role === 'user' ? theme.accentContrast : theme.textPrimary,
          fontSize: 13,
          lineHeight: 20,
        }}
      >
        {item.content}
      </Text>
      <Text
        style={{
          color: item.role === 'user' ? theme.accentContrast : theme.textMuted,
          fontSize: 9,
          marginTop: 6,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}
      >
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <SafeView edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={22} color={theme.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={[styles.systemLabel, { color: theme.textSecondary }]}>
              Agent Thread
            </Text>
            <ThemedText variant="heading" style={{ fontSize: 18 }}>
              Chat
            </ThemedText>
          </View>
          <TouchableOpacity>
            <MaterialIcons name="more-vert" size={22} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          ListFooterComponent={
            sending ? (
              <View style={[styles.messageBubble, styles.assistantBubble, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Animated.View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, opacity: Animated.add(0.4, Animated.multiply(dotAnim, 0.6)) }}>
                  <MaterialIcons name="psychology" size={14} color={theme.accent} />
                  <Text style={{ color: theme.textSecondary, fontSize: 12, fontStyle: 'italic' }}>Thinking...</Text>
                </Animated.View>
              </View>
            ) : null
          }
        />

        {/* Input */}
        <View style={[styles.inputBar, { borderTopColor: theme.border, backgroundColor: theme.surface, paddingBottom: Math.max(insets.bottom, 8) }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={sending ? 'Agent is thinking...' : 'Type a message...'}
            placeholderTextColor={theme.textMuted}
            style={[styles.textInput, { color: theme.textPrimary, borderColor: theme.border }]}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            editable={!sending}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={sending || !input.trim()}
            style={[styles.sendBtn, { backgroundColor: theme.accent, opacity: sending || !input.trim() ? 0.4 : 1 }]}
          >
            {sending ? (
              <ActivityIndicator size="small" color={theme.accentContrast} />
            ) : (
              <MaterialIcons name="send" size={18} color={theme.accentContrast} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeView>
  );
}

const useStyles = createThemedStyles((theme) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sw(20),
    paddingVertical: sw(12),
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  systemLabel: {
    fontSize: fs(10),
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  messageList: {
    padding: sw(20),
    gap: sw(12),
  },
  messageBubble: {
    padding: sw(12),
    borderWidth: 1,
    borderRadius: 12,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: sw(12),
    borderTopWidth: 1,
    gap: sw(8),
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: sw(12),
    paddingVertical: 10,
    fontSize: fs(14),
  },
  sendBtn: {
    width: sw(40),
    height: sw(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
}));
