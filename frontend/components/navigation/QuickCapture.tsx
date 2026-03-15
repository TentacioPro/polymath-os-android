import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  ScrollView,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { AudioModule } from 'expo-audio';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useTheme, spacing, fs, sw } from '../../theme';
import { hapticPress, hapticSuccess, hapticWarning } from '../../utils/haptics';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

interface QuickCaptureProps {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (text: string) => void;
}

const MAX_CHARS = 500;

const ACTION_BUTTONS = [
  { icon: 'mic' as const, label: 'Voice', color: '#EF4444' },
  { icon: 'link' as const, label: 'Link', color: '#3B82F6' },
  { icon: 'photo-camera' as const, label: 'Scan', color: '#10B981' },
  { icon: 'attach-file' as const, label: 'File', color: '#F59E0B' },
];

/**
 * Quick Capture bottom sheet overlay.
 * Triggered by the FAB (+) in the floating pill.
 * Modern slide-up drawer with smooth animations.
 */
export default function QuickCapture({ visible, onClose, onSubmit }: QuickCaptureProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Animations
  const slideAnim = useRef(new Animated.Value(400)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const keyboardHeight = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset keyboard height when closing
      keyboardHeight.setValue(0);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 400,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const bg = '#0A0A0A';
  const surface = '#161616';
  const border = '#2A2A2A';
  const textPrimary = '#FFFFFF';
  const textSecondary = '#888888';
  const accent = theme.accent;

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    hapticPress();
    setSubmitting(true);
    try {
      const isUrl = /^https?:\/\//i.test(trimmed);

      await axios.post(`${BACKEND_URL}/api/activities/manual`, {
        title: isUrl ? trimmed.slice(0, 120) : trimmed,
        source: 'manual',
        url: isUrl ? trimmed : undefined,
        notes: isUrl ? undefined : trimmed,
      });

      hapticSuccess();
      if (onSubmit) onSubmit(trimmed);
      setText('');
      onClose();
    } catch (e: any) {
      hapticWarning();
      const msg = e?.response?.data?.detail || 'Failed to save. Try again.';
      Alert.alert('Capture Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (action: typeof ACTION_BUTTONS[0]) => {
    hapticPress();
    
    if (action.label === 'Link') {
      // Paste link from clipboard
      try {
        const clipText = await Clipboard.getStringAsync();
        if (clipText && /^https?:\/\//i.test(clipText)) {
          setText(clipText);
        } else {
          Alert.alert('Paste a Link', 'Copy a URL to your clipboard first, then tap Link.');
        }
      } catch {
        Alert.alert('Clipboard', 'Could not read clipboard.');
      }
    } else if (action.label === 'Voice') {
      // Voice recording
      await handleVoiceCapture();
    } else if (action.label === 'Scan') {
      // Camera/image capture
      await handleScanCapture();
    } else if (action.label === 'File') {
      // Document picker
      await handleFileCapture();
    }
  };

  const handleVoiceCapture = async () => {
    try {
      // Request audio permissions
      const { status } = await AudioModule.requestRecordingPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone access to use voice capture.');
        return;
      }

      // For now, show a simplified voice note dialog
      // Full implementation would include recording UI with waveform
      Alert.alert(
        'Voice Note',
        'Voice recording requires additional setup. For now, you can type your note or use the other capture methods.',
        [
          { text: 'OK', style: 'default' },
        ]
      );
      
      // TODO: Implement full voice recording with:
      // - Start/stop recording UI
      // - Waveform visualization
      // - Transcription via backend API (if desired)
      // - Save as audio note or transcribed text
    } catch (e: any) {
      hapticWarning();
      Alert.alert('Voice Error', e.message || 'Failed to access microphone.');
    }
  };

  const handleScanCapture = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera access to scan documents.');
        return;
      }

      // Launch camera to take a photo
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // For now, create an activity with the image URI
        // Full implementation would include OCR/barcode scanning via backend
        setSubmitting(true);
        try {
          await axios.post(`${BACKEND_URL}/api/activities/manual`, {
            title: `Scanned image ${new Date().toLocaleString()}`,
            source: 'scan',
            url: asset.uri,
            notes: `Captured via camera scan. Image dimensions: ${asset.width}x${asset.height}`,
          });
          
          hapticSuccess();
          Alert.alert('Success', 'Image captured and saved to your knowledge base.');
          onClose();
        } catch (e: any) {
          hapticWarning();
          Alert.alert('Save Error', e?.response?.data?.detail || 'Failed to save scanned image.');
        } finally {
          setSubmitting(false);
        }
      }
    } catch (e: any) {
      hapticWarning();
      Alert.alert('Camera Error', e.message || 'Failed to access camera.');
    }
  };

  const handleFileCapture = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Check if it's a JSON file (potential history import)
        if (file.name?.toLowerCase().endsWith('.json')) {
          Alert.alert(
            'JSON File Detected',
            'Would you like to import this as activity history or save as a reference?',
            [
              {
                text: 'Import History',
                onPress: () => handleHistoryImport(file),
              },
              {
                text: 'Save as Reference',
                onPress: () => handleFileSaveAsActivity(file),
              },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
        } else {
          // Non-JSON files - save as activity
          await handleFileSaveAsActivity(file);
        }
      }
    } catch (e: any) {
      hapticWarning();
      Alert.alert('File Error', e.message || 'Failed to pick document.');
    }
  };

  const handleHistoryImport = async (file: DocumentPicker.DocumentPickerAsset) => {
    setSubmitting(true);
    try {
      // Create form data for upload
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name || 'history.json',
        type: file.mimeType || 'application/json',
      } as any);

      await axios.post(`${BACKEND_URL}/api/activities/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      hapticSuccess();
      Alert.alert('Success', 'History file imported successfully!');
      onClose();
    } catch (e: any) {
      hapticWarning();
      Alert.alert('Import Error', e?.response?.data?.detail || 'Failed to import history file.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileSaveAsActivity = async (file: DocumentPicker.DocumentPickerAsset) => {
    setSubmitting(true);
    try {
      await axios.post(`${BACKEND_URL}/api/activities/manual`, {
        title: file.name || 'Uploaded file',
        source: 'upload',
        url: file.uri,
        notes: `File type: ${file.mimeType || 'unknown'}, Size: ${file.size ? Math.round(file.size / 1024) + ' KB' : 'unknown'}`,
      });

      hapticSuccess();
      Alert.alert('Success', 'File saved to your knowledge base.');
      onClose();
    } catch (e: any) {
      hapticWarning();
      Alert.alert('Save Error', e?.response?.data?.detail || 'Failed to save file.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    Keyboard.dismiss();
    hapticPress();
    onClose();
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Backdrop */}
      <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: fadeAnim }]}>
        <Pressable
          style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.75)' }]}
          onPress={handleClose}
        />
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={[styles.sheetWrapper, { paddingBottom: keyboardHeight }]}>
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: bg,
              paddingBottom: insets.bottom + 16,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Handle */}
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: textSecondary }]} />
          </View>

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIcon, { backgroundColor: accent }]}>
                <MaterialIcons name="add" size={18} color="#000" />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: textPrimary }]}>Quick Capture</Text>
                <Text style={[styles.headerSub, { color: textSecondary }]}>Add to your knowledge base</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={[styles.closeBtn, { backgroundColor: surface }]}
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={20} color={textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Input */}
            <View style={[styles.inputContainer, { backgroundColor: surface, borderColor: border }]}>
              <TextInput
                style={[styles.input, { color: textPrimary }]}
                placeholder="What did you learn? Paste a link or type a note..."
                placeholderTextColor={textSecondary}
                multiline
                maxLength={MAX_CHARS}
                value={text}
                onChangeText={setText}
                autoFocus={false}
              />
              <View style={styles.inputFooter}>
                <Text style={[styles.charCount, { color: textSecondary }]}>
                  {text.length}/{MAX_CHARS}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
              {ACTION_BUTTONS.map((action) => (
                <TouchableOpacity
                  key={action.label}
                  style={[styles.actionBtn, { backgroundColor: surface }]}
                  activeOpacity={0.7}
                  onPress={() => handleAction(action)}
                >
                  <View style={[styles.actionIconBg, { backgroundColor: action.color + '20' }]}>
                    <MaterialIcons name={action.icon} size={18} color={action.color} />
                  </View>
                  <Text style={[styles.actionLabel, { color: textSecondary }]}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                {
                  backgroundColor: text.trim() ? accent : surface,
                  opacity: text.trim() && !submitting ? 1 : 0.5,
                },
              ]}
              onPress={handleSubmit}
              disabled={!text.trim() || submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={theme.accentContrast} />
              ) : (
                <>
                  <MaterialIcons name="send" size={18} color={text.trim() ? theme.accentContrast : textSecondary} />
                  <Text style={[styles.submitLabel, { color: text.trim() ? theme.accentContrast : textSecondary }]}>
                    Capture
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: spacing.lg,
  },
  handleRow: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    opacity: 0.3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerIcon: {
    width: sw(36),
    height: sw(36),
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: fs(16),
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: fs(11),
    marginTop: 2,
  },
  closeBtn: {
    width: sw(36),
    height: sw(36),
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.lg,
    minHeight: 140,
  },
  input: {
    fontSize: fs(15),
    lineHeight: 22,
    flex: 1,
    textAlignVertical: 'top',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
  },
  charCount: {
    fontSize: fs(10),
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
  },
  actionIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: fs(10),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: spacing.sm,
  },
  submitLabel: {
    fontSize: fs(13),
    fontWeight: '700',
    letterSpacing: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
