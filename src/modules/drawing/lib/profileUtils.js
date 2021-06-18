import * as d3 from 'd3'

export function getXYDomains(width, height, elevationModel, data) {
    const x = d3.scaleLinear().range([0, width])
    const y = d3.scaleLinear().range([height, 0])
    x.domain(
        d3.extent(data, function (d) {
            return d.domainDist || 0
        })
    )
    let yMin = d3.min(data, function (d) {
        return d.alts[elevationModel]
    })
    const yMax = d3.max(data, function (d) {
        return d.alts[elevationModel]
    })
    const decile = (yMax - yMin) / 10
    yMin = yMin - decile > 0 ? yMin - decile : 0
    y.domain([yMin, yMax + decile])
    return {
        X: x,
        Y: y,
    }
}

export function createAxis(domain) {
    return {
        X: d3.axisBottom(domain.X),
        Y: d3.axisLeft(domain.Y).ticks(5),
    }
}

export function createArea(domain, height, elevationModel) {
    return d3
        .area()
        .x(function (d) {
            return domain.X(d.domainDist)
        })
        .y0(height)
        .y1(function (d) {
            return domain.Y(d.alts[elevationModel])
        })
}
