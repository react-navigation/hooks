import { useState, useContext, useEffect } from 'react';
import {
  NavigationContext,
  NavigationScreenPropChild,
  NavigationParams,
  NavigationEventCallback,
  NavigationEventPayload,
  NavigationEventType,
  NavigationStateRoute
} from '@react-navigation/core';

export type NavigationEventFocusStateType =
  'isFocused' | 'isBlurring' | 'isBlurred' | 'isFocusing';

export type NavigationEventFocusState = typeof emptyFocusState;

export function useNavigation(): NavigationScreenPropChild<NavigationStateRoute> {
  return useContext(NavigationContext as any);
}

export function useNavigationParam<T extends keyof NavigationParams>(
  paramName: T
) {
  return useNavigation().getParam(paramName);
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

const emptyFocusState: { [K in NavigationEventFocusStateType]: boolean } = {
  isFocused: false,
  isBlurring: false,
  isBlurred: false,
  isFocusing: false,
};

type FocusState = NavigationEventFocusState;

const didFocusState: FocusState  = { ...emptyFocusState, isFocused: true };
const willBlurState: FocusState  = { ...emptyFocusState, isBlurring: true };
const didBlurState:  FocusState  = { ...emptyFocusState, isBlurred: true };
const willFocusState: FocusState = { ...emptyFocusState, isFocusing: true };

const getInitialFocusState = (isFocused: boolean): FocusState =>
  isFocused ? didFocusState : didBlurState;

function focusStateOfEvent(eventName: NavigationEventType): FocusState | null {
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

export function useFocusState(): NavigationEventFocusState {
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
