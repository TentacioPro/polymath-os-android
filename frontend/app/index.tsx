import { useEffect } from 'react';
import { useRouter } from 'expo-router';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function Index() {
  console.log(EXPO_PUBLIC_BACKEND_URL, "EXPO_PUBLIC_BACKEND_URL");
  
  const router = useRouter();
  
  useEffect(() => {
    // Immediate redirect to the dashboard tab
    router.replace('/(tabs)');
  }, [router]);

  return null; // Return null since we're immediately redirecting
}
