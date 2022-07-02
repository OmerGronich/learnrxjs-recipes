import { ALPHABET } from "./constants";

export const generateEmptyLetterColumns = (columns: number): string[] =>
  Array.from(
    {
      length: columns
    },
    (_, index) => `<div class="letter-${index}"></div>`
  );
export const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
export const getRandomLetter = () =>
  ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
