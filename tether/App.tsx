import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import * as Font from 'expo-font';
import RootNavigator from './src/navigation/RootNavigator';
import { initDb } from './src/database/db';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import {
  useFonts,
  CourierPrime_400Regular,
  CourierPrime_700Bold
} from '@expo-google-fonts/courier-prime';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold
} from '@expo-google-fonts/inter';

import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_600SemiBold
} from '@expo-google-fonts/playfair-display';

import {
  Lora_400Regular,
  Lora_600SemiBold
} from '@expo-google-fonts/lora';


export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    'Courier Prime': CourierPrime_400Regular,
    'Courier Prime Bold': CourierPrime_700Bold,
    'Inter': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Playfair Display': PlayfairDisplay_400Regular,
    'Playfair Display-SemiBold': PlayfairDisplay_600SemiBold,
    'Lora': Lora_400Regular,
    'Lora-SemiBold': Lora_600SemiBold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        await initDb();
      } catch (e) {
        console.warn('DB Init error:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!appIsReady || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading Tether...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }} edges={['bottom']}>
        <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
          <StatusBar style="auto" />
          <RootNavigator />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
