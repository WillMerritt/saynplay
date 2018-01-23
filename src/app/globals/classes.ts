export class Piece {
  constructor(public name: string, public color: string) { }
}

export class Coor {
  constructor(public row: number, public col: number) { }
}

export class Pos {
  constructor(public x: number, public z: number) { }
}

export class Change {
  constructor(
    public oldCoor: Coor,
    public newCoor: Coor,
    public piece: Piece
  ) {}
}
