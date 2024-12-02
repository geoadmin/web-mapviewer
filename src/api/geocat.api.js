import axios from 'axios'

import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import { SearchResultTypes } from '@/api/search.api'
import { LV95, WGS84 } from '@/utils/coordinates/coordinateSystems'
import { projExtent } from '@/utils/extentUtils'

const SOURCES_FOR_ELASTIC_REQUESTS = [
    'uuid',
    'id',
    'title',
    'resource*',
    'resourceTitleObject',
    'resourceAbstractObject',
    'overview',
    'logo',
    'codelist_status_text',
    'linkProtocol',
    'linkUrl',
    'contactForResource*.organisation*',
    'contact*.organisation*',
    'contact*.email',
    'userSavedCount',
    'cl_topic',
    'cl_maintenanceAndUpdateFrequency',
    'tag',
    'MD_LegalConstraintsUseLimitationObject',
    'qualityScore',
    'geom',
]

function generateGeographicQuery(extent) {
    const extentInWGS84 = projExtent(LV95, WGS84, extent)
    const extentPolygon = [
        [extentInWGS84[0], extentInWGS84[1]],
        [extentInWGS84[0], extentInWGS84[3]],
        [extentInWGS84[2], extentInWGS84[3]],
        [extentInWGS84[2], extentInWGS84[1]],
        [extentInWGS84[0], extentInWGS84[1]],
    ]
    return {
        aggregations: {},
        from: 0,
        size: 10,
        sort: [
            {
                _score: 'desc',
            },
        ],
        query: {
            bool: {
                must: [],
                should: [
                    {
                        geo_shape: {
                            geom: {
                                shape: {
                                    type: 'Polygon',
                                    coordinates: [extentPolygon],
                                },
                                relation: 'within',
                            },
                            boost: 10,
                        },
                    },
                ],
                filter: [
                    {
                        terms: {
                            isTemplate: ['n'],
                        },
                    },
                    {
                        geo_shape: {
                            geom: {
                                shape: {
                                    type: 'Polygon',
                                    coordinates: [extentPolygon],
                                },
                                relation: 'intersects',
                            },
                        },
                    },
                ],
            },
        },
        track_total_hits: true,
        _source: SOURCES_FOR_ELASTIC_REQUESTS,
    }
}

function generatePureTextSearchQuery(searchQuery) {
    return {
        query: {
            bool: {
                must: [
                    {
                        terms: {
                            isTemplate: ['n'],
                        },
                    },
                    {
                        multi_match: {
                            query: searchQuery,
                            type: 'bool_prefix',
                            fields: [
                                'resourceTitleObject.langeng^14',
                                'resourceTitleObject.*^4',
                                'resourceAbstractObject.langeng^13',
                                'resourceAbstractObject.*^3',
                                'tag^2',
                                'resourceIdentifier',
                            ],
                        },
                    },
                ],
            },
        },
        _source: SOURCES_FOR_ELASTIC_REQUESTS,
        from: 0,
        size: 20,
    }
}

/**
 * @param searchQuery
 * @returns Promise<GeocatSearchResult[]>
 */
export async function searchOnGeocat(searchQuery, extent) {
    const geocatResults = await axios({
        method: 'POST',
        url: 'https://www.geocat.ch/geonetwork/srv/api/search/records/_search?bucket=bucket',
        data: extent ? generateGeographicQuery(extent) : generatePureTextSearchQuery(searchQuery),
    })
    if (geocatResults?.data?.hits?.hits?.length > 0) {
        const wmsHits = geocatResults.data.hits.hits.filter((hit) =>
            // hit._score > 100 &&
            hit._source.linkProtocol?.some((protocol) => ['OGC:WMS'].includes(protocol))
        )
        const result = wmsHits.map((hit) => {
            console.log('geocat WMS hit', hit)
            const source = hit._source
            const indexOfWmsLink = source.linkProtocol.indexOf('OGC:WMS')
            let wmsUrl = source.linkUrl[indexOfWmsLink]
            wmsUrl = wmsUrl.substring(0, wmsUrl.indexOf('?') + 1)
            let layerId
            if (source.resourceIdentifier) {
                layerId = source.resourceIdentifier[0].code
            } else {
                layerId = source.resourceAbstractObject.default
            }
            let extent = null
            if (source.geom && source.geom.coordinates) {
                const elasticExtent = source.geom.coordinates[0]
                extent = [
                    elasticExtent[0][0],
                    elasticExtent[0][1],
                    elasticExtent[2][0],
                    elasticExtent[2][1],
                ]
                console.log('geocat extent found', extent)
            }
            return {
                resultType: SearchResultTypes.GEOCAT,
                id: source.id,
                title: source.resourceTitleObject.default,
                sanitizedTitle: source.resourceTitleObject.default,
                layer: new ExternalWMSLayer({
                    id: layerId,
                    name: source.resourceTitleObject.default,
                    baseUrl: wmsUrl,
                    isLoading: false,
                    // extent: extent,
                }),
            }
        })
        console.log('geocat wms results', result)
        return result
    } else {
        console.log('geocat pas de chance', geocatResults)
    }
    return []
}
