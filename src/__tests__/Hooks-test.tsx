import { default as React, useState } from 'react';
import * as renderer from 'react-test-renderer';
import { createAppContainer } from '@react-navigation/native';
import {
  createSwitchNavigator,
  NavigationActions,
  NavigationEventPayload
} from '@react-navigation/core';
import {
  useNavigation,
  useNavigationParam,
  useNavigationState,
  useNavigationKey,
  useNavigationEvents,
  useFocusState,
} from '../Hooks';

const HomeScreen = () => {
  const { navigate } = useNavigation();
  navigate('Details', { from: 'Home' });
  return null;
};

const DetailsScreen = () => {
  const from = useNavigationParam('from');
  return <p>{from}</p>;
};

const OtherScreen = () => {
  const { routeName } = useNavigationState();
  return <p>{routeName}</p>;
};

const KeyScreen = () => {
  const key = useNavigationKey();
  return <p>{key}</p>;
};

const EventScreen = () => {
  const [events, setEvents] = useState([] as NavigationEventPayload[]);
  useNavigationEvents(evt => {
    // latest state on evt.state
    // prev state on evt.lastState
    // triggering navigation action on evt.action

    setEvents(events => [...events, evt]);
  });
  // evt.type is [will/did][Focus/Blur]
  return (
    <>
      {events.map((evt, i) => (
        <p key={i}>{evt.type}</p>
      ))}
    </>
  );
};

const FocusScreen = () => (
  <p>{useFocusState().isFocused ? 'Focused' : 'Not Focused'}</p>
);

const AppNavigator1 = createSwitchNavigator(
  {
    Home: HomeScreen, // { nav: { "index": 0 ...
    Details: DetailsScreen, // { nav: { "index": 1 ...
    Other: OtherScreen, // { nav: { "index": 2 ...
  },
  {
    initialRouteName: 'Home',
  }
);

const AppNavigator2 = createSwitchNavigator(
  {
    Other: OtherScreen,
    Key: KeyScreen,
    Event: EventScreen,
    Focus: FocusScreen,
  },
  {
    initialRouteName: 'Other',
  }
);

describe('AppNavigator1 Stack', () => {
  const App = createAppContainer(AppNavigator1);
  let navigationContainer;
  beforeEach(() => {
    navigationContainer = renderer.create(<App />);
  });

  test('useNavigation: Navigating to "DetailsScreen"', () => {
    const instance = navigationContainer.getInstance()
    expect(instance.state.nav).toMatchObject({ index: 1 });
  });

  test('useNavigationParam: Get passed parameter', () => {
    const children = navigationContainer.toJSON().children;
    expect(children).toContain('Home');
  });

  afterEach(() => {
    navigationContainer.unmount();
  });
});

describe('AppNavigator2 Stack', () => {
  const App = createAppContainer(AppNavigator2);
  let navigationContainer;
  beforeEach(() => {
    navigationContainer = renderer.create(<App />);
  });

  const eventTypes = ['willFocus', 'didFocus', 'willBlur', 'didBlur', 'action'];

  test('usenNavigationState: Get current route name', () => {
    const children = navigationContainer.toJSON().children;
    expect(children).toContain('Other');
  });

  test('usenNavigationKey: Get current key name', () => {
    const instance = navigationContainer.getInstance();
    instance.dispatch(NavigationActions.navigate({ routeName: 'Key' }));
    const children = navigationContainer.toJSON().children;
    expect(children).toContain('Key');
  });

  test('useNavigationEvents: Get current subscribed events', () => {
    const instance = navigationContainer.getInstance();
    instance.dispatch(NavigationActions.navigate({ routeName: 'Event' }));
    const elems = navigationContainer.toJSON();
    //navigationContainer.update();
    expect(eventTypes).toContain(elems[0].children.toString());
    expect(eventTypes).toContain(elems[1].children.toString());
  });

  test('useFocusState: Get focus state', () => {
    const instance = navigationContainer.getInstance();
    instance.dispatch(NavigationActions.navigate({ routeName: 'Focus' }));
    const children = navigationContainer.toJSON().children;
    expect(children).toContain('Focused');
  });

  afterEach(() => {
    navigationContainer.unmount();
  });
});
