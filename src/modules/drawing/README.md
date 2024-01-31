# Drawing module

Adds a toolbox that enables drawing on the map

## Handeling of the features styling

2 different representations are used for the styling of the openlayer features:

- **Style:** The actual styling of each Openlayers feature is done by a
  [style](https://openlayers.org/en/latest/apidoc/module-ol_style_Style-Style.html) object.
  When serializing the openlayers features as KML, this information will appear inside the
  `<Style>` tag and is readable by any mapviewer that supports KML.

TODO update this

- **EditableFeature:** We store on the openlayers feature directly the corresponding **EditableFeature**. When
  serializing the openlayers features as KML, this data will appear inside the `<ExtendedData>` tag. When the
  extended data is modified or when the openlayers feature is rerendered, openlayers will automatically call
  the [featurestylefunction](lib/style.js) that was previously defined with `setStyle(featureStyleFunction)`.
  This function will take the **EditableFeature** and generate the corresponding **Style**. When an
  openlayers feature is selected, its corresponding **EditableFeature** will be saved in the store so
  that it can be edited from everywhere. But this also means that is should ONLY be edited from the
  store when selected.

In the following is a list of files related to the handeling of feature styles:

- [Feature](https://openlayers.org/en/latest/apidoc/module-ol_Feature-Feature.html) Openlayers
  representation of the feature. Stores the **EditableFeature** and the **Style** of a feature.
- [EditableFeature](../../api/features.api.js): Representation of a selected feature in the store. Also
  stores its style in a manner that is easily modifiable by the rest of the application.
- [DrawingSelectInteraction.vue](components/DrawingSelectInteraction.vue): If a **feature** is
  selected, puts the corresponding [EditableFeature](../../api/features.api.js) in the store.
  Also triggers an update of the **Style** when the corresponding [EditableFeature](../../api/features.api.js)
  is modified.
- [featurestylefunction](lib/style.js): Updates the **Style** when the corresponding **EditableFeature**
  is modified or when the openlayers feature must be rerendered.
