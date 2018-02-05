class Piece {
  constructor(color, id){
    this.color = color;
    this.name = this.constructor.name.toLowerCase();
    this.id = id;

    // this.position = position
    this.moved = false;
    // this.justMoved = false;
    this.value = this.getValue();
  }
  getValue() {
    switch (this.constructor.name.toLowerCase()) {
      case 'pawn':
        return 1;
      case 'knight':
        return 3;
      case 'rook':
        return 5;
      case 'bishop':
        return 3.5;
      case 'queen':
        return 9;
      case 'king':
        return 90;
      default:
        return 0;
    }
  }
}


class Rook extends Piece {

}

class Pawn extends Piece { }

class Queen extends Piece { }

class King extends Piece { }

class Knight extends Piece { }

class Bishop extends Piece { }

module.exports = {
  Rook: Rook,
  Pawn: Pawn,
  Queen: Queen,
  King: King,
  Knight: Knight,
  Bishop: Bishop
};
