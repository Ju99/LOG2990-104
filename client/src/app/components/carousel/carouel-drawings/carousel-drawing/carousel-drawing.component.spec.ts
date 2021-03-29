import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CarouselDrawingComponent } from './carousel-drawing.component';

describe('CarouselDrawingComponent', () => {
    let component: CarouselDrawingComponent;
    let fixture: ComponentFixture<CarouselDrawingComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CarouselDrawingComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CarouselDrawingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
