import { useState, useContext, useEffect, useRef } from 'react';
import { NavigationContext } from '@react-navigation/core';

export function useNavigation() {
  return useContext(NavigationContext);
}

export function useNavigationParam(paramName) {
  return useNavigation().getParam(paramName);
}

export function useNavigationState() {
  return useNavigation().state;
}

export function useNavigationKey() {
  return useNavigation().state.key;
}

export function useNavigationEvents(handleEvt) {
  const navigation = useNavigation();
  const currentListenerRef = useRef(handleEvt);
  // We want to make sure to run the last closure/listener provided by the user
  useEffect(() => {
    currentListenerRef.current = handleEvt;
  });
  useEffect(
    () => {
      // We pass a stable listener to react-navigation event system, it will only change on state key change
      // We use a ref inside this listener to make sure we execute the last closure provided by the user
      // See https://github.com/react-navigation/react-navigation-hooks/issues/6#issuecomment-439713309
      const stableListener = (...args) => {
        currentListenerRef.current(...args);
      };
      const subs = [
        navigation.addListener('action', stableListener),
        navigation.addListener('willFocus', stableListener),
        navigation.addListener('didFocus', stableListener),
        navigation.addListener('willBlur', stableListener),
        navigation.addListener('didBlur', stableListener),
      ];
      return () => subs.forEach(sub => sub.remove());
    },
    [navigation.state.key]
  );
}

const emptyFocusState = {
  isFocused: false,
  isBlurring: false,
  isBlurred: false,
  isFocusing: false,
};
const didFocusState = { ...emptyFocusState, isFocused: true };
const willBlurState = { ...emptyFocusState, isBlurring: true };
const didBlurState = { ...emptyFocusState, isBlurred: true };
const willFocusState = { ...emptyFocusState, isFocusing: true };
const getInitialFocusState = isFocused =>
  isFocused ? didFocusState : didBlurState;
function focusStateOfEvent(eventName) {
  switch (eventName) {
    case 'didFocus':
      return didFocusState;
    case 'willFocus':
      return willFocusState;
    case 'willBlur':
      return willBlurState;
    case 'didBlur':
      return didBlurState;
    default:
      return null;
  }
}

export function useFocusState() {
  const navigation = useNavigation();
  const isFocused = navigation.isFocused();
  const [focusState, setFocusState] = useState(getInitialFocusState(isFocused));
  function handleEvt(e) {
    const newState = focusStateOfEvent(e.type);
    newState && setFocusState(newState);
  }
  useNavigationEvents(handleEvt);
  return focusState;
}
