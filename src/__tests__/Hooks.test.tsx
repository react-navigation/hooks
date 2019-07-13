import { default as React, useState } from 'react';
import * as renderer from 'react-test-renderer';

import {
  createSwitchNavigator,
  createAppContainer,
  NavigationEventPayload,
  NavigationActions,
} from 'react-navigation';

import {
  useNavigation,
  useNavigationParam,
  useNavigationState,
  useNavigationKey,
  useNavigationEvents,
  useFocusState,
} from '../Hooks';

interface DetailsScreenParams {
  from: string;
}

const HomeScreen = () => {
  const { navigate } = useNavigation();
  const params: DetailsScreenParams = { from: 'Home' };
  return navigate('Details', params);
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
  let navigationContainer: any;
  beforeEach(() => {
    navigationContainer = renderer.create(<App />);
  });

  it('useNavigation: Navigating to "DetailsScreen"', () => {
    const instance = navigationContainer.getInstance();
    expect(instance.state.nav).toMatchObject({ index: 1 });
  });

  it('useNavigationParam: Get passed parameter', () => {
    const children = navigationContainer.toJSON().children;
    expect(children).toContain('Home');
  });

  afterEach(() => {
    navigationContainer.unmount();
  });
});

describe('AppNavigator2 Stack', () => {
  const App = createAppContainer(AppNavigator2);
  let navigationContainer: any;
  beforeEach(() => {
    navigationContainer = renderer.create(<App />);
  });

  const eventTypes = ['willFocus', 'didFocus', 'willBlur', 'didBlur', 'action'];

  it('usenNavigationState: Get current route name', () => {
    const children = navigationContainer.toJSON().children;
    expect(children).toContain('Other');
  });

  it('usenNavigationKey: Get current key name', () => {
    const instance = navigationContainer.getInstance();
    instance.dispatch(NavigationActions.navigate({ routeName: 'Key' }));
    const children = navigationContainer.toJSON().children;
    expect(children).toContain('Key');
  });

  it('useNavigationEvents: Get current subscribed events', () => {
    const instance = navigationContainer.getInstance();
    instance.dispatch(NavigationActions.navigate({ routeName: 'Event' }));
    const elems = navigationContainer.toJSON();
    expect(eventTypes).toContain(elems[0].children.toString());
    expect(eventTypes).toContain(elems[1].children.toString());
  });

  it('useFocusState: Get focus state', () => {
    const instance = navigationContainer.getInstance();
    instance.dispatch(NavigationActions.navigate({ routeName: 'Focus' }));
    const children = navigationContainer.toJSON().children;
    expect(children).toContain('Focused');
  });

  afterEach(() => {
    navigationContainer.unmount();
  });
});
