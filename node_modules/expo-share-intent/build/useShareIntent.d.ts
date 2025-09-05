import { ShareIntent, ShareIntentOptions } from "./ExpoShareIntentModule.types";
export declare const SHAREINTENT_DEFAULTVALUE: ShareIntent;
export declare const SHAREINTENT_OPTIONS_DEFAULT: ShareIntentOptions;
export default function useShareIntent(options?: ShareIntentOptions): {
    isReady: boolean;
    hasShareIntent: boolean;
    shareIntent: ShareIntent;
    resetShareIntent: (clearNativeModule?: boolean) => void;
    error: string | null;
};
//# sourceMappingURL=useShareIntent.d.ts.map