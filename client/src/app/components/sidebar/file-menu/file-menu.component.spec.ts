import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { NewDrawModalComponent } from '@app/components/new-draw-modal/new-draw-modal.component';
import { SaveDrawingModalComponent } from '@app/components/save-drawing-modal/save-drawing-modal.component';
import { IndexService } from '@app/services/index/index.service';
import { FileMenuComponent } from './file-menu.component';

// tslint:disable
describe('FileMenuComponent', () => {
    let component: FileMenuComponent;
    let fixture: ComponentFixture<FileMenuComponent>;
    let indexServiceSpy: jasmine.SpyObj<any>;
    const dialogSpy = {
        open: jasmine.createSpy('open'),
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FileMenuComponent, NewDrawModalComponent],
            imports: [MatIconModule, MatDialogModule, MatGridListModule],
            providers: [
                {
                    provide: MatDialog,
                    useValue: dialogSpy,
                },
                {
                    provide: IndexService,
                    useValue: indexServiceSpy,
                },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FileMenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open modal window to confirm creating a new drawing', () => {
        component.handleCreateDraw();
        expect(NewDrawModalComponent).toBeTruthy();
    });

    it('should open modal window to save drawing', () => {
        component.handleSaveDrawing();
        expect(SaveDrawingModalComponent).toBeTruthy();
    });
});
