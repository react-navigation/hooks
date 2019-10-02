# React Navigation Hooks

[![npm version](https://badge.fury.io/js/react-navigation-hooks.svg)](https://badge.fury.io/js/react-navigation-hooks) [![npm downloads](https://img.shields.io/npm/dm/react-navigation-hooks.svg)](https://www.npmjs.com/package/react-navigation-hooks) [![CircleCI badge](https://circleci.com/gh/react-navigation/hooks/tree/master.svg?style=shield)](https://circleci.com/gh/react-navigation/hooks/tree/master) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://reactnavigation.org/docs/contributing.html)

🏄‍♀️ Surfing the wave of React Hook hype with a few convenience hooks for `@react-navigation/core` v3/v4. Destined to work on web, server, and React Native. Contributions welcome!

**IMPORTANT**: [react-navigation v5](https://github.com/react-navigation/navigation-ex) is already on its way and is a full rewrite (including hooks). This project will not live past v4, and will try to make the migration path from v4 to v5 easy by not introducing any new hook that won't be in v5.

## Examples (web only so far)

See an example web app which uses react-navigation and hooks on the client and the server:

https://github.com/react-navigation/web-server-example

## Docs

`yarn add react-navigation-hooks`

`import * from 'react-navigation-hooks'`

### useNavigation()

This is the main convenience hook. It provides the regular navigation prop, as you'd get via the screen prop or by using `withNavigation`.

You can use the navigate functionality anywhere in your app:

```js
function MyLinkButton() {
  // be careful to never call useNavigation in the press callback. Call hooks directly from the render function!
  const { navigate } = useNavigation();
  return (
    <Button
      onPress={() => {
        navigate('Home');
      }}
      title="Go Home"
    />
  );
}
```

### useNavigationParam(paramName)

Access a param for the current navigation state

```js
function MyScreen() {
  const name = useNavigationParam('name');
  return <p>name is {name}</p>;
}
```

Literally the same as `useNavigation().getParam(paramName)`

### useNavigationState()

Access the navigation state of the current route, or if you're in a navigator view, access the navigation state of your sub-tree.

```js
function MyScreen() {
  const { routeName } = useNavigationState();
  return <p>My route name is {routeName}</p>;
}
```

Literally the same as `useNavigation().state`

### useNavigationKey()

Convenient way to access the key of the current route.

Literally the same as `useNavigationState().key`

### useNavigationEvents(handler)

Subscribe to navigation events in the current route context.

```js
function ReportNavigationEvents() {
  const [events, setEvents] = useState([]);
  useNavigationEvents(evt => {
    // latest state on evt.state
    // prev state on evt.lastState
    // triggering navigation action on evt.action

    setEvents(events => [...events, evt]);
  });
  // evt.type is [will/did][Focus/Blur]
  return (
    <>
      {events.map(evt => (
        <p>{evt.type}</p>
      ))}
    </>
  );
}
```

The event payload will be the same as provided by `addListener`, as documented here: https://reactnavigation.org/docs/en/navigation-prop.html#addlistener-subscribe-to-updates-to-navigation-lifecycle

### useIsFocused()

Convenient way to know if the screen currently has focus.

```js
function MyScreen() {
  const isFocused = useIsFocused();
  return <Text>{isFocused ? 'Focused' : 'Not Focused'}</Text>;
}
```

### useFocusEffect(callback)

Permit to execute an effect when the screen takes focus, and cleanup the effect when the screen loses focus.

```js
function MyScreen() {
  useFocusEffect(useCallback(() => {
    console.debug("screen takes focus");
    return () => console.debug("screen loses focus");
  }, []));
  return <View>...</View>;
}
```

**NOTE**: To avoid the running the effect too often, it's important to wrap the callback in useCallback before passing it to `useFocusEffect` as shown in the example. The effect will re-execute everytime the callback changes if the screen is focused.

`useFocusEffect` can be helpful to refetch some screen data on params changes:

```js
function Profile({ userId }) {
  const [user, setUser] = React.useState(null);

  const fetchUser = React.useCallback(() => {
    const request = API.fetchUser(userId).then(
      data => setUser(data),
      error => alert(error.message)
    );

    return () => request.abort();
  }, [userId]);

  useFocusEffect(fetchUser);

  return <ProfileContent user={user} />;
}
```


`useFocusEffect` can be helpful to handle hardware back behavior on currently focused screen:

```js 
const useBackHandler = (backHandler: () => boolean) => {
  useFocusEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', backHandler);
    return () => subscription.remove();
  });
};
```




### useFocusState()

**deprecated**: this hook does not exist in v5, you should rather use `useIsFocused`


Convenient way of subscribing to events and observing focus state of the current screen.

```js
function MyScreen() {
  const focusState = useFocusState();
  return <Text>{focusState.isFocused ? 'Focused' : 'Not Focused'}</Text>;
}
```

One (always, and only one) of the following values will be true in the focus state:

- isFocused
- isBlurring
- isBlurred
- isFocusing

