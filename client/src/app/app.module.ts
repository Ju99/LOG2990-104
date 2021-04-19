import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { CarouselDrawingComponent } from './components/carousel/carouel-drawings/carousel-drawing/carousel-drawing.component';
import { CarouselComponent } from './components/carousel/carousel-modal/carousel.component';
import { ConfigPanelComponent } from './components/config-panel/config-panel.component';
import { DrawingComponent } from './components/drawing/drawing.component';
import { EditorComponent } from './components/editor/editor.component';
import { ExportModalComponent } from './components/export-modal/export-modal.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { NewDrawModalComponent } from './components/new-draw-modal/new-draw-modal.component';
import { SaveDrawingModalComponent } from './components/save-drawing-modal/save-drawing-modal.component';
import { AlphaSliderComponent } from './components/sidebar/color-components/alpha-slider/alpha-slider.component';
import { ColorDisplayerComponent } from './components/sidebar/color-components/color-displayer/color-displayer.component';
import { ColorPaletteComponent } from './components/sidebar/color-components/color-palette/color-palette.component';
import { ColorPickerComponent } from './components/sidebar/color-components/color-picker/color-picker.component';
import { ColorPopupComponent } from './components/sidebar/color-components/color-popup/color-popup.component';
import { ColorSliderComponent } from './components/sidebar/color-components/color-slider/color-slider.component';
import { EllipseConfigComponent } from './components/sidebar/ellipse-config/ellipse-config.component';
import { EraserConfigComponent } from './components/sidebar/eraser-config/eraser-config.component';
import { FileMenuComponent } from './components/sidebar/file-menu/file-menu.component';
import { GridComponent } from './components/sidebar/grid-config/grid/grid.component';
import { LineConfigComponent } from './components/sidebar/line-config/line-config.component';
import { PaintConfigComponent } from './components/sidebar/paint-config/paint-config/paint-config.component';
import { SliderComponent } from './components/sidebar/paint-config/paint-config/slider/slider/slider.component';
import { PencilConfigComponent } from './components/sidebar/pencil-config/pencil-config.component';
import { PipetteComponent } from './components/sidebar/pipette-config/pipette.component';
import { PolygonConfigComponent } from './components/sidebar/polygon-config/polygon-config.component';
import { RectangleConfigComponent } from './components/sidebar/rectangle-config/rectangle-config.component';
import { SelectionConfigComponent } from './components/sidebar/selection-config/selection-config.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SprayConfigComponent } from './components/sidebar/spray-config/spray-config.component';
import { StampComponent } from './components/sidebar/stamp-config/stamp-config.component';
import { TextConfigComponent } from './components/sidebar/text-config/text-config.component';
import { ToolsListComponent } from './components/sidebar/tools-list/tools-list.component';

@NgModule({
    declarations: [
        AppComponent,
        EditorComponent,
        SidebarComponent,
        DrawingComponent,
        MainPageComponent,
        FileMenuComponent,
        ToolsListComponent,
        ColorPickerComponent,
        ColorPaletteComponent,
        ColorSliderComponent,
        ColorDisplayerComponent,
        PencilConfigComponent,
        AlphaSliderComponent,
        EraserConfigComponent,
        LineConfigComponent,
        PencilConfigComponent,
        NewDrawModalComponent,
        EllipseConfigComponent,
        RectangleConfigComponent,
        ColorPopupComponent,
        ConfigPanelComponent,
        ExportModalComponent,
        PipetteComponent,
        PolygonConfigComponent,
        SprayConfigComponent,
        SelectionConfigComponent,
        SaveDrawingModalComponent,
        CarouselComponent,
        CarouselDrawingComponent,
        StampComponent,
        PaintConfigComponent,
        SliderComponent,
        GridComponent,
        TextConfigComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        MatDialogModule,
        MatIconModule,
        MatButtonModule,
        MatListModule,
        MatGridListModule,
        MatTooltipModule,
        FormsModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        DragDropModule,
        MatSliderModule,
        MatSelectModule,
        MatInputModule,
        MatButtonToggleModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        BrowserAnimationsModule,
        MatSidenavModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatCheckboxModule,
    ],
    entryComponents: [ColorPopupComponent, ColorPickerComponent],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
