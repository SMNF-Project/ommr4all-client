import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SheetOverlayComponent } from './sheet-overlay/sheet-overlay.component';
import { LineEditorComponent } from './line-editor/line-editor.component';
import { ToolBarComponent } from './tool-bar/tool-bar.component';
import { StaffGrouperComponent } from './staff-grouper/staff-grouper.component';
import { DebugComponent } from './debug/debug.component';
import { SymbolEditorComponent } from './symbol-editor/symbol-editor.component';
import { RectEditorComponent } from './rect-editor/rect-editor.component';
import { LyricsEditorComponent } from './lyrics-editor/lyrics-editor.component';
import {FormsModule} from '@angular/forms';
import { AutoInputResizeDirective } from './autoinputresize.directive';
import { PagesPreviewComponent } from './pages-preview/pages-preview.component';
import {HttpModule} from '@angular/http';
import { SymbolComponent } from './symbol/symbol.component';
import { PreprocessingComponent } from './preprocessing/preprocessing.component';
import { LoaderIconComponent } from './loader-icon/loader-icon.component';
import { SelectionBoxComponent } from './selection-box/selection-box.component';
import { BookViewComponent } from './book-view/book-view.component';
import { BooksPreviewComponent } from './book-view/books-preview/books-preview.component';
import { PageUploaderComponent } from './book-view/page-uploader/page-uploader.component';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import {RouterModule, Routes} from '@angular/router';
import { BookListViewComponent } from './book-list-view/book-list-view.component';
import { EditorComponent } from './editor/editor.component';
import 'reflect-metadata';
import { TextRegionComponent } from './sheet-overlay/editor-tools/text-region/text-region.component';
import { TextLineComponent } from './sheet-overlay/elements/text-line/text-line.component';
import { PolylineComponent } from './sheet-overlay/elements/polyline/polyline.component';
import { PolylineEditorComponent } from './sheet-overlay/editors/polyline-editor/polyline-editor.component';
import { NonScalingPointComponent } from './sheet-overlay/elements/non-scaling-point/non-scaling-point.component';
import { NonScalingComponent } from './sheet-overlay/elements/non-scaling-component/non-scaling.component';
import { LayoutEditorComponent } from './sheet-overlay/editor-tools/layout-editor/layout-editor.component';
import {ContextMenuModule} from 'ngx-contextmenu';
import { RegionTypeContextMenuComponent } from './sheet-overlay/context-menus/region-type-context-menu/region-type-context-menu.component';
import { NotePropertyWidgetComponent } from './editor/property-widgets/note-property-widget/note-property-widget.component';
import { TextEditorComponent } from './sheet-overlay/editor-tools/text-editor/text-editor.component';
import { TextEditorOverlayComponent } from './sheet-overlay/editor-tools/text-editor/text-editor-overlay/text-editor-overlay.component';

const appRoutes: Routes = [
  { path: 'book', component: BookListViewComponent },
  { path: 'book/:book_id/:page_id/edit', component: EditorComponent },
  { path: 'book/:book_id/:page_id', component: BookViewComponent },
  { path: 'book/:book_id', component: BookViewComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    SheetOverlayComponent,
    LineEditorComponent,
    ToolBarComponent,
    StaffGrouperComponent,
    DebugComponent,
    SymbolEditorComponent,
    RectEditorComponent,
    LyricsEditorComponent,
    AutoInputResizeDirective,
    PagesPreviewComponent,
    SymbolComponent,
    PreprocessingComponent,
    LoaderIconComponent,
    SelectionBoxComponent,
    BookViewComponent,
    BooksPreviewComponent,
    PageUploaderComponent,
    BookListViewComponent,
    EditorComponent,
    TextRegionComponent,
    TextLineComponent,
    PolylineComponent,
    PolylineEditorComponent,
    NonScalingPointComponent,
    NonScalingComponent,
    LayoutEditorComponent,
    RegionTypeContextMenuComponent,
    NotePropertyWidgetComponent,
    TextEditorComponent,
    TextEditorOverlayComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    DropzoneModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true }  // Debuggung only
    ),
    ContextMenuModule.forRoot(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
