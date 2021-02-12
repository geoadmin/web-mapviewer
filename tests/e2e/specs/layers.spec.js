describe('Test of layer handling', () => {
  it('starts without any layer added when opening the app without layers URL param', () => {
    cy.goToMapView()
    cy.readStoreValue('getters.visibleLayers').should('be.empty')
  })
  it('adds a layer to the map when the app is opened through a URL with a layer in it', () => {
    cy.goToMapView('en', {
      layers: 'ch.bfe.windenergie-geschwindigkeit_h50,ch.bav.haltestellen-oev',
    })
    cy.readStoreValue('getters.visibleLayers').then((layers) => {
      expect(layers).to.be.an('Array')
      expect(layers.length).to.eq(2)
      expect(layers[0]).to.be.an('Object')
      expect(layers[0].id).to.eq('ch.bfe.windenergie-geschwindigkeit_h50')
      expect(layers[1]).to.be.an('Object')
      expect(layers[1].id).to.eq('ch.bav.haltestellen-oev')
    })
  })
})
