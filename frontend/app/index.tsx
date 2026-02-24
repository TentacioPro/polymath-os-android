import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Text, View, StyleSheet } from "react-native";

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function Index() {
  console.log(EXPO_PUBLIC_BACKEND_URL, "EXPO_PUBLIC_BACKEND_URL");
  
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the dashboard tab after a brief moment
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>Loading Polymath OS...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c0c0c",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
