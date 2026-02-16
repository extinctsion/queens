import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import LevelsScreen from '../screens/LevelsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import GameScreen from '../screens/GameScreen';

export type RootStackParamList = {
  Home: undefined;
  Levels: undefined;
  Settings: undefined;
  Game: { level: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#1a1a2e' },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Levels" component={LevelsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Game" component={GameScreen} />
    </Stack.Navigator>
  );
}
