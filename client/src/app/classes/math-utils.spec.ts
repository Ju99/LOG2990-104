import { Segment, Utils } from './math-utils';
import { Vec2 } from './vec2';

// tslint:disable
describe('MathUtils', () => {
    it('should be created', () => {
        const utils = new Utils();
        expect(utils).toBeTruthy();
    });

    it('should return true if point p2 is on segment and is on segment p1-q1', () => {
        const segment1: Segment = {
            initial: { x: 0, y: 0 },
            final: { x: 5, y: 5 },
        };
        const segment2: Segment = {
            initial: { x: 2, y: 2 },
            final: { x: -1, y: -1 },
        };
        const result = Utils.segmentsDoIntersect(segment1, segment2);
        expect(result).toBeTrue();
    });

    it('should return true if point q2 is on segment and is on segment p1-q1', () => {
        const segment1: Segment = {
            initial: { x: 0, y: 0 },
            final: { x: 5, y: 5 },
        };
        const segment2: Segment = {
            initial: { x: -1, y: -1 },
            final: { x: 2, y: 2 },
        };
        const result = Utils.segmentsDoIntersect(segment1, segment2);
        expect(result).toBeTrue();
    });

    it('should return true if two segments intersect', () => {
        const segment1: Segment = {
            initial: { x: 10, y: 0 },
            final: { x: 10, y: 10 },
        };
        const segment2: Segment = {
            initial: { x: 5, y: 5 },
            final: { x: 100, y: 5 },
        };

        const res = Utils.segmentsDoIntersect(segment1, segment2);
        expect(res).toBeTrue();
    });

    it('should return false if two segments DO NOT intersect', () => {
        const segment1: Segment = {
            initial: { x: 0, y: 0 },
            final: { x: 2, y: 2 },
        };
        const segment2: Segment = {
            initial: { x: 3, y: 0 },
            final: { x: 2, y: 3 },
        };

        const res = Utils.segmentsDoIntersect(segment1, segment2);
        expect(res).toBeFalse();
    });

    it('should return false if two segments are parallel', () => {
        const segment1: Segment = {
            initial: { x: 0, y: 0 },
            final: { x: 0, y: 10 },
        };
        const segment2: Segment = {
            initial: { x: 5, y: 5 },
            final: { x: 20, y: 5 },
        };

        const res = Utils.segmentsDoIntersect(segment1, segment2);
        expect(res).toBeFalse();
    });

    it('should return an angle of 90 degress if segments are perpendicular', () => {
        const segment1: Segment = {
            initial: { x: 0, y: 0 },
            final: { x: 10, y: 0 },
        };
        const segment2: Segment = {
            initial: { x: 0, y: 0 },
            final: { x: 0, y: 10 },
        };
        const expectedResult = 90;
        const result = Utils.findAngleBetweenTwoSegments(segment1, segment2);
        expect(result).toEqual(expectedResult);
    });

    it('should return true if point is inside the circle', () => {
        const pointToTest: Vec2 = { x: 3, y: 3 };
        const center = { x: 0, y: 0 };
        const radius = 10;
        const result = Utils.pointInCircle(pointToTest, center, radius);
        expect(result).toBeTrue();
    });

    it('should return true if point is on the circle perimeter', () => {
        const pointToTest: Vec2 = { x: 0, y: 10 };
        const center = { x: 0, y: 0 };
        const radius = 10;
        const result = Utils.pointInCircle(pointToTest, center, radius);
        expect(result).toBeTrue();
    });

    it('should return false if point is NOT inside the circle', () => {
        const pointToTest: Vec2 = { x: 100, y: 100 };
        const center = { x: 0, y: 0 };
        const radius = 10;
        const result = Utils.pointInCircle(pointToTest, center, radius);
        expect(result).toBeFalse();
    });

    it('should return true if point is inside the square', () => {
        const polygonCoords: Vec2[] = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 0, y: 10 },
        ];
        let pointToTest: Vec2 = { x: 5, y: 5 };
        const result = Utils.pointInPolygon(pointToTest, polygonCoords);
        expect(result).toBeTrue();
    });

    it('should return true if point is inside the concave polygon (n = 5)', () => {
        const polygonCoords = [
            { x: 0, y: 1 },
            { x: 1, y: 2 },
            { x: 1, y: 1 },
            { x: 3, y: 3 },
            { x: 1, y: 0 },
        ];
        let pointToTest: Vec2 = { x: 0.5, y: 1 };
        const result = Utils.pointInPolygon(pointToTest, polygonCoords);
        expect(result).toBeTrue();
    });

    it('should return false if point is NOT inside the square', () => {
        const polygonCoords = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 0, y: 10 },
        ];
        let pointToTest: Vec2 = { x: 20, y: 5 };
        const result = Utils.pointInPolygon(pointToTest, polygonCoords);
        expect(result).toBeFalse();
    });

    it('should return false if point is NOT inside the concave polygone (n = 5)', () => {
        const polygonCoords = [
            { x: 0, y: 1 },
            { x: 1, y: 2 },
            { x: 1, y: 1 },
            { x: 3, y: 3 },
            { x: 1, y: 0 },
        ];
        let pointToTest: Vec2 = { x: 1.25, y: 1.5 };
        const result = Utils.pointInPolygon(pointToTest, polygonCoords);
        expect(result).toBeFalse();
    });

    it('should return true if point is on a segment of the square', () => {
        const polygonCoords = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 0, y: 10 },
        ];
        let pointToTest: Vec2 = { x: 10, y: 5 };
        const result = Utils.pointInPolygon(pointToTest, polygonCoords);
        expect(result).toBeFalse();
    });

    it('should translate square diagonally if dx and dy increase', () => {
        const polygonCoords: Vec2[] = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 0, y: 10 },
        ];
        const newOrigin = { x: 10, y: 10 };
        const expectedResult: Vec2[] = [
            { x: 10, y: 10 },
            { x: 20, y: 10 },
            { x: 20, y: 20 },
            { x: 10, y: 20 },
        ];
        const result = Utils.translatePolygon(polygonCoords, polygonCoords[0], newOrigin);
        expect(result).toEqual(expectedResult);
    });

    it('should return the smallest X and Y points in the list of coordinates', () => {
        const coords: Vec2[] = [
            { x: 8, y: 7 },
            { x: 1, y: 2 },
            { x: 1, y: 1 },
            { x: 3, y: 3 },
            { x: 0, y: 4 },
        ];

        const expectedResult: Vec2 = { x: 0, y: 1 };
        let result = Utils.findMinCoord(coords);
        expect(result).toEqual(expectedResult);
    });

    it('should return the largest X and Y point in the list of coordinates', () => {
        const coords: Vec2[] = [
            { x: 0, y: 1 },
            { x: 2, y: 2 },
            { x: 1, y: 1 },
            { x: 3, y: 6 },
            { x: 4, y: 4 },
        ];

        const expectedResult: Vec2 = { x: 4, y: 6 };
        let result = Utils.findMaxCoord(coords);
        expect(result).toEqual(expectedResult);
    });

    it('should return nearest point from current point', () => {
        const currentPoint = { x: 7, y: 10 };
        const basePoint = { x: 4, y: 2 };
        const expectedResult = { x: 4, y: 10 };
        const result = Utils.getNearestPoint(currentPoint, basePoint);
        expect(result).toEqual(expectedResult);
    });
});
