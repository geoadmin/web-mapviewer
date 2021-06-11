export const mockResponse = { fileId: 'test', adminId: 'test' }

export const checkKMLFileResponse = (interception, data, create = false) => {
    if (!create) {
        const urlArray = interception.request.url.split('/')
        const id = urlArray[urlArray.length - 1]
        expect(id).to.be.eq(mockResponse.adminId)
    }
    expect(interception.request.headers['content-type']).to.be.eq(
        'application/vnd.google-earth.kml+xml'
    )
    expect(interception.request.body).to.contain('</kml>')
    data.forEach((text) => expect(interception.request.body).to.contain(text))
}

export function createAPoint(kind, x = 0, y = 0, xx = 915602.81, yy = 5911929.47) {
    cy.mockupBackendResponse('files', mockResponse, 'saveFile')
    cy.mockupBackendResponse('files/**', { ...mockResponse, status: 'updated' }, 'modifyFile')

    cy.goToDrawing()
    cy.clickDrawingTool(kind)
    cy.clickDrawingMap(x, y, () => {
        cy.readDrawingFeatures('Point', (features) => {
            const coos = features[0].getGeometry().getCoordinates()
            expect(coos).to.eql([xx, yy], `bad: ${JSON.stringify(coos)}`)
        })
        cy.wait('@saveFile').then((interception) =>
            checkKMLFileResponse(interception, ['Placemark'], true)
        )
    })
}
