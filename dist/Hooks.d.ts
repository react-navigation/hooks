import { NavigationScreenProp, NavigationRoute, NavigationParams, NavigationEventCallback } from 'react-navigation-types-only';
export declare function useNavigation<S>(): NavigationScreenProp<S & NavigationRoute>;
export declare function useNavigationParam<T extends keyof NavigationParams>(paramName: T): NavigationParams[T];
export declare function useNavigationState(): (import("react-navigation-types-only").NavigationLeafRoute<NavigationParams> & {
    params?: NavigationParams | undefined;
}) | (import("react-navigation-types-only").NavigationLeafRoute<NavigationParams> & import("react-navigation-types-only").NavigationState & {
    params?: NavigationParams | undefined;
});
export declare function useNavigationKey(): string;
export declare function useNavigationEvents(handleEvt: NavigationEventCallback): void;
export declare function useFocusState(): {
    isFocused: boolean;
    isBlurring: boolean;
    isBlurred: boolean;
    isFocusing: boolean;
};
