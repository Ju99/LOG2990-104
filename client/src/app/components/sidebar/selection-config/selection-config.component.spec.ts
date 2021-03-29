import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionConfigComponent } from './selection-config.component';

describe('SelectionConfigComponent', () => {
    let component: SelectionConfigComponent;
    let fixture: ComponentFixture<SelectionConfigComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SelectionConfigComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectionConfigComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
