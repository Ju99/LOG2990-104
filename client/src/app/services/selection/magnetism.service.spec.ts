import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';

import { SelectionBox } from '@app/constants';
import { MagnetismService } from './magnetism.service';

// tslint:disable
describe('MagnetismService', () => {
    let service: MagnetismService;
    let topLeftPoint:Vec2;
    let width:number;
    let height:number;


    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MagnetismService);
        topLeftPoint={x:10,y:10};
        width=10;
        height=10;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('activateMagnetism case TopMiddle ',()=>{
            service.anchorPoint=SelectionBox.TopMiddle;
            service.squareSize=10;
            topLeftPoint={x:10, y:10};
            const result= service.activateMagnetism(topLeftPoint,height,width);
            expect(result).toEqual({x:5,y:10});
    });

    it('activateMagnetism case RightMiddle ',()=>{
        service.anchorPoint=SelectionBox.RightMiddle;
        service.squareSize=10;
        topLeftPoint={x:10, y:10};
        const result= service.activateMagnetism(topLeftPoint,height,width);
        expect(result).toEqual({x:10,y:5});
    });

    it('activateMagnetism case LeftMiddle',()=>{
        service.anchorPoint=SelectionBox.LeftMiddle;
        service.squareSize=10;
        topLeftPoint={x:10, y:10};
        const result= service.activateMagnetism(topLeftPoint,height,width);
        expect(result).toEqual({x:10,y:5});

    });

    it('activateMagnetism case BottomMiddle  ',()=>{
        service.anchorPoint=SelectionBox.BottomMiddle;
        service.squareSize=10;
        topLeftPoint={x:10, y:10};
        const result= service.activateMagnetism(topLeftPoint,height,width);
        expect(result).toEqual({x:5,y:10});

    });

    it('activateMagnetism case Center ',()=>{
        service.anchorPoint=SelectionBox.Center;
        service.squareSize=10;
        topLeftPoint={x:10, y:10};
        const result= service.activateMagnetism(topLeftPoint,height,width);
        expect(result).toEqual({x:5,y:5});
    });

    it('activateMagnetism case TopRight ',()=>{
        service.anchorPoint=SelectionBox.TopRight;
        service.squareSize=10;
        topLeftPoint={x:10, y:10};
        const result= service.activateMagnetism(topLeftPoint,height,width);
        expect(result).toEqual({x:10,y:10});

    });

    it('activateMagnetism case TopLeft ',()=>{
        service.anchorPoint=SelectionBox.TopLeft;
        service.squareSize=10;
        topLeftPoint={x:10, y:10};
        const result= service.activateMagnetism(topLeftPoint,height,width);
        expect(result).toEqual({x:10,y:10});

    });

    it('activateMagnetism case BottomRight ',()=>{
        service.anchorPoint=SelectionBox.BottomRight;
        service.squareSize=10;
        topLeftPoint={x:10, y:10};
        const result= service.activateMagnetism(topLeftPoint,height,width);
        expect(result).toEqual({x:10,y:10});

    });
    
    it('activateMagnetism case BottomLeft ',()=>{
        service.anchorPoint=SelectionBox.BottomLeft;
        service.squareSize=10;
        topLeftPoint={x:10, y:10};
        const result= service.activateMagnetism(topLeftPoint,height,width);
        expect(result).toEqual({x:10,y:10});

    });

    it('calculateClosestIntersection case topLeftIntersection', () => {
        service.anchorPoint = SelectionBox.TopLeft;
        service.squareSize = 20;
        topLeftPoint = { x: 8, y: 8 };
        const result = service['calculateClosestIntersection'](topLeftPoint, height,width);
        expect(result).toEqual({ x: 0, y: 0 });
    });

    it('calculateClosestIntersection case bottomRightIntersection', () => {
        service.anchorPoint = SelectionBox.TopLeft;
        service.squareSize = 20;
        topLeftPoint = { x: 15, y: 15 };
        const result = service['calculateClosestIntersection'](topLeftPoint, height,width);
        expect(result).toEqual({ x: 20, y: 20 });
    });

    it('locateAnchorPoint case TopMiddle', () => {
        service.anchorPoint = SelectionBox.TopMiddle;
        const result = service['locateAnchorPoint'](topLeftPoint, height,width);
        expect(result).toEqual({ x: 15, y: 10 });
    });

    it('locateAnchorPoint case RightMiddle', () => {
        service.anchorPoint = SelectionBox.RightMiddle;
        const result = service['locateAnchorPoint'](topLeftPoint, height,width);
        expect(result).toEqual({ x: 20, y: 15 });
    });

    it('locateAnchorPoint case LeftMiddle', () => {
        service.anchorPoint = SelectionBox.LeftMiddle;
        const result = service['locateAnchorPoint'](topLeftPoint, height,width);
        expect(result).toEqual({ x: 10, y: 15 });
    });

    it('locateAnchorPoint case BottomMiddle', () => {
        service.anchorPoint = SelectionBox.BottomMiddle;
        const result = service['locateAnchorPoint'](topLeftPoint, height,width);
        expect(result).toEqual({ x: 15, y: 20 });
    });

    it('locateAnchorPoint case Center', () => {
        service.anchorPoint = SelectionBox.Center;
        const result = service['locateAnchorPoint'](topLeftPoint, height,width);
        expect(result).toEqual({ x: 15, y: 15 });
    });

    it('locateAnchorPoint case TopRight', () => {
        service.anchorPoint = SelectionBox.TopRight;
        const result = service['locateAnchorPoint'](topLeftPoint, height,width);
        expect(result).toEqual({ x: 20, y: 10 });
    });

    it('locateAnchorPoint case TopLeft', () => {
        service.anchorPoint = SelectionBox.TopLeft;
        const result = service['locateAnchorPoint'](topLeftPoint, height,width);
        expect(result).toEqual({ x: 10, y: 10 });
    });

    it('locateAnchorPoint case BottomRight', () => {
        service.anchorPoint = SelectionBox.BottomRight;
        const result = service['locateAnchorPoint'](topLeftPoint, height,width);
        expect(result).toEqual({ x: 20, y: 20 });
    });

    it('locateAnchorPoint case BottomLeft', () => {
        service.anchorPoint = SelectionBox.BottomLeft;
        const result = service['locateAnchorPoint'](topLeftPoint, height,width);
        expect(result).toEqual({ x: 10, y: 20 });
    });
   

    it('setGridSpaces should update squareSize',()=>{
        let size=15;
        service.setGridSpaces(size);
        expect(service.squareSize).toEqual(15);

    });
});
