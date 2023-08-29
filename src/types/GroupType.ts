import type { StoryType } from './index';

export enum TypeOfGroup {
  GROUP = 'group',
  ONBOARDING = 'onboarding'
}

export enum StorySize {
  SMALL = 'SMALL',
  LARGE = 'LARGE'
}

export enum ScoreType {
  NUMBERS = 'numbers',
  LETTERS = 'letters'
}

export interface StoriesGroupSettings {
  storiesSize?: StorySize;
  isProgressHidden?: boolean;
  isProhibitToClose?: boolean;
  addToStories?: boolean;
  scoreType?: ScoreType;
  scoreResultLayersGroupId?: string;
}

export interface GroupType {
  id: string;
  imageUrl: string;
  title: string;
  stories: StoryType[];
  type: TypeOfGroup;
  settings?: StoriesGroupSettings;
}
