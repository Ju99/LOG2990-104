import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StampComponent } from './stamp-config.component';


//tslint:disable
describe('StampComponent', () => {
    let component: StampComponent;
    let fixture: ComponentFixture<StampComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StampComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StampComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
