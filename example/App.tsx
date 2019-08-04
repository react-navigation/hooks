import React, { ComponentType } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { createStackNavigator } from 'react-navigation-stack';
import { useNavigation } from 'react-navigation-hooks';
import { createAppContainer } from 'react-navigation';

const Screen1 = () => (
  <View style={{ flex: 1, width: '100%', backgroundColor: 'grey' }}>
    <Text>Screen1</Text>
  </View>
);

const Screen2 = () => (
  <View style={{ flex: 1, width: '100%', backgroundColor: 'red' }}>
    <Text>Screen1</Text>
  </View>
);

const Screens: { [key: string]: ComponentType<any> } = {
  Screen1,
  Screen2,
};

const Home = () => {
  const { navigate } = useNavigation();
  return (
    <View style={{ flex: 1, width: '100%', backgroundColor: 'grey' }}>
      <Text>Home</Text>
      {Object.keys(Screens).map(screenName => {
        return (
          <TouchableOpacity
            onPress={() => navigate({ routeName: screenName })}
            style={{
              margin: 10,
              padding: 10,
              borderWidth: 1,
              borderRadius: 5,
              backgroundColor: 'blue',
            }}
          >
            <Text style={{ color: 'black' }}>{screenName}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const ScreenRoutes = Object.keys(Screens).map(screenName => {
  const Screen = Screens[screenName]!;
  return {
    screen: Screen,
    navigationOptions: {
      title: screenName,
    },
  };
}) as any;

const MainNavigator = createStackNavigator(
  {
    Home,
    ...ScreenRoutes,
  },
  {
    headerMode: 'none',
    mode: 'modal',
  }
);

const AppContainer = createAppContainer(MainNavigator);

export default AppContainer;
