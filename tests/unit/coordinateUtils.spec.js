import { expect } from 'chai'
import { coordinateFromString } from "@/utils/coordinateUtils";
import setupProj4 from "@/utils/setupProj4";

// setting up projection for proj4 otherwise they will fail when asked
setupProj4();

const numberWithThousandSeparator = (x, separator = "'") => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

describe('Unit test functions from coordinateUtils.js', () => {

    context('coordinateFromString(text)', () => {

        it('Returns undefined when anything else than numbers, coma, whitespaces and point is in the text', () => {
            expect(coordinateFromString('test')).to.be.undefined;
            expect(coordinateFromString('47.0, 7.4test')).to.eq(undefined, 'must not accept text after the coordinates');
            expect(coordinateFromString('test47.0, 7.4')).to.eq(undefined, 'must not accept text before the coordinates');
        })
        it('Returns undefined when the given text is invalid (null or not a string)', () => {
            expect(coordinateFromString(null)).to.be.undefined;
            expect(coordinateFromString(1234)).to.be.undefined;
            expect(coordinateFromString([45.6, 7.4])).to.be.undefined;
            expect(coordinateFromString({lon: 7, lat: 45})).to.be.undefined;
        });
        it('Returns null when the given text is not two numbers separated by a coma, a space or a slash', () => {
            expect(coordinateFromString('47.0')).to.be.undefined;
            expect(coordinateFromString('47.0,')).to.be.undefined;
            expect(coordinateFromString('47.0,test')).to.be.undefined;
            expect(coordinateFromString('47.0, test')).to.be.undefined;
        })

        const checkText = (text, expected, message, acceptableDelta = 0) => {
            const result = coordinateFromString(text);
            expect(result).to.be.an('Array', message);
            expect(result.length).to.eq(2, message);
            expect(result[0]).to.approximately(expected[0], acceptableDelta, message + '\nx result: ' + result[0] + '\n');
            expect(result[1]).to.approximately(expected[1], acceptableDelta, message + '\ny result: ' + result[1] + '\n');
        }
        const checkXY = (x, y, xNumericalValue = x, yNumericalValue = y, acceptableDelta = 0) => {
            const valueOutputInCaseOfErr = `x: ${x}, y: ${y}, expected x: ${xNumericalValue}, expected y: ${yNumericalValue}`;
            // checking with simple space and tab
            checkText(`${x} ${y}`, [xNumericalValue, yNumericalValue], 'fails with space in between\n' + valueOutputInCaseOfErr, acceptableDelta);
            checkText(`${x}\t${y}`, [xNumericalValue, yNumericalValue], 'fails with tabs\n' + valueOutputInCaseOfErr, acceptableDelta);
            // checking while placing separators with and without spaces before/after
            checkText(`${x},${y}`, [xNumericalValue, yNumericalValue], 'fails with coma\n' + valueOutputInCaseOfErr, acceptableDelta);
            checkText(`${x} ,${y}`, [xNumericalValue, yNumericalValue], 'fails with space and coma\n' + valueOutputInCaseOfErr, acceptableDelta);
            checkText(`${x}, ${y}`, [xNumericalValue, yNumericalValue], 'fails with coma and space\n' + valueOutputInCaseOfErr, acceptableDelta);
            checkText(`${x} , ${y}`, [xNumericalValue, yNumericalValue], 'fails with space, coma and space\n' + valueOutputInCaseOfErr, acceptableDelta);
            checkText(`${x}/${y}`, [xNumericalValue, yNumericalValue], 'fails with slash\n' + valueOutputInCaseOfErr, acceptableDelta);
            checkText(`${x} /${y}`, [xNumericalValue, yNumericalValue], 'fails with space and slash\n' + valueOutputInCaseOfErr, acceptableDelta);
            checkText(`${x}/ ${y}`, [xNumericalValue, yNumericalValue], 'fails with slash and space\n' + valueOutputInCaseOfErr, acceptableDelta);
            checkText(`${x} / ${y}`, [xNumericalValue, yNumericalValue], 'fails with space, slash and space\n' + valueOutputInCaseOfErr, acceptableDelta);
        }

        // creating values that points to the same exact location in many projections
        const x = 773900;
        const y = 5976445;

        // same place but in other projections (used https://epsg.io for transformations)
        const LV95 = [2563138.69, 1228917.22];
        const LV03 = [563138.65, 228917.28];

        // lat/lon (also got values from https://espg.io)
        const WGS84 = [47.2101583, 6.952062];
        const WGS84_DM = ['47°12.6095\'', '6°57.12372\'']
        const WGS84_DMS = ['47°12\'36.57"', '6°57\'7.423"']
        // value from https://www.earthpoint.us/Convert.aspx
        const MGRS = "32TLT 44918 30553";

        it('Returns coordinates from EPSG:4326 (Web-mercator)', () => {
            checkXY(WGS84[0], WGS84[1], x, y, 0.1)
        })
        it('Returns coordinates from EPSG:4326 (Web-mercator) with degree/minutes notation', () => {
            checkXY(WGS84_DM[0], WGS84_DM[1], x, y, 0.1);
            const latWithSpaceBetweenDegAndMin = WGS84_DM[0].replace(/°/g, '° ');
            const lonWithSpaceBetweenDegAndMin = WGS84_DM[1].replace(/°/g, '° ');
            checkXY(latWithSpaceBetweenDegAndMin, lonWithSpaceBetweenDegAndMin, x, y);
        })
        it('Returns coordinates from EPSG:4326 (Web-mercator) with degree/minutes/seconds notation', () => {
            const acceptedDelta = 0.1;

            const latWithSpaceBetweenDegAndMin = WGS84_DMS[0].replace(/°/g, '° ');
            const lonWithSpaceBetweenDegAndMin = WGS84_DMS[1].replace(/°/g, '° ');

            const latWithSpaceBetweenDegAndMinAndSec = latWithSpaceBetweenDegAndMin.replace(/'/g, '\' ');
            const lonWithSpaceBetweenDegAndMinAndSec = lonWithSpaceBetweenDegAndMin.replace(/'/g, '\' ');

            // double quote notation for seconds
            checkXY(WGS84_DMS[0], WGS84_DMS[1], x, y, acceptedDelta);
            checkXY(latWithSpaceBetweenDegAndMin, lonWithSpaceBetweenDegAndMin, x, y, acceptedDelta);
            checkXY(latWithSpaceBetweenDegAndMinAndSec, lonWithSpaceBetweenDegAndMinAndSec, x, y, acceptedDelta);

            // two single quote notation for seconds
            checkXY(WGS84_DMS[0].replace(/"/g, '\'\''), WGS84_DMS[1].replace(/"/g, '\'\''), x, y, acceptedDelta);
            checkXY(latWithSpaceBetweenDegAndMin.replace(/"/g, '\'\''), lonWithSpaceBetweenDegAndMin.replace(/"/g, '\'\''), x, y, acceptedDelta);
            checkXY(latWithSpaceBetweenDegAndMinAndSec.replace(/"/g, '\'\''), lonWithSpaceBetweenDegAndMinAndSec.replace(/"/g, '\'\''), x, y, acceptedDelta);
        })
        it('Returns coordinates from EPSG:2056 (LV95)', () => {
            checkXY(LV95[0], LV95[1], x, y, 0.1);
        })
        it('Returns coordinates from EPSG:2056 (LV95) when entered backward', () => {
            checkXY(LV95[1], LV95[0], x, y, 0.1);
        })
        it('Returns coordinates from EPSG:2056 (LV95) even when there\'s thousands separator', () => {
            checkXY(numberWithThousandSeparator(LV95[0]), numberWithThousandSeparator(LV95[1]), x, y, 0.1);
            checkXY(numberWithThousandSeparator(LV95[0], ' '), numberWithThousandSeparator(LV95[1], ' '), x, y, 0.1);
        })
        it('Returns coordinates from EPSG:2056 (LV95) even when there\'s thousands separator when entered backward', () => {
            checkXY(numberWithThousandSeparator(LV95[1]), numberWithThousandSeparator(LV95[0]), x, y, 0.1);
            checkXY(numberWithThousandSeparator(LV95[1], ' '), numberWithThousandSeparator(LV95[0], ' '), x, y, 0.1);
        })
        it('Returns coordinate from EPSG:21781 (LV03)', () => {
            checkXY(LV03[0], LV03[1], x, y, 0.1);
        })
        it('Returns coordinate from EPSG:21781 (LV03) when entered backward', () => {
            checkXY(LV03[1], LV03[0], x, y, 0.1);
        })
        it('Returns coordinate from EPSG:21781 (LV03) with thousands separator', () => {
            checkXY(numberWithThousandSeparator(LV03[0]), numberWithThousandSeparator(LV03[1]), x, y, 0.1);
            checkXY(numberWithThousandSeparator(LV03[0], ' '), numberWithThousandSeparator(LV03[1], ' '), x, y, 0.1);
        })
        it('Returns coordinate from EPSG:21781 (LV03) with thousands separator when entered backward', () => {
            checkXY(numberWithThousandSeparator(LV03[1]), numberWithThousandSeparator(LV03[0]), x, y, 0.1);
            checkXY(numberWithThousandSeparator(LV03[1], ' '), numberWithThousandSeparator(LV03[0], ' '), x, y, 0.1);
        })
        it('Returns coordinates in EPSG:4326 when Military Grid Reference System (MGRS) coords are entered', () => {
            // as MGRS is a grid based system, what is return is essentially a 1 meter box.
            // So depending which part of the box is taken, the answer is correct, we then tolerate here a margin of 1m
            checkText(MGRS, [x, y], 'MGRS not supported', 1);
        })
    });
});
