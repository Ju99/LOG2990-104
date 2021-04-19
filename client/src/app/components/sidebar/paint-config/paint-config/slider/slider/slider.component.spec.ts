import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SliderComponent } from './slider.component';

// tslint:disable
describe('SliderComponent', () => {
    let component: SliderComponent;
    let fixture: ComponentFixture<SliderComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports:[FormsModule],
            declarations: [SliderComponent],
            schemas:[CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SliderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit value',()=>{
        spyOn(component.valueChange,'emit');
        component.value=1;
        component.step=1;
        component.changeValue();
        expect(component.valueChange.emit).toHaveBeenCalled();

    });

});
