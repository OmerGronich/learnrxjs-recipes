
export interface Letter {
    xPos: number
    value: string;
    element: HTMLDivElement
}

export interface Letters {
    value: Letter[];
    interval: number;
}

export interface GameState {
    score: number,
    level: number,
    letters: Letter[],
}