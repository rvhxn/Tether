import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import DashboardScreen from '../screens/DashboardScreen';
import ColliderScreen from '../screens/ColliderScreen';
import VaultScreen from '../screens/VaultScreen';
import PitchResultScreen from '../screens/PitchResultScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName: keyof typeof MaterialIcons.glyphMap;
                    if (route.name === 'Log') {
                        iconName = 'dashboard';
                    } else if (route.name === 'Tether') {
                        iconName = 'bolt';
                    } else if (route.name === 'Vault') {
                        iconName = 'folder';
                    } else {
                        iconName = 'help';
                    }
                    return <MaterialIcons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.light.primary_btn,
                tabBarInactiveTintColor: colors.light.secondary_text,
                tabBarStyle: {
                    backgroundColor: colors.light.background,
                    borderTopColor: colors.light.border,
                    paddingBottom: 5,
                    height: 60,
                },
                headerShown: false,
            })}
        >
            <Tab.Screen name="Log" component={DashboardScreen} />
            <Tab.Screen name="Tether" component={ColliderScreen} />
            <Tab.Screen name="Vault" component={VaultScreen} />
        </Tab.Navigator>
    );
}

export default function RootNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen
                    name="PitchResult"
                    component={PitchResultScreen}
                    options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
