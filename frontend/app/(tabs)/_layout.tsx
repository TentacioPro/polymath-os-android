import { Tabs } from 'expo-router';
import FloatingPill from '../../components/navigation/FloatingPill';
import { useTheme } from '../../theme';

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      tabBar={(props) => <FloatingPill {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.background },
      }}
      sceneContainerStyle={{ backgroundColor: theme.background }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Dashboard' }}
      />
      <Tabs.Screen
        name="knowledge"
        options={{ title: 'Knowledge' }}
      />
      <Tabs.Screen
        name="mesh"
        options={{ title: 'Neural Mesh' }}
      />
    </Tabs>
  );
}
