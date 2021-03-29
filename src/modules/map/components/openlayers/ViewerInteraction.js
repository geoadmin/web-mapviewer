/* eslint-disable prettier-vue/prettier */
import Draw from 'ol/interaction/Draw'
import DoubleClickZoom from 'ol/interaction/DoubleClickZoom'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Map } from 'ol'


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


function createOLMap(div, view) {
  map = new Map({
    target: div,
    controls: [],
    interactions: [],
  });
  map.setView(view);
  map.addLayer(vector);
  changeInteractionDrawMode('Point');
}


export function initInteraction(theMap) {
  const dcz = theMap.getInteractions().getArray().find(a => a instanceof DoubleClickZoom);
  dcz.setActive(false);
  const newMapDiv = document.createElement('div');
  newMapDiv.style.height = '100%'
  newMapDiv.style.pointerEvents = 'auto'
  const container = theMap.getOverlayContainer()
  container.appendChild(newMapDiv)
  createOLMap(newMapDiv, theMap.getView());
}
