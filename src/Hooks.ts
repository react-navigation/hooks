import {
  useState,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from 'react';

import {
  NavigationContext,
  NavigationScreenProp,
  NavigationRoute,
  NavigationParams,
  NavigationEventCallback,
  NavigationEventPayload,
  EventType,
} from 'react-navigation';

function useNavigationSafe<S>(): NavigationScreenProp<S & NavigationRoute> {
  const navigation = useContext(NavigationContext) as any; // TODO typing?

  if (!navigation) {
    throw new Error(
      "react-navigation hooks require a navigation context but it couldn't be found. " +
        "Make sure you didn't forget to create and render the react-navigation app container. " +
        'If you need to access an optional navigation object, you can useContext(NavigationContext), which may return'
    );
  }

  return navigation;
}

function useStableCallback(cb: (...args: any) => any) {
  const ref = useRef(cb);

  useLayoutEffect(() => {
    ref.current = cb;
  }, [cb]);

  return useCallback((...args) => ref.current(...args), [ref]);
};


type NavigationCommonActions<S> = Pick<
  NavigationScreenProp<S & NavigationRoute>,
  | 'navigate'
  | 'goBack'
  | 'addListener'
  | 'isFocused'
  | 'setParams'
  | 'getParam'
  | 'dispatch'
  | 'dangerouslyGetParent'
  | 'isFirstRouteInParent'
>;

type NavigationDrawerActions<S> = Pick<
  NavigationScreenProp<S & NavigationRoute>,
  'openDrawer' | 'closeDrawer' | 'toggleDrawer'
>;

type NavigationStackActions<S> = Pick<
  NavigationScreenProp<S & NavigationRoute>,
  'push' | 'pop' | 'popToTop' | 'replace' | 'reset' | 'dismiss'
>;

type NavigationActions<S> = NavigationCommonActions<S> &
  Partial<NavigationDrawerActions<S>> &
  Partial<NavigationStackActions<S>>;

type Navigation<S> = NavigationActions<S> &
  Omit<NavigationScreenProp<S & NavigationRoute>, keyof NavigationActions<S>>;

/*
  This is intended to solve: https://github.com/react-navigation/hooks/issues/40
  Read more here: https://github.com/facebook/react/issues/16956
*/
function useStableActions<S>(navigation: NavigationScreenProp<S & NavigationRoute>): NavigationActions<S & NavigationRoute> {
  // common actions
  const navigate = useStableCallback(navigation.navigate);
  const goBack = useStableCallback(navigation.goBack);
  const addListener = useStableCallback(navigation.addListener);
  const isFocused = useStableCallback(navigation.isFocused);
  const setParams = useStableCallback(navigation.setParams);
  const getParam = useStableCallback(navigation.getParam);
  const dispatch = useStableCallback(navigation.dispatch);
  const dangerouslyGetParent = useStableCallback(navigation.dangerouslyGetParent);
  const isFirstRouteInParent = useStableCallback(navigation.isFirstRouteInParent);

  // drawer navigator, actions
  const openDrawer = useStableCallback(navigation.openDrawer);
  const closeDrawer = useStableCallback(navigation.closeDrawer);
  const toggleDrawer = useStableCallback(navigation.toggleDrawer);

  // stack navigator actions
  const push = useStableCallback(navigation.push);
  const pop = useStableCallback(navigation.pop);
  const popToTop = useStableCallback(navigation.popToTop);
  const replace = useStableCallback(navigation.replace);
  const reset = useStableCallback(navigation.reset);
  const dismiss = useStableCallback(navigation.dismiss);

  let result: NavigationActions<S & NavigationRoute> = {
    // common actions
    navigate,
    goBack,
    addListener,
    isFocused,
    setParams,
    getParam,
    dispatch,
    dangerouslyGetParent,
    isFirstRouteInParent,

    // drawer navigator actions
    openDrawer,
    closeDrawer,
    toggleDrawer,

    // stack navigator actions
    push,
    pop,
    popToTop,
    replace,
    reset,
    dismiss,
  };

  if (navigation.openDrawer) {
    result = {
      ...result,

      // drawer navigator actions
      openDrawer,
      closeDrawer,
      toggleDrawer,
    }
  }

  if (navigation.push) {
    result = {
      ...result,

      // stack navigator actions
      push,
      pop,
      popToTop,
      replace,
      reset,
      dismiss,
    }
  }

  return result;
}

export function useNavigation<S>(): Navigation<S> {
  const navigation = useNavigationSafe<S>()
  const actions = useStableActions<S>(navigation);

  return {
    ...navigation,
    ...actions,
  };
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

// Useful to access the latest user-provided value
function useGetter<S>(value: S): (() => S) {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return useCallback(() => ref.current, [ref]);
};

export function useNavigationEvents(callback: NavigationEventCallback) {
  const navigation = useNavigation();

  // Closure might change over time and capture some variables
  // It's important to fire the latest closure provided by the user
  const getLatestCallback = useGetter(callback);

  // It's important to useLayoutEffect because we want to ensure we subscribe synchronously to the mounting
  // of the component, similarly to what would happen if we did use componentDidMount
  // (that we use in <NavigationEvents/>)
  // When mounting/focusing a new screen and subscribing to focus, the focus event should be fired
  // It wouldn't fire if we did subscribe with useEffect()
  useLayoutEffect(() => {
    const subscribedCallback: NavigationEventCallback = event => {
      const latestCallback = getLatestCallback();
      latestCallback(event);
    };

    const subs = [
      // TODO should we remove "action" here? it's not in the published typedefs
      navigation.addListener('action' as any, subscribedCallback),
      navigation.addListener('willFocus', subscribedCallback),
      navigation.addListener('didFocus', subscribedCallback),
      navigation.addListener('willBlur', subscribedCallback),
      navigation.addListener('didBlur', subscribedCallback),
    ];
    return () => {
      subs.forEach(sub => sub.remove());
    };
  }, [navigation.state.key]);
}

export interface FocusState {
  isFocused: boolean;
  isBlurring: boolean;
  isBlurred: boolean;
  isFocusing: boolean;
}

const emptyFocusState: FocusState = {
  isFocused: false,
  isBlurring: false,
  isBlurred: false,
  isFocusing: false,
};
const didFocusState: FocusState = { ...emptyFocusState, isFocused: true };
const willBlurState: FocusState = { ...emptyFocusState, isBlurring: true };
const didBlurState: FocusState = { ...emptyFocusState, isBlurred: true };
const willFocusState: FocusState = { ...emptyFocusState, isFocusing: true };

function nextFocusState(
  eventName: EventType,
  currentState: FocusState
): FocusState {
  switch (eventName) {
    case 'willFocus':
      return {
        ...willFocusState,
        // /!\ willFocus will fire on screen mount, while the screen is already marked as focused.
        // In case of a new screen mounted/focused, we want to avoid a isFocused = true => false => true transition
        // So we don't put the "false" here and ensure the attribute remains as before
        // Currently I think the behavior of the event system on mount is not very well specified
        // See also https://twitter.com/sebastienlorber/status/1166986080966578176
        isFocused: currentState.isFocused,
      };
    case 'didFocus':
      return didFocusState;
    case 'willBlur':
      return willBlurState;
    case 'didBlur':
      return didBlurState;
    default:
      // preserve current state for other events ("action"?)
      return currentState;
  }
}

export function useFocusState() {
  const navigation = useNavigation();

  const [focusState, setFocusState] = useState<FocusState>(() => {
    return navigation.isFocused() ? didFocusState : didBlurState;
  });

  useNavigationEvents((e: NavigationEventPayload) => {
    setFocusState(currentFocusState =>
      nextFocusState(e.type, currentFocusState)
    );
  });

  return focusState;
}

type EffectCallback = (() => void) | (() => () => void);

// Inspired by same hook from react-navigation v5
// See https://github.com/react-navigation/hooks/issues/39#issuecomment-534694135
export const useFocusEffect = (callback: EffectCallback) => {
  const navigation = useNavigation();

  useEffect(() => {
    let isFocused = false;
    let cleanup: (() => void) | void;

    if (navigation.isFocused()) {
      cleanup = callback();
      isFocused = true;
    }

    const focusSubscription = navigation.addListener('willFocus', () => {
      // If callback was already called for focus, avoid calling it again
      // The focus event may also fire on intial render, so we guard against runing the effect twice
      if (isFocused) {
        return;
      }

      cleanup && cleanup();
      cleanup = callback();
      isFocused = true;
    });

    const blurSubscription = navigation.addListener('willBlur', () => {
      cleanup && cleanup();
      cleanup = undefined;
      isFocused = false;
    });

    return () => {
      cleanup && cleanup();
      focusSubscription.remove();
      blurSubscription.remove();
    };
  }, [callback, navigation]);
};

export const useIsFocused = () => {
  const navigation = useNavigation();
  const getNavigation = useGetter(navigation);
  const [focused, setFocused] = useState(navigation.isFocused);

  useEffect(() => {
    const nav = getNavigation();
    const focusSubscription = nav.addListener('willFocus', () =>
      setFocused(true)
    );
    const blurSubscription = nav.addListener('willBlur', () =>
      setFocused(false)
    );
    return () => {
      focusSubscription.remove();
      blurSubscription.remove();
    };
  }, [getNavigation]);

  return focused;
};
