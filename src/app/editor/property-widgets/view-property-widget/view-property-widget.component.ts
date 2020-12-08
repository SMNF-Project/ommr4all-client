import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ViewSettings} from '../../sheet-overlay/views/view';

@Component({
  selector: 'app-view-property-widget',
  templateUrl: './view-property-widget.component.html',
  styleUrls: ['./view-property-widget.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewPropertyWidgetComponent implements OnInit {
  @Input() viewSettings: ViewSettings = null;
  @Output() viewSettingsChange = new EventEmitter<ViewSettings>();
  @Output() resetToDefault = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  get showStaffLines() { return this.viewSettings.showStaffLines; }
  get showStaffGroupShading() { return this.viewSettings.showStaffGroupShading; }
  get showSymbols() { return this.viewSettings.showSymbols; }
  get showLayout() { return this.viewSettings.showLayout; }
  get showBoundingBoxes() { return this.viewSettings.showBoundingBoxes; }
  get showReadingOrder() { return this.viewSettings.showReadingOrder; }
  get showAnnotations() { return this.viewSettings.showAnnotations; }
  get showComments() { return this.viewSettings.showComments; }
  get showBackground() { return this.viewSettings.showBackground; }
  get showSymbolsCenterOnly() { return this.viewSettings.showSymbolCenterOnly; }
  get activeReading() { return this.viewSettings.activeReading; }
  get availableReadings() { return this.viewSettings.availableReadings; }
  get showWorks() { return this.viewSettings.showWorks; }

  set showStaffLines(show: boolean) {
    if (show === this.showStaffLines) { return; }
    this.viewSettings.showStaffLines = show;
    if (show) { this.viewSettings.showWorks = false; }
    this.viewSettingsChange.emit(this.viewSettings);
  }
  set showSymbols(show: boolean) {
    if (this.showSymbols !== show) {
      this.viewSettings.showSymbols = show;
      if (show) { this.viewSettings.showWorks = false; }
      this.viewSettingsChange.emit(this.viewSettings);
    }
  }
  set showLayout(show: boolean) {
    if (this.showLayout === show) { return; }
    this.viewSettings.showLayout = show;
    if (show) { this.viewSettings.showWorks = false; }
    this.viewSettingsChange.emit(this.viewSettings);
  }
  set showStaffGroupShading(show: boolean) {
    if (this.showStaffGroupShading === show) { return; }
    this.viewSettings.showStaffGroupShading = show;
    if (show) { this.viewSettings.showWorks = false; }
    this.viewSettingsChange.emit(this.viewSettings);
  }

  set showBoundingBoxes(show: boolean) {
    if (this.showBoundingBoxes === show) { return; }
    this.viewSettings.showBoundingBoxes = show;
    if (show) { this.viewSettings.showWorks = false; }
    this.viewSettingsChange.emit(this.viewSettings);
  }

  set showReadingOrder(show: boolean) {
    if (this.showReadingOrder === show) { return; }
    this.viewSettings.showReadingOrder = show;
    if (show) { this.viewSettings.showWorks = false; }
    this.viewSettingsChange.emit(this.viewSettings);
  }

  set showAnnotations(show: boolean) {
    if (this.showAnnotations === show) { return; }
    this.viewSettings.showAnnotations = show;
    this.viewSettingsChange.emit(this.viewSettings);
  }

  set showComments(show: boolean) {
    if (this.showComments === show) { return; }
    this.viewSettings.showComments = show;
    this.viewSettingsChange.emit(this.viewSettings);
  }

  set showBackground(show: boolean) {
    if (this.showBackground === show) { return; }
    this.viewSettings.showBackground = show;
    this.viewSettingsChange.emit(this.viewSettings);
  }

  set showSymbolsCenterOnly(show: boolean) {
    if (this.showSymbolsCenterOnly === show) { return; }
    this.viewSettings.showSymbolCenterOnly = show;
    this.viewSettingsChange.emit(this.viewSettings);
  }

  set activeReading(reading: string) {
    if (this.activeReading === reading) { return; }
    this.viewSettings.activeReading = reading;
    this.viewSettingsChange.emit(this.viewSettings);
  }

  set availableReadings(readings: Array<string>) {
    if (readings === this.availableReadings) { return; }
    this.availableReadings = readings;
    this.viewSettingsChange.emit(this.viewSettings);
  }

  set showWorks(show: boolean) {
    this.viewSettings.showWorks = show;

    // Dependencies here!
    // - do not show layout, symbols, stafflines, staff groups, bounding boxes, reading order
    // this.viewSettings.showAnnotations = false;
    if (show) {
      this.viewSettings.showBoundingBoxes = false;
      this.viewSettings.showStaffLines = false;
      this.viewSettings.showStaffGroupShading = false;
      this.viewSettings.showLayout = false;
      this.viewSettings.showSymbols = false;
      this.viewSettings.showReadingOrder = false;
    } else {
      this.viewSettings.showLayout = true;
    }

    this.viewSettingsChange.emit(this.viewSettings);
  }
}
