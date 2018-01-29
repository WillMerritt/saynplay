const {Bishop, Rook, Pawn, Queen, King, Knight} = require('./classes/Pieces');

const getChessPiecesRow = function(color, id) {
  return [
    new Rook(color, id + 0),
    new Knight(color, id + 1),
    new Bishop(color, id + 2),
    new Queen(color, id + 3),
    new King(color, id + 4),
    new Bishop(color, id + 5),
    new Knight(color, id + 6),
    new Rook(color, id + 7)]
};

const getChessPawnsRow = function(color, id) {
  var arr = [];
  for (let i = id; i < id + 8; i ++) {
    arr.push(new Pawn(color, i));
  }
  return arr;
};

const getChessEmptyRow = function() {
  return new Array(8);
}



const createChessBoard = function() {
  return [
    getChessPiecesRow('dark', 0),
    getChessPawnsRow('dark', 8),
    getChessEmptyRow(),
    getChessEmptyRow(),
    getChessEmptyRow(),
    getChessEmptyRow(),
    getChessPawnsRow('light', 16),
    getChessPiecesRow('light', 24)
  ]
};

module.exports = {
  createChessBoard: createChessBoard
};
