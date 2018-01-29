class Piece {
  constructor(color, id){
    this.color = color;
    this.name = this.constructor.name.toLowerCase()
    this.id = id;
    // this.position = position
  }
}


class Rook extends Piece {
  isLegal(new_pos, board) {
    return true
  }
}

class Pawn extends Piece {
  isLegal(new_pos, board) {
    return true
  }
}

class Queen extends Piece {
  isLegal(new_pos, board) {
    return true
  }
}

class King extends Piece {
  isLegal(new_pos, board) {
    return true
  }
}

class Knight extends Piece {
  isLegal(new_pos, board) {
    return true
  }
}

class Bishop extends Piece {
  isLegal(new_pos, board) {
    return true
  }
}

module.exports = {
  Rook: Rook,
  Pawn: Pawn,
  Queen: Queen,
  King: King,
  Knight: Knight,
  Bishop: Bishop
};
