import * as React from 'react';
import { useState, useEffect } from 'react';

import { Text, View, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MeteoJour from './components/views/meteoJour';
import Meteo5Jours from './components/views/meteo5jours';
import Meteo5JoursAdvanced from './components/views/meteo5joursAdvanced';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import SplanshScreen from './components/SplashScreen';

const iconJour = ({ color }) => (
  <FontAwesome5 name={'calendar-check'} size={20} color={color} />
);
const icon5Jours = ({ color }) => (
  <FontAwesome5 name={'calendar-minus'} size={20} color={color} />
);

const Tab = createBottomTabNavigator();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setShowSplash(false);
    }, 2000);
  }, []);

  if (showSplash) {
    return <SplanshScreen />;
  } else {
    return (
      <NavigationContainer>
        <Tab.Navigator
          tabBarOptions={{
            activeTintColor: 'white',
            activeBackgroundColor: 'tomato',
            inactiveTintColor: 'gray',
            style: { height: '8%' },
          }}>
          <Tab.Screen
            name="meteoJour"
            component={MeteoJour}
            options={{
              title: 'Méteo du jour',
              tabBarIcon: iconJour,
              
            }}
          />
          <Tab.Screen
            name="meteo5joursAdvanced"
            component={Meteo5JoursAdvanced}
            options={{
              title: 'Méteo 5 jours',
              tabBarIcon: icon5Jours,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
}

// <Tab.Screen name="meteo5jours" component={Meteo5Jours} options={{
//     title: 'Méteo 5 jours',
//     tabBarIcon: icon5Jours } } />
