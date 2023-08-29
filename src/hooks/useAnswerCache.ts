import { useAsyncStorage } from './useAsyncStorage';

export function useAnswersCache<T>(
  widgetId: string,
  initialState?: T
): [T, (answer: T) => void] {
  const [storedValue, setValue] = useAsyncStorage('StorySDK.answers', {});

  const setAnswer = (answer: T) => {
    setValue({
      ...storedValue,
      [widgetId]: answer,
    });
  };

  const selectedAnswer = storedValue[widgetId] || initialState;

  return [selectedAnswer, setAnswer];
}
