export * from './widgetsParams';
export * from './WidgetType';
export * from './GroupType';
export * from './WidgetsTypes';
export * from './widgetElementsTypes';

export enum LoadingStatus {
  IDLE = 'idle',
  PENDING = 'pending',
  LOADED = 'loaded',
  ERROR = 'error',
}

export type AppType = {
  id: string;
  settings: {
    groupView: 'circle' | 'square' | 'bigSquare' | 'rectangle';
  };
  localization: {
    default: string;
    languages: string[];
  };
};

export type PlayStatusType = 'wait' | 'play' | 'pause';

export interface GroupItemProps {
  imageUrl: string;
  title: string;
  style: 'circle' | 'square' | 'bigSquare' | 'rectangle';
  active?: boolean;
}
