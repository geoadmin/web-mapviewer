export enum OnlineMode {
    // No online/offline mode selected
    None = 'NONE',
    // KML is saved online
    Online = 'ONLINE',
    // KML is saved only locally
    Offline = 'OFFLINE',
    // KML is saved online but an Offline drawing is also currently open
    OnlineWhileOffline = 'ONLINE_WHILE_OFFLINE',
    // KML is saved locally but an Online drawing is also currently open
    OfflineWhileOnline = 'OFFLINE_WHILE_ONLINE',
}