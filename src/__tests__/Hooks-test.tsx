import * as React from 'react';
import { View, Button } from 'react-native';
import * as renderer from 'react-test-renderer';
import { createSwitchNavigator } from '@react-navigation/core';
import { createAppContainer } from '@react-navigation/native';

import {
  useNavigation
} from '../../dist/Hooks';

const HomeScreen = () => {
  const { navigate } = useNavigation();
  return <Button title="Go to Details" onPress={() => navigate('Details')} />;
}

const DetailsScreen = () => <View />;

const AppNavigator = createSwitchNavigator(
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
    //tree!.props.onPress();
    tree = rendered.toJSON();

    expect(rendered).toMatchSnapshot();
  });
});
