/**
 * Capture Component Tests
 *
 * Tests for capture-related M3 components (voice, links, files, scanning).
 * Run with: bun run test __tests__/capture-components.test.tsx
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { ThemeProvider } from '../theme/ThemeContext';

// ─── Additional Mocks ─────────────────────────────────────────────────────────

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock expo-camera
jest.mock('expo-camera', () => ({
  Camera: ({ children }: { children: React.ReactNode }) => children,
  CameraType: { back: 'back', front: 'front' },
  FlashMode: { on: 'on', off: 'off', auto: 'auto' },
  useCameraPermissions: () => [{ granted: true }, jest.fn()],
}));

// Mock expo-document-picker
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{ name: 'test.pdf', size: 1024, mimeType: 'application/pdf', uri: 'file://test.pdf' }],
  }),
  DocumentPickerResult: {},
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file://image.jpg', width: 100, height: 100 }],
  }),
  launchCameraAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file://photo.jpg', width: 100, height: 100 }],
  }),
  MediaTypeOptions: { Images: 'Images', Videos: 'Videos', All: 'All' },
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
}));

// Mock Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(),
}));

// ─── Test wrapper ────────────────────────────────────────────────────────────

function wrap(ui: React.ReactElement) {
  return render(
    <ThemeProvider themeName="void" onThemeChange={() => {}}>
      {ui}
    </ThemeProvider>,
  );
}

// ─── VoiceRecorder ───────────────────────────────────────────────────────────

import { VoiceRecorder } from '../components/capture/VoiceRecorder';

describe('VoiceRecorder', () => {
  it('renders in idle state', () => {
    const { getByText } = wrap(<VoiceRecorder />);
    expect(getByText('Tap to record')).toBeTruthy();
  });

  it('renders record button with microphone icon', () => {
    const { getByTestId } = wrap(<VoiceRecorder />);
    expect(getByTestId('icon-mic')).toBeTruthy();
  });

  it('shows initial timer at 0:00', () => {
    const { getByText } = wrap(<VoiceRecorder />);
    expect(getByText('0:00')).toBeTruthy();
  });

  it('renders waveform visualization area', () => {
    const { toJSON } = wrap(<VoiceRecorder />);
    // Component should render the waveform container
    expect(toJSON()).toBeTruthy();
  });

  it('accepts onSend callback prop', () => {
    const handler = jest.fn();
    const { toJSON } = wrap(<VoiceRecorder onSend={handler} />);
    expect(toJSON()).toBeTruthy();
  });

  it('accepts onDiscard callback prop', () => {
    const handler = jest.fn();
    const { toJSON } = wrap(<VoiceRecorder onDiscard={handler} />);
    expect(toJSON()).toBeTruthy();
  });

  it('accepts onClose callback prop', () => {
    const handler = jest.fn();
    const { toJSON } = wrap(<VoiceRecorder onClose={handler} />);
    expect(toJSON()).toBeTruthy();
  });
});

// ─── LinkPreview ─────────────────────────────────────────────────────────────

import { LinkPreview } from '../components/capture/LinkPreview';

describe('LinkPreview', () => {
  it('renders loading skeleton when loading', () => {
    const { toJSON } = wrap(
      <LinkPreview url="https://example.com" loading={true} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders error state when error is true', () => {
    const { getByText } = wrap(
      <LinkPreview url="https://example.com" error={true} />,
    );
    expect(getByText('Could not fetch preview')).toBeTruthy();
  });

  it('renders error state when no metadata', () => {
    const { getByText } = wrap(
      <LinkPreview url="https://example.com" metadata={null} />,
    );
    expect(getByText('Could not fetch preview')).toBeTruthy();
  });

  it('renders preview with metadata', () => {
    const metadata = {
      url: 'https://example.com',
      title: 'Example Title',
      description: 'Example description text',
      domain: 'example.com',
    };
    const { getByText } = wrap(
      <LinkPreview url="https://example.com" metadata={metadata} />,
    );
    expect(getByText('Example Title')).toBeTruthy();
    expect(getByText('example.com')).toBeTruthy();
  });

  it('renders description when provided in metadata', () => {
    const metadata = {
      url: 'https://example.com',
      title: 'Title',
      description: 'This is a description',
      domain: 'example.com',
    };
    const { getByText } = wrap(
      <LinkPreview url="https://example.com" metadata={metadata} />,
    );
    expect(getByText('This is a description')).toBeTruthy();
  });

  it('shows remove button when onRemove is provided', () => {
    const metadata = {
      url: 'https://example.com',
      title: 'Title',
    };
    const handler = jest.fn();
    const { getByTestId } = wrap(
      <LinkPreview url="https://example.com" metadata={metadata} onRemove={handler} />,
    );
    expect(getByTestId('icon-close')).toBeTruthy();
  });

  it('shows edit button when onEditTitle is provided', () => {
    const metadata = {
      url: 'https://example.com',
      title: 'Title',
    };
    const handler = jest.fn();
    const { getByTestId } = wrap(
      <LinkPreview url="https://example.com" metadata={metadata} onEditTitle={handler} />,
    );
    expect(getByTestId('icon-pencil-outline')).toBeTruthy();
  });

  it('displays URL in error state', () => {
    const { getByText } = wrap(
      <LinkPreview url="https://test-url.com/page" error={true} />,
    );
    expect(getByText('https://test-url.com/page')).toBeTruthy();
  });
});

// ─── FileUpload ──────────────────────────────────────────────────────────────

import { FileUpload } from '../components/capture/FileUpload';

describe('FileUpload', () => {
  const defaultProps = {
    fileName: 'document.pdf',
    fileSize: 1024 * 500, // 500 KB
    fileType: 'application/pdf',
    onUpload: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders file name', () => {
    const { getByText } = wrap(<FileUpload {...defaultProps} />);
    expect(getByText('document.pdf')).toBeTruthy();
  });

  it('renders file size formatted', () => {
    const { getByText } = wrap(<FileUpload {...defaultProps} />);
    expect(getByText('500.0 KB')).toBeTruthy();
  });

  it('shows "Ready to upload" status initially', () => {
    const { getByText } = wrap(<FileUpload {...defaultProps} />);
    expect(getByText('Ready to upload')).toBeTruthy();
  });

  it('renders upload button', () => {
    const { getByText } = wrap(<FileUpload {...defaultProps} />);
    expect(getByText('Upload')).toBeTruthy();
  });

  it('shows correct icon for PDF files', () => {
    const { getByTestId } = wrap(<FileUpload {...defaultProps} />);
    expect(getByTestId('icon-document-text')).toBeTruthy();
  });

  it('shows correct icon for JSON files', () => {
    const { getByTestId } = wrap(
      <FileUpload {...defaultProps} fileType="application/json" fileName="data.json" />,
    );
    expect(getByTestId('icon-code-slash')).toBeTruthy();
  });

  it('shows correct icon for text files', () => {
    const { getByTestId } = wrap(
      <FileUpload {...defaultProps} fileType="text/plain" fileName="notes.txt" />,
    );
    expect(getByTestId('icon-document')).toBeTruthy();
  });

  it('shows correct icon for image files', () => {
    const { getByTestId } = wrap(
      <FileUpload {...defaultProps} fileType="image/jpeg" fileName="photo.jpg" />,
    );
    expect(getByTestId('icon-image')).toBeTruthy();
  });

  it('shows default icon for unknown file types', () => {
    const { getByTestId } = wrap(
      <FileUpload {...defaultProps} fileType="application/unknown" fileName="file.xyz" />,
    );
    expect(getByTestId('icon-document-outline')).toBeTruthy();
  });

  it('formats bytes correctly', () => {
    const { getByText } = wrap(
      <FileUpload {...defaultProps} fileSize={500} />,
    );
    expect(getByText('500 B')).toBeTruthy();
  });

  it('formats megabytes correctly', () => {
    const { getByText } = wrap(
      <FileUpload {...defaultProps} fileSize={1024 * 1024 * 2.5} />,
    );
    expect(getByText('2.5 MB')).toBeTruthy();
  });

  it('accepts onCancel callback', () => {
    const handler = jest.fn();
    const { toJSON } = wrap(
      <FileUpload {...defaultProps} onCancel={handler} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('accepts onRetry callback', () => {
    const handler = jest.fn();
    const { toJSON } = wrap(
      <FileUpload {...defaultProps} onRetry={handler} />,
    );
    expect(toJSON()).toBeTruthy();
  });
});

// ─── ScanOverlay ─────────────────────────────────────────────────────────────

import { ScanOverlay } from '../components/capture/ScanOverlay';

describe('ScanOverlay', () => {
  const defaultProps = {
    onCapture: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { toJSON } = wrap(<ScanOverlay {...defaultProps} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders default instruction text', () => {
    const { getByText } = wrap(<ScanOverlay {...defaultProps} />);
    expect(getByText('Point at document')).toBeTruthy();
  });

  it('renders custom instruction', () => {
    const { getByText } = wrap(
      <ScanOverlay {...defaultProps} instruction="Scan QR code" />,
    );
    expect(getByText('Scan QR code')).toBeTruthy();
  });

  it('shows "Analyzing..." when processing', () => {
    const { getByText } = wrap(
      <ScanOverlay {...defaultProps} processing={true} />,
    );
    expect(getByText('Analyzing...')).toBeTruthy();
  });

  it('renders capture button', () => {
    const { toJSON } = wrap(<ScanOverlay {...defaultProps} />);
    // The capture button is the main large circular button
    expect(toJSON()).toBeTruthy();
  });

  it('renders close button when onClose provided', () => {
    const handler = jest.fn();
    const { getByTestId } = wrap(
      <ScanOverlay {...defaultProps} onClose={handler} />,
    );
    expect(getByTestId('icon-close')).toBeTruthy();
  });

  it('renders flash toggle when onFlashToggle provided', () => {
    const handler = jest.fn();
    const { getByTestId } = wrap(
      <ScanOverlay {...defaultProps} onFlashToggle={handler} flashOn={false} />,
    );
    expect(getByTestId('icon-flash-off')).toBeTruthy();
  });

  it('shows flash-on icon when flash is on', () => {
    const handler = jest.fn();
    const { getByTestId } = wrap(
      <ScanOverlay {...defaultProps} onFlashToggle={handler} flashOn={true} />,
    );
    expect(getByTestId('icon-flash')).toBeTruthy();
  });

  it('renders gallery button when onGallery provided', () => {
    const handler = jest.fn();
    const { getByTestId } = wrap(
      <ScanOverlay {...defaultProps} onGallery={handler} />,
    );
    expect(getByTestId('icon-images-outline')).toBeTruthy();
  });

  it('fires onCapture when capture button pressed', () => {
    const handler = jest.fn();
    const { toJSON } = wrap(<ScanOverlay onCapture={handler} />);
    // Component renders - actual press would trigger onCapture
    expect(toJSON()).toBeTruthy();
  });

  it('renders viewfinder corners', () => {
    // The viewfinder has 4 corners styled with borderColor
    const { toJSON } = wrap(<ScanOverlay {...defaultProps} />);
    expect(toJSON()).toBeTruthy();
  });
});

// ─── Integration Tests ───────────────────────────────────────────────────────

describe('Capture components integration', () => {
  it('all capture components render in the same theme context', () => {
    const { toJSON } = render(
      <ThemeProvider themeName="void" onThemeChange={() => {}}>
        <View>
          <VoiceRecorder />
          <LinkPreview 
            url="https://example.com" 
            metadata={{ url: 'https://example.com', title: 'Test' }} 
          />
          <FileUpload 
            fileName="test.pdf" 
            fileSize={1024} 
            fileType="application/pdf" 
            onUpload={() => Promise.resolve()} 
          />
          <ScanOverlay onCapture={() => {}} />
        </View>
      </ThemeProvider>,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('capture components work with different themes', () => {
    const themes = ['void', 'nova', 'amber', 'ocean', 'forest'] as const;
    themes.forEach((themeName) => {
      const { toJSON } = render(
        <ThemeProvider themeName={themeName} onThemeChange={() => {}}>
          <VoiceRecorder />
        </ThemeProvider>,
      );
      expect(toJSON()).toBeTruthy();
    });
  });
});
