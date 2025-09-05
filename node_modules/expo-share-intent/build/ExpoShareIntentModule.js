import { requireOptionalNativeModule, EventEmitter, } from "expo-modules-core";
import { getShareExtensionKey } from "./utils";
// Import the native module. it will be resolved on native platforms to ExpoShareIntentModule.ts
// It loads the native module object from the JSI or falls back to
// the bridge module (from NativeModulesProxy) if the remote debugger is on.
const ExpoShareIntentModule = requireOptionalNativeModule("ExpoShareIntentModule");
export default ExpoShareIntentModule;
export function getShareIntent(url = "") {
    return ExpoShareIntentModule?.getShareIntent(url);
}
export function clearShareIntent(key) {
    return ExpoShareIntentModule?.clearShareIntent(key ?? getShareExtensionKey());
}
export function hasShareIntent(key) {
    return ExpoShareIntentModule?.hasShareIntent(key ?? getShareExtensionKey());
}
const emitter = ExpoShareIntentModule
    ? new EventEmitter(ExpoShareIntentModule)
    : null;
export function addErrorListener(listener) {
    return emitter?.addListener("onError", listener) || null;
}
export function addChangeListener(listener) {
    return emitter?.addListener("onChange", listener) || null;
}
export function addStateListener(listener) {
    return (emitter?.addListener("onStateChange", listener) || null);
}
//# sourceMappingURL=ExpoShareIntentModule.js.map