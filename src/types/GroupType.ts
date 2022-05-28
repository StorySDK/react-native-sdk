import type {StoryType} from './index';

export interface GroupType {
  id: string;
  imageUrl: string;
  title: string;
  stories: StoryType[];
}
