import * as d3 from 'd3'
import { LineString } from 'ol/geom'
import { createArea, createAxis, getXYDomains } from '@/modules/drawing/lib/profileUtils'
import i18n from '@/modules/i18n'

/**
 * @typedef ProfileChartOptions
 * @property {Object} margin Chart margins (left/right/top/bottom)
 * @property {Number} width Width of parent element
 * @property {Number} height Height of parent element
 * @property {String} xLabel Label of x-axis (translation tag)
 * @property {String} yLabel Label of y-axis (translation tag)
 */

/** Creates d3 chart for profile and calculates profile information */
export default class ProfileChart {
    /** @param {ProfileChartOptions} options */
    constructor(options) {
        this.options = options
        this.marginHoriz = this.options.margin.left + this.options.margin.right || 0
        this.marginVert = this.options.margin.top + this.options.margin.bottom || 0
        this.elevationModel = this.options.elevationModel || 'COMB'
        this.width = this.options.width - this.marginHoriz
        this.height = this.options.height - this.marginVert
        this.sourceFontMargin = 5
        this.sourceFontSize = this.options.margin.top - this.sourceFontMargin
    }

    findMapCoordinates(searchDist) {
        let ratio = searchDist / this.data[this.data.length - 1].domainDist
        if (ratio < 0) {
            ratio = 0
        } else if (ratio > 1) {
            ratio = 1
        }
        return this.lineString.getCoordinateAt(ratio)
    }

    formatData(data) {
        if (data.length) {
            const coords = []
            const maxX = data[data.length - 1].dist
            const denom = maxX >= 10000 ? 1000 : 1
            this.unitX = maxX >= 10000 ? 'km' : 'm'
            data.forEach((datum) => {
                coords.push([datum.easting, datum.northing])
                datum.domainDist = datum.dist / denom
                datum.alts[this.elevationModel] = datum.alts[this.elevationModel] || 0
            })
            this.lineString = new LineString(coords)
        }
        return data
    }

    // total elevation difference
    getElevationDiff() {
        if (this.data.length) {
            const max = this.data[this.data.length - 1].alts[this.elevationModel] || 0
            const min = this.data[0].alts[this.elevationModel] || 0
            return max - min
        }
    }

    // total positive elevation & total negative elevation
    getTotalElevationDiff() {
        let sumDown = 0
        let sumUp = 0
        if (this.data.length) {
            for (let i = 0; i < this.data.length - 1; i++) {
                const h1 = this.data[i].alts[this.elevationModel] || 0
                const h2 = this.data[i + 1].alts[this.elevationModel] || 0
                const dh = h2 - h1
                if (dh < 0) {
                    sumDown += dh
                } else if (dh >= 0) {
                    sumUp += dh
                }
            }
        }
        return [sumUp, Math.abs(sumDown)]
    }

    // Sum of slope/surface distances (distance on the ground)
    getSlopeDistance() {
        if (this.data.length) {
            let sumSlopeDist = 0
            for (let i = 0; i < this.data.length - 1; i++) {
                const h1 = this.data[i].alts[this.elevationModel] || 0
                const h2 = this.data[i + 1].alts[this.elevationModel] || 0
                const s1 = this.data[i].dist || 0
                const s2 = this.data[i + 1].dist || 0
                const dh = h2 - h1
                const ds = s2 - s1
                // Pythagorean theorem (hypotenuse: the slope/surface distance)
                sumSlopeDist += Math.sqrt(Math.pow(dh, 2) + Math.pow(ds, 2))
            }
            return sumSlopeDist
        }
    }

    // Highest & lowest elevation points
    getElevationPoints() {
        if (this.data.length > 0) {
            const elevations = this.data.map((datum) => {
                return datum.alts[this.elevationModel]
            })
            const highestPoint = d3.max(elevations) || 0
            const lowestPoint = d3.min(elevations) || 0
            return [highestPoint, lowestPoint]
        }
        return [0, 0]
    }

    // Distance
    getDistance() {
        if (this.data.length > 0) {
            return this.data[this.data.length - 1].dist
        }
    }

    // Hiking time
    // Official formula: http://www.wandern.ch/download.php?id=4574_62003b89
    // Reference link: http://www.wandern.ch
    // But we use a slightly modified version from schweizmobil
    getHikingTime() {
        let wayTime = 0

        // Constants of the formula (schweizmobil)
        const arrConstants = [
            14.271, 3.6991, 2.5922, -1.4384, 0.32105, 0.81542, -0.090261, -0.20757, 0.010192,
            0.028588, -0.00057466, -0.0021842, 1.5176e-5, 8.6894e-5, -1.3584e-7, -1.4026e-6,
        ]

        if (this.data.length > 0) {
            for (let i = 1; i < this.data.length; i++) {
                const data = this.data[i]
                const dataBefore = this.data[i - 1]

                // Distance betwen 2 points
                const distance = data.dist - dataBefore.dist

                if (!distance) {
                    continue
                }

                // Difference of elevation between 2 points
                const elevDiff =
                    data.alts[this.elevationModel] - dataBefore.alts[this.elevationModel]

                // Slope value between the 2 points
                // 10ths (schweizmobil formula) instead of % (official formula)
                const slope = (elevDiff * 10.0) / distance

                // The swiss hiking formula is used between -25% and +25%
                // but schweiz mobil use -40% and +40%
                let minutesPerKilometer = 0
                if (slope > -4 && slope < 4) {
                    for (let j = 0; j < arrConstants.length; j++) {
                        minutesPerKilometer += arrConstants[j] * Math.pow(slope, j)
                    }
                    // outside the -40% to +40% range, we use a linear formula
                } else if (slope > 0) {
                    minutesPerKilometer = 17 * slope
                } else {
                    minutesPerKilometer = -9 * slope
                }
                wayTime += (distance * minutesPerKilometer) / 1000
            }
            return Math.round(wayTime)
        }
    }

