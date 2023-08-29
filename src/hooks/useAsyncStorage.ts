import { useEffect, useState } from 'react';
import { AsyncStorage } from 'react-native';

export const useAsyncStorage = (key: string, initialValue: any) => {
  const [data, setData] = useState(initialValue);
  const [retrivedFromStorage, setRetrievedFromStorage] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const value = await AsyncStorage.getItem(key);
        setData(JSON.parse(value as string) || initialValue);
        setRetrievedFromStorage(true);
      } catch (error) {
        console.error('useAsyncStorage getItem error:', error);
      }
    })();
  }, [key, initialValue]);

  const setNewData = async (value: object) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      setData(value);
    } catch (error) {
      console.error('useAsyncStorage setItem error:', error);
    }
  };

  return [data, setNewData, retrivedFromStorage];
};
