# URL parameter structure

> Status: accepted

> Date: 16.03.2021

## Context

The mapviewer application is configured with several URL parameters. The current format for the layer configuration looks as follows (example for topic "Snow"):

```
...
layers=ch.swisstopo.pixelkarte-farbe-winter,ch.swisstopo.hangneigung-ueber_30,ch.swisstopo-karto.hangneigung,ch.bafu.wrz-jagdbanngebiete_select,ch.bafu.wrz-wildruhezonen_portal,ch.bazl.gebirgslandeplaetze,ch.swisstopo.schneeschuhwandern,ch.swisstopo-karto.schneeschuhrouten,ch.swisstopo-karto.skitouren,ch.swisstopo.skitourenkarte-50.metadata,ch.bav.haltestellen-oev&
layers_opacity=0.85,0.5,0.2,0.6,0.6,1,0.7,0.8,0.8,1,1&
layers_visibility=true,false,true,true,true,false,true,true,true,false,false
...
```

and including layers with different timestamps probably also

```
layers_timestamp=18641231,,,
```

The current format has some limitations:

- confusing for configurations in case of multiple layers (order determines attribution)
- a lot of unnecessary characters used to represent default values

## Decision

### Generic Pattern for Layer Configuration

The new format looks as follows (in the generic form):

```
layers={layerID1},{visibility=t|f},{opacity=%f};{layerID2},{visibility=t|f},{opacity=%f}
```

### Examples

- one layer without changing defaults for opacity defined in catalog and for visibility in topics (e.g. opacity=0.8, visibility=true)
  - `layers={layerID1}`
- two layers without changing defaults
  - `layers={layerID1};{layerID2}`
- one layer with changed visibility
  - `layers={layerID1},f`
- one layer with changed opacity and visibility
  - `layers={layerID1},f,0.7`
- one layer with default visibility and changed opacity
  - `layers={layerID1},,0.7`
- two layers with changed visibility and opacity
  - `layers={layerID1},t,0.7;{layerID2},f,0.5`

In case a wrong format is given, the errors are printed on the console.

The above example boils down to the following (given that all opacity values are the defaults defined in the topic):

```
...
layers=ch.swisstopo.pixelkarte-farbe-winter;
ch.swisstopo.hangneigung-ueber_30,f;
ch.swisstopo-karto.hangneigung;
ch.bafu.wrz-jagdbanngebiete_select;
ch.bafu.wrz-wildruhezonen_portal;
ch.bazl.gebirgslandeplaetze,f;
ch.swisstopo.schneeschuhwandern;
ch.swisstopo-karto.schneeschuhrouten;
ch.swisstopo-karto.skitouren;
ch.swisstopo.skitourenkarte-50.metadata,f;
ch.bav.haltestellen-oev,f
...
```

### layerID

The `layerID` can be one of the following

- an id from the catalog (e.g. `ch.swisstopo.schneeschuhwandern`)
- an id from the catalog, parametrized with e.g. time (and possibly other parameters in the future): e.g. `ch.swisstopo.zeitreihen@time=18641231@height=100m` (note: this allows for further parametrization in the future like e.g. height)

The timestamp format must be ISO8601 compliant, i.e.

- `YYYY-MM-DD`
- `YYYY-MM-DDThh:mm`
- `YYYY-MM-DDThh:mm:ss`
- `YYYY-MM-DDThh:mm:ss.sss`
- `YYYY-MM-DDThh:mm:ss+hh:mm`

External Layers are in the following format (note that only one `|` is used and the WMS order is changed to have consistently `TYPE|URL|OTHER OPTIONS`)

- an external WMS:  `WMS|wms.geo.gr.ch%2Fadmineinteilung%3F|Gemeinden,layerb,layerc|1.3.0|Gemeinden`
- an external WMTS: `WMTS|wmts.geo.ti.ch%2Fwmts%2F1.0.0%2FWMTSCapabilities.xml|ch.ti.051_1.piano_registro_fondiario_catasto_rdpp@time=18641231|Optionales Label`
- an external KML:  `KML|www.slf.ch/avalanche/accidents/accidents_season_de.kml|Mein Titel`
- an external GPX:  `GPX|www.slf.ch/avalanche/accidents/accidents_season_de.gpx`
- an external KMZ:  `KMZ|www.slf.ch/avalanche/accidents/accidents_season_de.kmz` (needs to pass by proxy to be unzipped)

## Consequences

The described format above is implemented in the new viewer. The new viewer needs to implement furthermore a retro-compatibility module that is able to interpret the old format and convert it to the new one.
