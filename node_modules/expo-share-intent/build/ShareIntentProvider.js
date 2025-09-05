import React, { useContext } from "react";
import useShareIntent, { SHAREINTENT_DEFAULTVALUE } from "./useShareIntent";
const ShareIntentContext = React.createContext({
    isReady: false,
    hasShareIntent: false,
    shareIntent: SHAREINTENT_DEFAULTVALUE,
    resetShareIntent: () => { },
    error: null,
});
export const ShareIntentContextConsumer = ShareIntentContext.Consumer;
export function useShareIntentContext() {
    return useContext(ShareIntentContext);
}
export function ShareIntentProvider({ options, children, }) {
    const { isReady, hasShareIntent, shareIntent, resetShareIntent, error } = useShareIntent(options);
    return (<ShareIntentContext.Provider value={{
            isReady,
            hasShareIntent,
            shareIntent,
            resetShareIntent,
            error,
        }}>
      {children}
    </ShareIntentContext.Provider>);
}
//# sourceMappingURL=ShareIntentProvider.js.map