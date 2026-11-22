// ============================================================
// DigDeep — Atlas Stack Navigator
// Encapsulates Atlas Canvas, 4-Layer Node Reader, and Artifact Detective
// ============================================================

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AtlasCanvasScreen from '../screens/atlas/AtlasCanvasScreen';
import NodeDetailScreen from '../screens/atlas/NodeDetailScreen';
import ArtifactDetectiveScreen from '../screens/atlas/ArtifactDetectiveScreen';
import StratigraphyDigScreen from '../screens/dig/StratigraphyDigScreen';
import type { AtlasStackParamList } from '../types';

const Stack = createNativeStackNavigator<AtlasStackParamList>();

export default function AtlasNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="AtlasCanvas" component={AtlasCanvasScreen} />
      <Stack.Screen name="NodeDetail" component={NodeDetailScreen} />
      <Stack.Screen name="ArtifactDetective" component={ArtifactDetectiveScreen} />
      <Stack.Screen name="StratigraphyDig" component={StratigraphyDigScreen} />
    </Stack.Navigator>
  );
}
