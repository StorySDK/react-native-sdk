export * from './stylesUtils';

export const calculateTime = (time: number) => {
  const days = Math.floor(time / (1000 * 60 * 60 * 24));
  const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((time / 1000 / 60) % 60);

  return {
    days: days < 10 ? `0${days > 0 ? days : 0}` : `${days}`,
    hours: hours < 10 ? `0${hours > 0 ? hours : 0}` : `${hours}`,
    minutes: minutes < 10 ? `0${minutes > 0 ? minutes : 0}` : `${minutes}`,
  };
};
