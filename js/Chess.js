const {Bishop, Rook, Pawn, Queen, King, Knight} = require('./classes/Pieces');

const getChessPiecesRow = function(color) {
  return [
    new Rook(color),
    new Knight(color),
    new Bishop(color),
    new Queen(color),
    new King(color),
    new Bishop(color),
    new Knight(color),
    new Rook(color)]
};

const getChessPawnsRow = function(color) {
  return [
    new Pawn(color),
    new Pawn(color),
    new Pawn(color),
    new Pawn(color),
    new Pawn(color),
    new Pawn(color),
    new Pawn(color),
    new Pawn(color),
  ];
};

const getChessEmptyRow = function() {
  return new Array(8);
}

const createChessBoard = function() {
  return [
    getChessPiecesRow('dark'),
    getChessPawnsRow('dark'),
    getChessEmptyRow(),
    getChessEmptyRow(),
    getChessEmptyRow(),
    getChessEmptyRow(),
    getChessPawnsRow('light'),
    getChessPiecesRow('light')
  ]
};

module.exports = {
  createChessBoard: createChessBoard
};
