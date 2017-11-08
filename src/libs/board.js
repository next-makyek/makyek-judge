import assert from 'assert';

import reversi from 'libreversi';
import errors from './errors';
import utils from './utils';

export default class Board {
  static translateField(fieldText) {
    assert(fieldText === 'black' || fieldText === 'white');
    if (fieldText === 'black') {
      return Board.FIELD_BLACK;
    } else if (fieldText === 'white') {
      return Board.FIELD_WHITE;
    }
  }

  static getOppositeField(field) {
    assert(field === Board.FIELD_BLACK || field === Board.FIELD_WHITE);
    if (field === Board.FIELD_BLACK) {
      return Board.FIELD_WHITE;
    } else if (field === Board.FIELD_WHITE) {
      return Board.FIELD_BLACK;
    }
  }

  constructor(size) {
    assert(size > 0);
    utils.log('debug', {action: 'createBoard', size});
    this.size = size;
    this.clear();
  }

  clear() {
    this.board = new reversi.Board(this.size);
    this.nextField = Board.FIELD_BLACK;
    this.state = Board.BOARD_STATE_GOING;
    utils.log('debug', {action: 'clearBoard', board: this.getBoardMap(), nextField: this.nextField, newState: this.state});
  }

  getBoardMap() {
    return this.board.board;
  }

  getOrderMap() {
    return this.board.order;
  }

  place(row, col) {
    assert(this.state === Board.BOARD_STATE_GOING);
    if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
      throw new errors.UserError(`Invalid placement: Position out of board.`);
    }
    if (this.getBoardMap()[row][col] !== Board.FIELD_BLANK) {
      throw new errors.UserError(`Invalid placement: There is already a stone at position (${row}, ${col}).`);
    }

    const field = this.nextField;
    const oppoField = Board.getOppositeField(field);

    if (!this.board.canPlaceAt(field, row, col)) {
      throw new errors.UserError(`Invalid placement: Cannot put at stone at position (${row}, ${col}).`);
    }

    this.board.placeAt(field, row, col);
    utils.log('debug', {action: 'place', position: [row, col], field});

    let switchField;
    let ended;
    if (this.board.hasAvailablePlacement(oppoField)) {
      switchField = true;
      ended = false;
    } else if (this.board.hasAvailablePlacement(field)) {
      switchField = false;
      ended = false;
    } else {
      switchField = false;
      ended = true;
    }
    if (switchField) {
      this.nextField = oppoField;
    }
    if (ended) {
      const analytics = this.board.count();
      if (analytics[Board.FIELD_BLACK] > analytics[Board.FIELD_WHITE]) {
        this.state = Board.BOARD_STATE_WIN_BLACK;
      } else if (analytics[Board.FIELD_BLACK] < analytics[Board.FIELD_WHITE]) {
        this.state = Board.BOARD_STATE_WIN_WHITE;
      } else {
        this.state = Board.BOARD_STATE_DRAW;
      }
      const info = {action: 'roundEnd', board: this.getBoardMap(), analytics};
      utils.log('debug', info);
    }

    return {row, col, ended};
  }
}

Board.FIELD_BLANK = reversi.STATE_EMPTY;
Board.FIELD_BLACK = reversi.STATE_BLACK;
Board.FIELD_WHITE = reversi.STATE_WHITE;

Board.BOARD_STATE_GOING = 0;
Board.BOARD_STATE_WIN_BLACK = 1;
Board.BOARD_STATE_WIN_WHITE = 2;
Board.BOARD_STATE_DRAW = 3;
