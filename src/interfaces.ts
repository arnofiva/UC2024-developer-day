export enum ScreenType {
  Time,
  Download,
  Upload,
  Realistic,
  Viewshed,
}

export interface UIActions {
  selectScreen(screen: ScreenType): Promise<void>;
}
