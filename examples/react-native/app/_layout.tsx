import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { AuthonProvider } from '@authon/react-native';

const secureStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export default function RootLayout() {
  return (
    <AuthonProvider
      publishableKey="YOUR_PUBLISHABLE_KEY"
      storage={secureStorage}
    >
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0f0f13' },
          headerTintColor: '#f1f5f9',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#0f0f13' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Authon Example' }} />
        <Stack.Screen name="sign-in" options={{ title: 'Sign In' }} />
        <Stack.Screen name="sign-up" options={{ title: 'Sign Up' }} />
        <Stack.Screen name="profile" options={{ title: 'Profile' }} />
        <Stack.Screen name="reset-password" options={{ title: 'Reset Password' }} />
        <Stack.Screen name="mfa" options={{ title: 'Two-Factor Auth' }} />
        <Stack.Screen name="sessions" options={{ title: 'Active Sessions' }} />
        <Stack.Screen name="delete-account" options={{ title: 'Delete Account', headerTintColor: '#ef4444' }} />
      </Stack>
    </AuthonProvider>
  );
}
