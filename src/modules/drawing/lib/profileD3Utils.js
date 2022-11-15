import i18n from '@/modules/i18n'
import * as d3 from 'd3'

// look and feel constants
export const profilePlotMargin = {
    left: 55,
    right: 15,
    bottom: 35,
    top: 15,
}
const sourceFontMargin = 5
const sourceFontSize = profilePlotMargin.top - sourceFontMargin

/**
 * The goal here is to declare what kind of scales/label our chart will have on both axis. For that
 * we look at the max and min value of each axis, and create a range of value that will be shown to
 * the user
 *
 * It will also take into account how much space there is on the screen, hence the presence of
 * width/height as parameters
 *
 * This code is mostly a rip-off of mf-geoamin3, with minor adjustments
 *
 * @param width Width of the chart on screen (px)
 * @param {GeoAdminProfile} profile Profile data to be shown as chart
 * @returns Definition of X axis for d3
 */
function getDomainX(width, profile) {
    return d3
        .scaleLinear()
        .range([0, width])
        .domain(d3.extent(profile.points, (point) => point.dist))
}

/**
 * The goal here is to declare what kind of scales/label our chart will have on both axis. For that
 * we look at the max and min value of each axis, and create a range of value that will be shown to
 * the user
 *
 * It will also take into account how much space there is on the screen, hence the presence of
 * width/height as parameters
 *
 * This code is mostly a rip-off of mf-geoamin3, with minor adjustments
 *
 * @param height Width of the chart on screen (px)
 * @param {GeoAdminProfile} profile Profile data to be shown as chart
 * @returns Definition of Y axis for d3
 */
function getDomainY(height, profile) {
    let yMin = d3.min(profile.points, (point) => point.elevation)
    const yMax = d3.max(profile.points, (point) => point.elevation)
    const decile = (yMax - yMin) / 10
    yMin = yMin - decile > 0 ? yMin - decile : 0
    return d3
        .scaleLinear()
        .range([height, 0])
        .domain([yMin, yMax + decile])
}

function createAxisX(domainX) {
    return d3.axisBottom(domainX)
}

function createAxisY(domainY) {
    return d3.axisLeft(domainY).ticks(5)
}

function createArea(domainX, domainY, height) {
    return d3
        .area()
        .x(function (d) {
            return domainX(d.dist)
        })
        .y0(height)
        .y1(function (d) {
            return domainY(d.elevation)
        })
}

/**
 * @param d3element
 * @param {String} unitForDistance
 */
function updateLabels(d3element, unitForDistance = 'm') {
    d3element
        .select('.profile-label-x')
        .text(`${i18n.global.t('profile_x_label')} [${unitForDistance}]`)
    d3element.select('.profile-label-y').text(`${i18n.global.t('profile_x_label')} [m]`)
}

/**
 * @param {HTMLElement} element
 * @param {GeoAdminProfile} profile
 * @param {Number} transitionTime
 */
export function updateD3ProfileChart(element, profile, transitionTime = 250) {
    const width = element.clientWidth - profilePlotMargin.left - profilePlotMargin.right
    const height = element.clientHeight - profilePlotMargin.top - profilePlotMargin.bottom

    const domainX = getDomainX(width, profile)
    const domainY = getDomainY(height, profile)

    const axisX = createAxisX(domainX)
    const axisY = createAxisY(domainY)

    const d3element = d3.select(element)

    const area = createArea(domainX, domainY, height)

    d3element
        .select('svg')
        .transition()
        .duration(transitionTime)
        .attr('width', width)
        .attr('height', height)
    d3element
        .select('.profile-group')
        .attr('transform', `translate(${profilePlotMargin.left}, ${profilePlotMargin.top})`)

    d3element
        .select('.axis-x')
        .attr('transform', `translate(0, ${height})`)
        .transition()
        .duration(transitionTime)
        .call(axisX)
    d3element
        .select('.axis-y')
        .attr('y', 6)
        .attr('dy', '0.71em')
        .transition()
        .duration(transitionTime)
        .call(axisY)

    d3element
        .select('.profile-grid-x')
        .attr('transform', `translate(0, ${height})`)
        .transition()
        .duration(transitionTime)
        .call(axisX.tickSize(-height, 0, 0).tickFormat(''))
    d3element
        .select('.profile-grid-y')
        .transition()
        .duration(transitionTime)
        .call(axisY.tickSize(-width, 0, 0).tickFormat(''))

    d3element
        .select('.profile-label-x')
        .transition()
        .duration(transitionTime)
        .attr('x', width / 2)
        .attr('y', height + profilePlotMargin.bottom - 5)
    d3element
        .select('.profile-label-y')
        .transition()
        .duration(transitionTime)
        .attr('y', 0 - profilePlotMargin.left)
        .attr('x', -height / 2)

    d3element
        .select('.profile-source-link')
        .attr('x', width)
        .attr('y', -sourceFontMargin)
        .attr('font-size', sourceFontSize)
        .transition()
        .duration(transitionTime)
        .attr('x', width)
        .attr('y', -sourceFontMargin)

    d3element
        .select('.profile-area')
        .datum(profile.points)
        .transition()
        .duration(transitionTime)
        .attr('d', area)

    // element that will be used to show tooltip info on mouse hover
    d3element
        .select('.profile-glass')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height)
        .style('opacity', 0)

    updateLabels(d3element)

    return {
        domainX,
        domainY,
        axisX,
        axisY,
    }
}
