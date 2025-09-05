import React from "react";
import { ShareIntent, ShareIntentOptions } from "./ExpoShareIntentModule.types";
type ShareIntentContextState = {
    isReady: boolean;
    hasShareIntent: boolean;
    shareIntent: ShareIntent;
    resetShareIntent: (clearNativeModule?: boolean) => void;
    error: string | null;
};
export declare const ShareIntentContextConsumer: React.Consumer<ShareIntentContextState>;
export declare function useShareIntentContext(): ShareIntentContextState;
export declare function ShareIntentProvider({ options, children, }: {
    options?: ShareIntentOptions;
    children: any;
}): React.JSX.Element;
export {};
//# sourceMappingURL=ShareIntentProvider.d.ts.map