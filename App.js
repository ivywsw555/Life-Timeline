import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MyGame from './component/MyGame';
import ChatScreen from './component/ChatScreen';
import EventPick from './component/EventPick';
import OtherScreen from './component/OtherScreen';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DetailPage from './component/DetailPage';
import ChatDetailScreen from './component/ChatDetailScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { enableScreens } from 'react-native-screens';
import LifeTeller from './component/LifeTeller';
import CategoryDetailsScreen from './component/CategoryDetails';
import CategoryScreen from './component/EventPick';

const Tab = createBottomTabNavigator();
const ParallelStack = createStackNavigator();
const ChatStack = createStackNavigator();
const EventStack = createStackNavigator();

function ParallelStackScreen() {
  return (
    <ParallelStack.Navigator>
      <ParallelStack.Screen name="Explore" component={MyGame} />
      <ParallelStack.Screen name="DetailPage" component={DetailPage} />
      <ParallelStack.Screen name="LifeTeller" component={LifeTeller} />
    </ParallelStack.Navigator>
  );
}
function ChatStackScreen() {
  return (
    <ChatStack.Navigator>
      <ChatStack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: false }} />
      <ChatStack.Screen name="ChatDetailScreen" component={ChatDetailScreen} options={{ title: 'ChatDetailScreen' }} />
    </ChatStack.Navigator>
  );
}

function EventStackScreen() {
  return (
    <EventStack.Navigator>
      <EventStack.Screen name="CategoryScreen" component={CategoryScreen} options={{ headerShown: false }} />
      <EventStack.Screen name="CategoryDetailsScreen" component={CategoryDetailsScreen} options={{ title: 'CategoryDetailsScreen' }} />
    </EventStack.Navigator>
  );
}
const App = () => {
  // useEffect(() => {
  //   enableScreens();

  //   const handleAppStateChange = async (nextAppState) => {
  //     if (nextAppState === 'active') {

  //       try {
  //         await AsyncStorage.clear();
  //         console.log('AsyncStorage has been cleared!');
  //       } catch (error) {
  //         console.error('Error clearing AsyncStorage:', error);
  //       }
  //     }
  //   };

  //   AppState.addEventListener('change', handleAppStateChange);

  //   return () => {
  //     AppState.removeEventListener('change', handleAppStateChange);
  //   };
  // }, []);
  return (

    <NavigationContainer>
      <Tab.Navigator screenOptions={{
        tabBarStyle: { backgroundColor: 'orange' },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'black',
      }}>
        <Tab.Screen name="ParallelLife" component={ParallelStackScreen} options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="games" color={color} size={size} />
          ), showLabel: false
        }} />
        <Tab.Screen name="Chat" component={ChatStackScreen} options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="chat" color={color} size={size} />
          ), showLabel: false
        }} />
        <Tab.Screen name="Discovery" component={EventStackScreen} options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="event" color={color} size={size} />
          ),
        }} />
        <Tab.Screen name="Your Life" component={OtherScreen} options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" color={color} size={size} />
          ),
        }} />
      </Tab.Navigator>
    </NavigationContainer >
  );
};

export default App;
