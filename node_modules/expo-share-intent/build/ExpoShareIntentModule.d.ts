import { Subscription } from "expo-modules-core";
import { ChangeEventPayload, StateEventPayload } from "./ExpoShareIntentModule.types";
declare const ExpoShareIntentModule: any;
export default ExpoShareIntentModule;
export declare function getShareIntent(url?: string): string;
export declare function clearShareIntent(key: string): any;
export declare function hasShareIntent(key: string): boolean;
export declare function addErrorListener(listener: (event: ChangeEventPayload) => void): Subscription | null;
export declare function addChangeListener(listener: (event: ChangeEventPayload) => void): Subscription | null;
export declare function addStateListener(listener: (event: StateEventPayload) => void): Subscription | null;
//# sourceMappingURL=ExpoShareIntentModule.d.ts.map