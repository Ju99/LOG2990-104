import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PaintBucketService } from '@app/services/tools/paint-bucket/paint-bucket.service';
import { PaintConfigComponent } from './paint-config.component';

// tslint:disable
describe('PaintConfigComponent', () => {
    let component: PaintConfigComponent;
    let fixture: ComponentFixture<PaintConfigComponent>;
    let paintBucketServiceSpy:jasmine.SpyObj<PaintBucketService>;

    beforeEach(async(() => {
        paintBucketServiceSpy=jasmine.createSpyObj('PaintBucketService',['setToleranceValue']);
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [PaintConfigComponent],
            providers:[{provide:PaintBucketService, useValue:paintBucketServiceSpy}],
            imports: [MatSliderModule, FormsModule, BrowserAnimationsModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PaintConfigComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set tolerance value',()=>{
        component.tolerance=1;
        component.setToleranceValue(3);
        expect(paintBucketServiceSpy.setToleranceValue).toHaveBeenCalled();
        expect(component.tolerance).toEqual(3);
    });
});
