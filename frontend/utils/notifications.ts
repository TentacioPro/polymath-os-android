import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// ── Configure notification behavior ──────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

// ── Android notification channels ────────────────────────────────────
export async function setupNotificationChannels() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('connections', {
    name: 'Connections',
    description: 'New knowledge connections discovered',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#7C4DFF',
  });

  await Notifications.setNotificationChannelAsync('ingestion', {
    name: 'Ingestion',
    description: 'Data import status updates',
    importance: Notifications.AndroidImportance.DEFAULT,
  });

  await Notifications.setNotificationChannelAsync('reminders', {
    name: 'Reminders',
    description: 'Learning reminders and streak notifications',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

// ── Register for push notifications ──────────────────────────────────
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  try {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo push token:', token);

    // Set up Android channels
    await setupNotificationChannels();

    return token;
  } catch (error) {
    console.error('Failed to get push token:', error);
    return null;
  }
}

// ── Schedule a local notification ────────────────────────────────────
export async function scheduleLocalNotification(
  title: string,
  body: string,
  channelId?: string,
  data?: Record<string, any>,
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data ?? {},
      ...(Platform.OS === 'android' && channelId ? { channelId } : {}),
    },
    trigger: null, // Immediate
  });
}

// ── Map backend notification types to local notifications ────────────
export function mapBackendNotification(notification: {
  type: string;
  title: string;
  desc: string;
  data?: Record<string, any>;
}) {
  const channelMap: Record<string, string> = {
    connection: 'connections',
    ingestion: 'ingestion',
    reminder: 'reminders',
  };

  const channelId = channelMap[notification.type] || 'reminders';
  scheduleLocalNotification(
    notification.title,
    notification.desc,
    channelId,
    notification.data,
  );
}

// ── Listen for notification interactions ─────────────────────────────
export function addNotificationResponseListener(
  handler: (response: Notifications.NotificationResponse) => void,
) {
  return Notifications.addNotificationResponseReceivedListener(handler);
}

export function addNotificationReceivedListener(
  handler: (notification: Notifications.Notification) => void,
) {
  return Notifications.addNotificationReceivedListener(handler);
}
