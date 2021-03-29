/* eslint-disable prettier-vue/prettier */
import Draw from 'ol/interaction/Draw'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'


const source = new VectorSource({wrapX: false});

export const vector = new VectorLayer({
  source,
});


let draw;
let map;
function addInteraction(drawType) {
  if (drawType) {
    draw = new Draw({
      source: source,
      type: drawType,
    });
    map.addInteraction(draw);
  }
}


export function changeInteractionDrawMode(drawType) {
  map.removeInteraction(draw);
  addInteraction(drawType);
};


export function initInteraction(theMap) {
  map = theMap;
  map.addLayer(vector);
  changeInteractionDrawMode('Point');
}
