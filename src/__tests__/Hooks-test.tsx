import * as React from 'react';
import { View, Button } from 'react-native';
import * as renderer from 'react-test-renderer';
// TODO: Remove "react-navigation-types-only" when https://github.com/react-navigation/react-navigation/pull/5276
// get merged
// import { NavigationScreenProp } from "react-navigation-types-only";
import { createStackNavigator } from '@react-navigation/core';
import { createAppContainer } from '@react-navigation/native';
import {
  useNavigation
} from '../../';

const HomeScreen = () => {
  const { navigate } = useNavigation();
  return <Button title="Go to Details" onPress={() => navigate('Details')} />;
}

const DetailsScreen = () => <View />;

const AppNavigator = createStackNavigator(
  {
    Home: HomeScreen,
    Details: DetailsScreen,
  },
  {
    initialRouteName: 'Home',
  },
);

const App = createAppContainer(AppNavigator);

describe('Navigating to a new screen', () => {
  it('renders successfully', () => {
    const rendered = renderer.create(<App />);
    let tree = rendered.toJSON();
    expect(tree).toMatchSnapshot();

    // Manually trigger onPress
    tree!.props.onPress();
    tree = rendered.toJSON();

    expect(rendered).toMatchSnapshot();
  });
});
