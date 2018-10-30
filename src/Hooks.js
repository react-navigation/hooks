import { useState, useContext, useEffect } from 'react';
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
  useEffect(
    () => {
      const sWF = navigation.addListener('willFocus', handleEvt);
      const sDF = navigation.addListener('didFocus', handleEvt);
      const sWB = navigation.addListener('willBlur', handleEvt);
      const sDB = navigation.addListener('didBlur', handleEvt);
      return () => {
        sWF.remove();
        sDF.remove();
        sWB.remove();
        sDB.remove();
      };
    },
    // For TODO consideration: If the events are tied to the navigation object and the key
    // identifies the nav object, then we should probably pass [navigation.state.key] here, to
    // make sure react doesn't needlessly detach and re-attach this effect. Need more thorough
    // testing to be sure..
    undefined
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
    default:
      return didBlurState;
  }
}

export function useFocusState() {
  const navigation = useNavigation();
  const isFocused = navigation.isFocused();
  const [focusState, setFocusState] = useState(getInitialFocusState(isFocused));
  function handleEvt(e) {
    setFocusState(focusStateOfEvent(e.type));
  }
  useNavigationEvents(handleEvt);
  return focusState;
}
