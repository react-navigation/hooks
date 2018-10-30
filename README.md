# React Navigation Hooks

[![npm version](https://badge.fury.io/js/react-navigation-hooks.svg)](https://badge.fury.io/js/react-navigation-hooks) [![CircleCI badge](https://circleci.com/gh/react-navigation/react-navigation-hooks/tree/master.svg?style=shield)](https://circleci.com/gh/react-navigation/react-navigation-hooks/tree/master) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://reactnavigation.org/docs/contributing.html)

## Docs

🏄‍♀️ Surfing the wave of React Hook hype with a few convenience hooks for `@react-navigation/core` v3. Destined to work on web, server, and React Native. Contributions welcome!

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
  const { routeName } = useNavigationState();
  return <p>My route name is {routeName}</p>;
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

    setEvents(events => [...events, evt.type]);
    // evt.type is [will/did][Focus/Blur]
  });
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

### useFocusState()

Convenient way of subscribing to events and observing focus state of the current screen.

```js
function MyFocusTag() {
  return <p>{useFocusState().isFocused ? 'Focused' : 'Not Focused'}</p>;
}
```

One of the following values will always be true in the focus state:

- isFocused
- isBlurring
- isBlurred
- isFocusing
