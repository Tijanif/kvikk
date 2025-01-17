import { Stack } from 'expo-router';
import { View, Text } from 'react-native';



export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'home' }} />
      <Text>Home</Text>
    </>
  );
}

