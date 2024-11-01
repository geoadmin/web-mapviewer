import { expect } from 'chai'
import { describe, it } from 'vitest'

import { isKml } from '@/modules/menu/components/advancedTools/ImportFile/parser/KMLParser.class'

/**
 * @param {String} stringValue
 * @returns {ArrayBuffer}
 */
function convertToArrayBuffer(stringValue) {
    return new TextEncoder().encode(stringValue)
}

describe('Test KMLParser utils', () => {
    it('Detect KML file syntax', () => {
        expect(isKml(convertToArrayBuffer('<kml>test</kml>'))).to.be.true
        expect(isKml(convertToArrayBuffer('<kml:kml>test</kml:kml>'))).to.be.true
        expect(
            isKml(
                convertToArrayBuffer(
                    ' <?xml version="1.0" encoding="UTF-8"?><kml:kml>test</kml:kml>'
                )
            )
        ).to.be.true
        expect(
            isKml(
                convertToArrayBuffer(
                    `<?xml version="1.0" encoding="UTF-8"?>
        <kml:kml>
            test
        </kml:kml>
        `
                )
            )
        ).to.be.true
        expect(
            isKml(
                convertToArrayBuffer(
                    `
<kml>
    <Placemark>
        <name>test</name>
        <description>KML With Prefixed Namespace</description>
        <Point>
            <coordinates>7.438632503,46.951082887,598.947</coordinates>
        </Point>
    </Placemark>
</kml>`
                )
            )
        ).to.be.true
    })
    it("Don't detect invalid KML file syntax", () => {
        expect(isKml(convertToArrayBuffer('<kmlz>test</kmlz>'))).to.be.false
        expect(isKml(convertToArrayBuffer('<akml>test</akml>'))).to.be.false
        expect(isKml(convertToArrayBuffer('<?xml version="1.0" encoding="UTF-8"?><div>test</div>')))
            .to.be.false
        expect(
            isKml(
                convertToArrayBuffer(`<div><![CDATA[
<kml>
    <Placemark>
        <name>test</name>
        <description>KML With Prefixed Namespace</description>
        <Point>
            <coordinates>7.438632503,46.951082887,598.947</coordinates>
        </Point>
    </Placemark>
</kml>
]]></div>`)
            )
        ).to.be.false
    })
})
