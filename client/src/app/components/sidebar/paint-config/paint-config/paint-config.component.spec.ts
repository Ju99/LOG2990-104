import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PaintConfigComponent } from './paint-config.component';

// tslint:disable
describe('PaintConfigComponent', () => {
    let component: PaintConfigComponent;
    let fixture: ComponentFixture<PaintConfigComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PaintConfigComponent],
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
});
