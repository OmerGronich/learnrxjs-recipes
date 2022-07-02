// import {BehaviorSubject, combineLatest, fromEvent, interval} from "rxjs";/
// import {map, startWith, switchMap, scan, takeWhile} from "rxjs/operators";
import "./style.css";
import {
  BehaviorSubject,
  fromEvent,
  interval,
  map,
  scan,
  startWith,
  switchMap,
  takeWhile,
} from "rxjs";
import { GameState, Letters } from "./model";
import { getRandomLetter } from "./utils";

// ideas to make game better:
// * Toggle for case sensitivity
// * game restart

const letterIntervalSubject = new BehaviorSubject(600);
const speedAdjust = 50;
let levelThreshold = 10;

const container = document.querySelector<HTMLDivElement>(".letters")!;
const scoreElement = document.querySelector<HTMLDivElement>(".score-value")!;
const levelElement = document.querySelector<HTMLDivElement>(".level-value")!;
const noop = () => {};

const letters$ = letterIntervalSubject.pipe(
  switchMap((i) =>
    interval(i).pipe(
      scan<number, Letters>(
        ({ value }) => {
          const randomLetter = getRandomLetter();
          const letterElement = document.createElement("div");
          letterElement.classList.add("letter");
          letterElement.textContent = randomLetter;

          // letter random X position
          const randomX = Math.floor(
            Math.random() *
              (container.offsetWidth - letterElement.offsetWidth * 2)
          );
          letterElement.style.left = randomX + "px";

          return {
            interval: i,
            value: [
              { xPos: randomX, value: randomLetter, element: letterElement },
              ...value,
            ],
          };
        },
        {
          value: [],
          interval: 0,
        }
      )
    )
  )
);

const keys$ = fromEvent<KeyboardEvent>(document, "keydown").pipe(
  startWith({ key: "" } as KeyboardEvent),
  map((e: KeyboardEvent) => e.key)
);

const game$ = letters$.pipe(
  switchMap((l) => keys$.pipe(map((key) => [l, key] as [Letters, string])))
);

function renderGameOver() {
  const gameOverElement = document.createElement("div");
  gameOverElement.textContent = "GAME OVER";
  document.body.appendChild(gameOverElement);
}

function renderGame(gameState: GameState) {
  container.innerHTML = "";
  gameState.letters.forEach((l) => container.appendChild(l.element));
  scoreElement.textContent = gameState.score.toString();
  levelElement.textContent = gameState.level.toString();
}

const canContinueGame = () => {
  const lastChild = container.children[
    container.children.length - 1
  ] as HTMLDivElement;
  const inBound =
    lastChild?.offsetTop < container.offsetHeight - lastChild?.offsetHeight * 2;
  return !lastChild || inBound;
};

game$
  .pipe(
    scan<[Letters, string], GameState>(
      (gameState, [letters, key]) => {
        const newGameState = { ...gameState, letters: letters.value };
        const lastLetter = letters.value[letters.value.length - 1];
        if (lastLetter && key === lastLetter.value) {
          const nextLevel =
            newGameState.score + 1 !== 0 &&
            (newGameState.score + 1) % levelThreshold === 0;
          nextLevel ? (letters.value = []) : letters.value.pop();
          nextLevel &&
            letterIntervalSubject.next(letters.interval - speedAdjust);

          const score = newGameState.score + 1;
          const level = nextLevel ? newGameState.level + 1 : newGameState.level;

          return {
            score,
            level,
            letters: letters.value,
          };
        }

        return newGameState;
      },
      {
        score: 0,
        level: 1,
        letters: [],
      }
    ),
    takeWhile(canContinueGame)
  )
  .subscribe(renderGame, noop, renderGameOver);
