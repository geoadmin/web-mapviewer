import { expect } from 'chai'
import { describe, it } from 'vitest'

import { isKml } from '@/modules/menu/components/advancedTools/ImportFile/utils'

describe('Test ImportFile utils', () => {
    it('Detect KML file syntax', () => {
        expect(isKml('<kml>test</kml>')).to.be.true
        expect(isKml('<kml:kml>test</kml:kml>')).to.be.true
        expect(isKml(' <?xml version="1.0" encoding="UTF-8"?><kml:kml>test</kml:kml>')).to.be.true
        expect(
            isKml(`<?xml version="1.0" encoding="UTF-8"?>
        <kml:kml>
            test
        </kml:kml>
        `)
        ).to.be.true
        expect(
            isKml(`
<kml>
    <Placemark>
        <name>test</name>
        <description>KML With Prefixed Namespace</description>
        <Point>
            <coordinates>7.438632503,46.951082887,598.947</coordinates>
        </Point>
    </Placemark>
</kml>`)
        ).to.be.true
    })
    it("Don't detect invalid KML file syntax", () => {
        expect(isKml('<kmlz>test</kmlz>')).to.be.false
        expect(isKml('<akml>test</akml>')).to.be.false
        expect(isKml('<?xml version="1.0" encoding="UTF-8"?><div>test</div>')).to.be.false
        expect(
            isKml(`<div><![CDATA[
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
        ).to.be.false
    })
})