    create(data) {
        this.data = this.formatData(data)
        this.element = document.createElement('DIV')
        this.element.className = 'profile-inner'
        this.domain = getXYDomains(this.width, this.height, this.elevationModel, this.data)
        const axis = createAxis(this.domain)

        this.svg = d3
            .select(this.element)
            .append('svg')
            .attr('width', this.width + this.marginHoriz)
            .attr('height', this.height + this.marginVert)
            .attr('class', 'profile-svg')

        this.group = this.svg
            .append('g')
            .attr('class', 'profile-group')
            .attr(
                'transform',
                'translate(' + this.options.margin.left + ', ' + this.options.margin.top + ')'
            )

        const area = createArea(this.domain, this.height, this.elevationModel)

        this.group
            .append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0, ' + this.height + ')')
            .call(axis.X)

        this.group
            .append('g')
            .attr('class', 'y axis')
            .call(axis.Y)
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')

        this.group
            .append('g')
            .attr('class', 'profile-grid-x')
            .attr('transform', 'translate(0, ' + this.height + ')')
            .call(axis.X.tickSize(-this.height, 0, 0).tickFormat(''))

        this.group
            .append('g')
            .attr('class', 'profile-grid-y')
            .call(axis.Y.tickSize(-this.width, 0, 0).tickFormat(''))

        this.group.append('path').datum(this.data).attr('class', 'profile-area').attr('d', area)

        this.profileSourceText = this.group
            .append('text')
            .attr('class', 'profile-source-link')
            .attr('text-anchor', 'end')
            .attr('x', this.width)
            .attr('y', -this.sourceFontMargin)
            .attr('font-size', this.sourceFontSize)

        this.profileSourceText
            .append('a')
            .attr('href', this.options.sourceLinks[0].url)
            .attr('target', '_blank')
            .append('tspan')
            .text(this.options.sourceLinks[0].label)

        this.profileSourceText.append('tspan').text(' / ')

        this.profileSourceText
            .append('a')
            .attr('href', this.options.sourceLinks[1].url)
            .attr('target', '_blank')
            .append('tspan')
            .text(this.options.sourceLinks[1].label)

        this.group
            .append('text')
            .attr('class', 'profile-label profile-label-x')
            .attr('x', this.width / 2)
            .attr('y', this.height + this.options.margin.bottom - 5)
            .style('text-anchor', 'middle')
            .attr('font-size', '0.80em')

        this.group
            .append('text')
            .attr('class', 'profile-label profile-label-y')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - this.options.margin.left)
            .attr('x', -this.height / 2)
            .attr('dy', '0.85em')
            .style('text-anchor', 'middle')
            .attr('font-size', '0.80em')

        this.glass = this.group
            .append('rect')
            .attr('class', 'profile-glass')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this.width)
            .attr('height', this.height)
            .style('opacity', 0)
            .attr('data-cy', 'profile-popup-area')

        this.updateLabels()
    }

    updateLabels() {
        this.group
            .select('text.profile-label-x')
            .text(`${i18n.global.t(this.options.xLabel)} [${this.unitX}]`)
        this.group.select('text.profile-label-y').text(`${i18n.global.t(this.options.yLabel)} [m]`)
    }

    getProfileInfo() {
        return {
            elevationDiff: this.getElevationDiff(),
            totalElevationDiff: this.getTotalElevationDiff(),
            elevationPoints: this.getElevationPoints(),
            distance: this.getDistance(),
            slopeDistance: this.getSlopeDistance(),
            hikingTime: this.getHikingTime(),
            unitX: this.unitX,
        }
    }

    update(data, size) {
        let transitionTime = 1500
        if (size) {
            transitionTime = 250
            this.width = size[0] - this.marginHoriz
            this.height = size[1] - this.marginVert
            this.svg
                .transition()
                .duration(transitionTime)
                .attr('width', this.width + this.marginHoriz)
                .attr('height', this.height + this.marginVert)
                .attr('class', 'profile-svg')
            this.group
                .select('text.profile-label-x')
                .transition()
                .duration(transitionTime)
                .attr('x', this.width / 2)
                .attr('y', this.height + this.options.margin.bottom - 5)
            this.group
                .select('text.profile-source-link')
                .transition()
                .duration(transitionTime)
                .attr('x', this.width)
                .attr('y', -this.sourceFontMargin)
        }
        if (data) {
            this.data = this.formatData(data)
        }

        this.domain = getXYDomains(this.width, this.height, this.elevationModel, this.data)
        const axis = createAxis(this.domain)
        const area = createArea(this.domain, this.height, this.elevationModel)

        this.group
            .select('.profile-area')
            .datum(this.data)
            .transition()
            .duration(transitionTime)
            .attr('class', 'profile-area')
            .attr('d', area)
        this.group.select('g.x').transition().duration(transitionTime).call(axis.X)
        this.group.select('g.y').transition().duration(transitionTime).call(axis.Y)
        this.group
            .select('g.profile-grid-x')
            .transition()
            .duration(transitionTime)
            .call(axis.X.tickSize(-this.height, 0, 0).tickFormat(''))
        this.group
            .select('g.profile-grid-y')
            .transition()
            .duration(transitionTime)
            .call(axis.Y.tickSize(-this.width, 0, 0).tickFormat(''))
        this.updateLabels()
    }
}
