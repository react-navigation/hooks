import { useState, useContext, useEffect, useCallback } from 'react';
import { NavigationContext } from '@react-navigation/core';
// TODO: move to "react-navigation" when https://github.com/react-navigation/react-navigation/pull/5276
// get merged
import {
  NavigationScreenProp,
  NavigationRoute,
  NavigationParams,
  NavigationEventCallback,
  NavigationEventPayload,
  EventType,
} from 'react-navigation-types-only';

export function useNavigation<S>(): NavigationScreenProp<S & NavigationRoute> {
  return useContext(NavigationContext as any);
}

export function useNavigationParam<T extends keyof NavigationParams>(
  paramName: T,
  fallbackValue?: NavigationParams[T]
) {
  const { getParam, setParams } = useNavigation();
  const setParamValue = useCallback(
    () => {
      return (newValue: NavigationParams[T]) =>
        setParams({ [paramName]: newValue });
    },
    [setParams]
  );
  return [
    fallbackValue ? getParam(paramName, fallbackValue) : getParam(paramName),
    setParamValue(),
  ];
}

export function useNavigationState() {
  return useNavigation().state;
}

export function useNavigationKey() {
  return useNavigation().state.key;
}

export function useNavigationEvents(handleEvt: NavigationEventCallback) {
  const navigation = useNavigation();
  useEffect(
    () => {
      const subsA = navigation.addListener('action', handleEvt);
      const subsWF = navigation.addListener('willFocus', handleEvt);
      const subsDF = navigation.addListener('didFocus', handleEvt);
      const subsWB = navigation.addListener('willBlur', handleEvt);
      const subsDB = navigation.addListener('didBlur', handleEvt);
      return () => {
        subsA.remove();
        subsWF.remove();
        subsDF.remove();
        subsWB.remove();
        subsDB.remove();
      };
    },
    // For TODO consideration: If the events are tied to the navigation object and the key
    // identifies the nav object, then we should probably pass [navigation.state.key] here, to
    // make sure react doesn't needlessly detach and re-attach this effect. In practice this
    // seems to cause troubles
    undefined
    // [navigation.state.key]
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
const getInitialFocusState = (isFocused: boolean) =>
  isFocused ? didFocusState : didBlurState;
function focusStateOfEvent(eventName: EventType) {
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
  function handleEvt(e: NavigationEventPayload) {
    const newState = focusStateOfEvent(e.type);
    newState && setFocusState(newState);
  }
  useNavigationEvents(handleEvt);
  return focusState;
}
