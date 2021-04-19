import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MagnetismService } from '@app/services/selection/magnetism.service';
import { GridComponent } from './grid.component';

// tslint:disable

describe('GridComponent', () => {
    let component: GridComponent;
    let fixture: ComponentFixture<GridComponent>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let magnetismServiceSpy: jasmine.SpyObj<MagnetismService>;

    beforeEach(async(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'setGrid']);
        magnetismServiceSpy = jasmine.createSpyObj('selectionService', ['setGridSpaces']);

        TestBed.configureTestingModule({
            declarations: [GridComponent],
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: MagnetismService, useValue: magnetismServiceSpy },
            ],
            imports: [MatSliderModule, MatSlideToggleModule, FormsModule, BrowserAnimationsModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GridComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call setgrid if grid is enabled', () => {
        component.switchGridView(true);
        expect(drawingServiceSpy.setGrid).toHaveBeenCalled();
    });

    it('should clear canvas when grid view is disabled', () => {
        component.switchGridView(false);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('should set grid spacing on grid size change if grid is enabled', () => {
        component.isEnabled = true;
        component.changeGridSize(10);
        expect(magnetismServiceSpy.setGridSpaces).toHaveBeenCalled();
        expect(drawingServiceSpy.setGrid).toHaveBeenCalled();
    });

    it('should not set grid spacing on grid size change if grid is enabled', () => {
        component.isEnabled = false;
        component.changeGridSize(10);
        expect(magnetismServiceSpy.setGridSpaces).toHaveBeenCalled();
        expect(drawingServiceSpy.setGrid).not.toHaveBeenCalled();
    });

    it('should change opacity on changeOpacity call and set grid if grid is enabled', () => {
        component.isEnabled = true;
        component.currentOpacity = 100;
        component.changeOpacity(50);
        expect(drawingServiceSpy.setGrid).toHaveBeenCalled();
        expect(component.currentOpacity).toEqual(50);
    });

    it('should  not change opacity on changeOpacity call and set grid if grid is enabled', () => {
        component.isEnabled = false;
        component.currentOpacity = 100;
        component.changeOpacity(50);
        expect(drawingServiceSpy.setGrid).not.toHaveBeenCalled();
        expect(component.currentOpacity).toEqual(50);
    });

    it('should setGrid ', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'g' });
        component.isEnabled = false;
        component.textService.isWriting = false;
        window.dispatchEvent(keyboardEvent);
        expect(drawingServiceSpy.setGrid).toHaveBeenCalled();
        expect(drawingServiceSpy.clearCanvas).not.toHaveBeenCalled();
    });

    it('should clearCanvas ', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'g' });
        component.isEnabled = true;
        component.textService.isWriting = false;
        window.dispatchEvent(keyboardEvent);
        expect(drawingServiceSpy.setGrid).not.toHaveBeenCalled();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });
    it('should not clearCanvas ', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'g' });
        component.textService.isWriting = true;
        window.dispatchEvent(keyboardEvent);
        expect(drawingServiceSpy.setGrid).not.toHaveBeenCalled();
        expect(drawingServiceSpy.clearCanvas).not.toHaveBeenCalled();
    });

    it('should increase squareSize', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'shift.+' });
        component.isEnabled = true;
        component.squareSize = 100;
        window.dispatchEvent(keyboardEvent);
        expect(magnetismServiceSpy.setGridSpaces).toHaveBeenCalled();
        expect(drawingServiceSpy.setGrid).toHaveBeenCalled();
    });

    it('should increase squareSize', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: '=' });
        component.isEnabled = true;
        component.squareSize = 100;
        window.dispatchEvent(keyboardEvent);
        expect(magnetismServiceSpy.setGridSpaces).toHaveBeenCalled();
        expect(drawingServiceSpy.setGrid).toHaveBeenCalled();
    });

    it('should  not increase squareSize', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'shift.+' });
        component.isEnabled = false;
        component.squareSize = 200;
        window.dispatchEvent(keyboardEvent);
        expect(drawingServiceSpy.setGrid).not.toHaveBeenCalled();
    });

    it('should decrease squareSize', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: '-' });
        component.isEnabled = true;
        component.squareSize = 100;
        window.dispatchEvent(keyboardEvent);
        expect(magnetismServiceSpy.setGridSpaces).toHaveBeenCalled();
        expect(drawingServiceSpy.setGrid).toHaveBeenCalled();
    });
    it('should not decrease squareSize', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: '-' });
        component.isEnabled = false;
        component.squareSize = 200;
        window.dispatchEvent(keyboardEvent);
        expect(drawingServiceSpy.setGrid).not.toHaveBeenCalled();
    });
});
