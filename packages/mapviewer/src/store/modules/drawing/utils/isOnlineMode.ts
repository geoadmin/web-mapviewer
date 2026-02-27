import type { OnlineMode } from '@/store/modules/drawing/types'

export function isOnlineMode(onlineMode: OnlineMode, includingNone: boolean = false): boolean {
    return (
        onlineMode === 'ONLINE' ||
        onlineMode === 'ONLINE_WHILE_OFFLINE' ||
        (includingNone && onlineMode === 'NONE')
    )
}
