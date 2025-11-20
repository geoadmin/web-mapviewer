import { OnlineMode } from '@/store/modules/drawing/types/OnlineMode.enum'

export function isOnlineMode(onlineMode: OnlineMode, includingNone: boolean = false): boolean {
    return onlineMode === OnlineMode.Online || onlineMode === OnlineMode.OnlineWhileOffline || (includingNone && onlineMode === OnlineMode.None)
}