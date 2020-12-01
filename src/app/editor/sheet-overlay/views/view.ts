export class ViewSettings {
  constructor(
    public showStaffLines = true,
    public showStaffGroupShading = false,
    public showLayout = true,
    public showSymbols = false,
    public showBoundingBoxes = true,
    public showReadingOrder = false,
    public showAnnotations = false,
    public showComments = true,

    public showBackground = true,
    public showSymbolCenterOnly = false,

    public activeReading = 'Transcription',
    public availableReadings: Array<string> = []
  ) {
  }

  copy(): ViewSettings {
    return Object.assign({}, this) as ViewSettings;
  }
}
