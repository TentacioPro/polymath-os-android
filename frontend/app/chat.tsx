import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SafeView from '../components/shared/SafeView';
import ThemedText from '../components/shared/ThemedText';
import { useTheme, createThemedStyles, spacing, fs, sw } from '../theme';

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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello. I am your Polymath agent. How can I assist your cognitive work today?',
      timestamp: new Date(),
    },
  ]);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Simulate response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Processing your request through the deep structure...',
          timestamp: new Date(),
        },
      ]);
    }, 800);
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
    <SafeView>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
        />

        {/* Input */}
        <View style={[styles.inputBar, { borderTopColor: theme.border, backgroundColor: theme.surface }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor={theme.textMuted}
            style={[styles.textInput, { color: theme.textPrimary, borderColor: theme.border }]}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={[styles.sendBtn, { backgroundColor: theme.accent }]}
          >
            <MaterialIcons name="send" size={18} color={theme.accentContrast} />
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
