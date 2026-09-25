import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';

import LoginScreen from './src/screens/LoginScreen';
import WorkerDashboard from './src/screens/WorkerDashboard';
import AdminDashboard from './src/screens/AdminDashboard';
import SubmitEntryScreen from './src/screens/SubmitEntryScreen';
import EntryDetailScreen from './src/screens/EntryDetailScreen';
import AdminEntryDetail from './src/screens/AdminEntryDetail';
import AdminReportScreen from './src/screens/AdminReportScreen';
import WorkwearRequestScreen from './src/screens/WorkwearRequestScreen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { state } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!state.isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : state.role === 'Admin' ? (
        <>
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
          <Stack.Screen name="AdminEntryDetail" component={AdminEntryDetail} />
          <Stack.Screen name="AdminReport" component={AdminReportScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="WorkerDashboard" component={WorkerDashboard} />
          <Stack.Screen name="SubmitEntry" component={SubmitEntryScreen} />
          <Stack.Screen name="EntryDetail" component={EntryDetailScreen} />
          <Stack.Screen name="WorkwearRequest" component={WorkwearRequestScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
