// ============================================================
// DigDeep – Logbook Stack Navigator
// Routes: LogbookMain → FieldLogbookScreen
//         FieldCardExport → FieldCardExportScreen
// ============================================================

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import FieldLogbookScreen from '../screens/logbook/FieldLogbookScreen';
import FieldCardExportScreen from '../screens/logbook/FieldCardExportScreen';
import type { LogbookStackParamList } from '../types';

const Stack = createNativeStackNavigator<LogbookStackParamList>();

export default function LogbookNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="LogbookMain" component={FieldLogbookScreen} />
      <Stack.Screen name="FieldCardExport" component={FieldCardExportScreen} />
    </Stack.Navigator>
  );
}
