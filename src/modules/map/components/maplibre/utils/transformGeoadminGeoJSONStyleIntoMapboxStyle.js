
export default function transformGeoadminGeoJSONStyleIntoMapboxStyle(geoadminStyle) {
  if (geoadminStyle.values) {
    let mapboxStyle = {
      "circle-radius": 8,
      "circle-color": ["match", ["get", geoadminStyle.property]],
      "circle-stroke-color": "#FFFFFF",
      "circle-stroke-width": 1
    };

    geoadminStyle.values.forEach(({value, vectorOptions}) => {
      mapboxStyle["circle-color"].push(value, vectorOptions.fill.color);
    });
    // default value
    mapboxStyle["circle-color"].push("#eee");
    return mapboxStyle;
  } else if (geoadminStyle.ranges) {
    console.log(geoadminStyle.ranges);
    return geoadminStyle.ranges;
  } else {
    return geoadminStyle;
  }
}