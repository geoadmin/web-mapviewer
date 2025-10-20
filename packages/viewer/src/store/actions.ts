export enum AppStoreActions {
    SetAppIsReady = 'setAppIsReady',
    SetMapModuleReady = 'setMapModuleReady',
}

export enum CesiumStoreActions {
    Set3dActive = 'set3dActive',
    SetShowConstructionsBuildings = 'setShowConstructionsBuildings',
    SetShowVegetation = 'setShowVegetation',
    SetShowLabels = 'setShowLabels',
    SetViewerReady = 'setViewerReady',
}

export enum DebugStoreActions {
    ToggleShowTileDebugInfo = 'toggleShowTileDebugInfo',
    ToggleShowLayerExtents = 'toggleShowLayerExtents',
    SetHasBaseUrlOverrides = 'setHasBaseUrlOverrides',
}

export enum DrawingStoreActions {
    SetDrawingMode = 'setDrawingMode',
    SetIsDrawingEditShared = 'setIsDrawingEditShared',
    SetIsDrawingModified = 'setIsDrawingModified',
    SetIsVisitWithAdminId = 'setIsVisitWithAdminId',
    LoadAvailableIconSets = 'loadAvailableIconSets',
    AddDrawingFeature = 'addDrawingFeature',
    DeleteDrawingFeature = 'deleteDrawingFeature',
    ClearDrawingFeatures = 'clearDrawingFeatures',
    SetDrawingFeatures = 'setDrawingFeatures',
    ToggleDrawingOverlay = 'toggleDrawingOverlay',
    SetDrawingName = 'setDrawingName',
    SetEditingMode = 'setEditingMode',
}

export enum FeatureStoreActions {
    SetSelectedFeatures = 'setSelectedFeatures',
    IdentifyFeatureAt = 'identifyFeatureAt',
    LoadMoreFeaturesForLayer = 'loadMoreFeaturesForLayer',
    ClearAllSelectedFeatures = 'clearAllSelectedFeatures',
    SetHighlightedFeatureId = 'setHighlightedFeatureId',
    ChangeFeatureCoordinates = 'changeFeatureCoordinates',
    ChangeFeatureGeometry = 'changeFeatureGeometry',
    ChangeFeatureTitle = 'changeFeatureTitle',
    ChangeFeatureDescription = 'changeFeatureDescription',
    ChangeFeatureShownDescriptionOnMap = 'changeFeatureShownDescriptionOnMap',
    ChangeFeatureColor = 'changeFeatureColor',
    ChangeFeatureTextColor = 'changeFeatureTextColor',
    ChangeFeatureIcon = 'changeFeatureIcon',
    ChangeFeatureIconSize = 'changeFeatureIconSize',
    ChangeFeatureTextPlacement = 'changeFeatureTextPlacement',
    ChangeFeatureTextOffset = 'changeFeatureTextOffset',
    ChangeFeatureTextSize = 'changeFeatureTextSize',
    ChangeFeatureIsDragged = 'changeFeatureIsDragged',
    UpdateFeatures = 'updateFeatures',
}

export enum GeolocationStoreActions {
    SetGeolocationActive = 'setGeolocationActive',
    ToggleGeolocation = 'toggleGeolocation',
    SetGeolocationTracking = 'setGeolocationTracking',
    SetGeolocationDenied = 'setGeolocationDenied',
    SetGeolocationPosition = 'setGeolocationPosition',
    SetGeolocationAccuracy = 'setGeolocationAccuracy',
    SetGeolocationData = 'setGeolocationData',
}

export enum I18nStoreActions {
    SetLang = 'setLang',
}

export enum LayerStoreActions {
    SetBackground = 'setBackground',
    SetPreviewYear = 'setPreviewYear',
    SetTimedLayerCurrentYear = 'setTimedLayerCurrentYear',
    SetLayerConfig = 'setLayerConfig',
    AddLayer = 'addLayer',
    SetLayers = 'setLayers',
    RemoveLayer = 'removeLayer',
    UpdateLayer = 'updateLayer',
    UpdateLayers = 'updateLayers',
    ClearLayers = 'clearLayers',
    ToggleLayerVisibility = 'toggleLayerVisibility',
    SetLayerVisibility = 'setLayerVisibility',
    SetLayerOpacity = 'setLayerOpacity',
    SetTimedLayerCurrentTimeEntry = 'setTimedLayerCurrentTimeEntry',
    MoveActiveLayerToIndex = 'moveActiveLayerToIndex',
    SetPreviewLayer = 'setPreviewLayer',
    ClearPreviewLayer = 'clearPreviewLayer',
    AddLayerError = 'addLayerError',
    RemoveLayerError = 'removeLayerError',
    SetKmlGpxLayerData = 'setKmlGpxLayerData',
    AddSystemLayer = 'addSystemLayer',
    UpdateSystemLayer = 'updateSystemLayer',
    RemoveSystemLayer = 'removeSystemLayer',
    LoadLayersConfig = 'loadLayersConfig',
}

