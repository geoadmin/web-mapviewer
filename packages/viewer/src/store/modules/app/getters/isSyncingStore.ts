import { AppStates, type AppStore } from "@/store/modules/app/types/app";

// This is a flag to tell if the layer config / topics  are loaded.
// We should rename it once there is less people working on every file
export default function isSyncingStore(this: AppStore): boolean {
    return this.appState === AppStates.SyncingStore
}