export enum MapStoreActions {
    Click = 'click',
    ClearClick = 'clearClick',
    SetPinnedLocation = 'setPinnedLocation',
    SetPreviewedPinnedLocation = 'setPreviewedPinnedLocation',
    ClearPreviewPinnedLocation = 'clearPreviewPinnedLocation',
    ClearLocationPopupCoordinates = 'clearLocationPopupCoordinates',
    SetLocationPopupCoordinates = 'setLocationPopupCoordinates',
    SetPrintMode = 'setPrintMode',
    SetRectangleSelectionExtent = 'setRectangleSelectionExtent',
}

export enum PositionStoreActions {
    SetDisplayedFormat = 'setDisplayedFormat',
    SetZoom = 'setZoom',
    IncreaseZoom = 'increaseZoom',
    DecreaseZoom = 'decreaseZoom',
    ZoomToExtent = 'zoomToExtent',
    SetRotation = 'setRotation',
    SetAutoRotation = 'setAutoRotation',
    SetHasOrientation = 'setHasOrientation',
    SetCenter = 'setCenter',
    SetCrossHair = 'setCrossHair',
    SetCameraPosition = 'setCameraPosition',
    SetProjection = 'setProjection',
}

export enum PrintStoreActions {
    LoadPrintLayouts = 'loadPrintLayouts',
    SetSelectedScale = 'setSelectedScale',
    SetSelectedLayout = 'setSelectedLayout',
    SetPrintSectionShown = 'setPrintSectionShown',
    SetPrintExtent = 'setPrintExtent',
    SetPrintConfig = 'setPrintConfig',
}

export enum ProfileStoreActions {
    SetCurrentFeatureSegmentIndex = 'setCurrentFeatureSegmentIndex',
    SetProfileFeature = 'setProfileFeature',
}

export enum SearchStoreActions {
    SetAutoSelect = 'setAutoSelect',
    SetSearchQuery = 'setSearchQuery',
    SelectResultEntry = 'selectResultEntry',
}

export enum ShareStoreActions {
    SetShortLink = 'setShortLink',
    SetIsMenuSectionShown = 'setIsMenuSectionShown',
    GenerateShortLinks = 'generateShortLinks',
    CloseShareMenuAndRemoveShortLinks = 'closeShareMenuAndRemoveShortLinks',
    ToggleShareMenuSection = 'toggleShareMenuSection',
    ClearShortLinks = 'clearShortLinks',
}

export enum TopicsStoreActions {
    SetTopics = 'setTopics',
    SetTopicTree = 'setTopicTree',
    ChangeTopic = 'changeTopic',
    LoadTopic = 'loadTopic',
    SetTopicTreeOpenedThemesIds = 'setTopicTreeOpenedThemesIds',
    AddTopicTreeOpenedThemeId = 'addTopicTreeOpenedThemeId',
    RemoveTopicTreeOpenedThemeId = 'removeTopicTreeOpenedThemeId',
}

export enum UIStoreActions {
    SetSize = 'setSize',
    ToggleMenu = 'toggleMenu',
    CloseMenu = 'closeMenu',
    ToggleFullscreenMode = 'toggleFullscreenMode',
    SetEmbed = 'setEmbed',
    SetNoSimpleZoomEmbed = 'setNoSimpleZoomEmbed',
    SetShowLoadingBar = 'setShowLoadingBar',
    SetLoadingBarRequester = 'setLoadingBarRequester',
    ClearLoadingBarRequester = 'clearLoadingBarRequester',
    SetUiMode = 'setUiMode',
    ToggleImportCatalogue = 'toggleImportCatalogue',
    ToggleImportFile = 'toggleImportFile',
    SetHeaderHeight = 'setHeaderHeight',
    SetCompareRatio = 'setCompareRatio',
    SetCompareSliderActive = 'setCompareSliderActive',
    SetFeatureInfoPosition = 'setFeatureInfoPosition',
    SetTimeSliderActive = 'setTimeSliderActive',
    SetShowDisclaimer = 'setShowDisclaimer',
    AddErrors = 'addErrors',
    RemoveError = 'removeError',
    AddWarnings = 'addWarnings',
    RemoveWarning = 'removeWarning',
    SetShowDragAndDropOverlay = 'setShowDragAndDropOverlay',
    SetHideEmbedUI = 'setHideEmbedUI',
    SetForceNoDevSiteWarning = 'setForceNoDevSiteWarning',
}
