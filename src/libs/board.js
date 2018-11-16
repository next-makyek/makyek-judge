import assert from 'assert';


import makyek from 'libreversi';
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

  constructor(size, roundLimit) {
    assert(size > 0);
    utils.log('debug', {action: 'createBoard', size});
    this.size = size;
    this.roundLimit = roundLimit;
    this.roundsCount = 0;
    this.steps = [];
    this.clear();
  }

  clear() {
    this.board = new makyek.Board();
    this.nextField = Board.FIELD_BLACK;
    this.state = Board.BOARD_STATE_GOING;
    utils.log('debug', {action: 'clearBoard', board: this.getBoardMap(), nextField: this.nextField, newState: this.state});
  }

  getBoardMap() {
    return this.board.board;
  }

  getSteps() {
    return this.steps;
  }

  place(x, y, option) {
    this.steps.push([this.nextField, x, y, option]);
    assert(this.state === Board.BOARD_STATE_GOING);
    if (!this.board.inBound(x, y)) {
      throw new errors.UserError(`Invalid placement: Position out of board.`);
    }
    if (this.getBoardMap()[x][y] !== this.nextField) {
      throw new errors.UserError(`Invalid placement: The position (${x}, ${y}) is not your stone. ${this.getBoardMap()[x][y]}, ${this.nextField}`);
    }

    const field = this.nextField;
    const oppoField = Board.getOppositeField(field);

    if (!this.board.canPlaceAt(field, x, y, option)) {
      throw new errors.UserError(`Invalid placement: Cannot put at stone at position (${x}, ${y}).`);
    }

    this.board.placeAt(field, x, y, option);
    utils.log('debug', {action: 'place', position: [x, y], option, field});

    this.roundsCount++;
    let ended = false;
    if (!this.board.hasAvailablePlacement(oppoField)) {
      ended = true;
      if (this.nextField === Board.FIELD_BLACK) {
        this.state = Board.BOARD_STATE_WIN_BLACK;
      } else {
        this.state = Board.BOARD_STATE_WIN_WHITE;
      }

      const info = {
        action: 'roundEnd',
        board: this.getBoardMap(),
        causedBy: 'hasAvailablePlacement'
      };
      utils.log('debug', info);
    } else if (this.roundsCount > this.roundLimit) {
      ended = true;
      const analytics = this.board.count();
      if (analytics[Board.FIELD_BLACK] > analytics[Board.FIELD_WHITE]) {
        this.state = Board.BOARD_STATE_WIN_BLACK;
      } else if (analytics[Board.FIELD_BLACK] < analytics[Board.FIELD_WHITE]) {
        this.state = Board.BOARD_STATE_WIN_WHITE;
      } else {
        this.state = Board.BOARD_STATE_DRAW;
      }

      const info = {
        action: 'roundEnd',
        causedBy: 'roundLimit',
        'roundsCount': this.roundsCount,
        'roundLimit': this.roundLimit,
        analytics,
        board: this.getBoardMap()
      };
      utils.log('debug', info);
    }

    this.nextField = oppoField;

    // console.log(`field: ${field}, round: ${this.roundsCount}`);
    // for (let i = 0; i < this.size; i++) {
    //   let str = '';
    //   for (let j = 0; j < this.size; j++) {
    //     if (this.getBoardMap()[i][j] === Board.FIELD_BLACK) {
    //       str += 'O';
    //     } else if (this.getBoardMap()[i][j] === Board.FIELD_WHITE) {
    //       str += 'X';
    //     } else if (this.getBoardMap()[i][j] === Board.FIELD_BLANK) {
    //       str += '.';
    //     }
    //   }
    //   console.log(str);
    // }

    return {x, y, option, ended};
  }
}

Board.FIELD_BLANK = makyek.STATE_EMPTY;
Board.FIELD_BLACK = makyek.STATE_BLACK;
Board.FIELD_WHITE = makyek.STATE_WHITE;

Board.BOARD_STATE_GOING = 0;
Board.BOARD_STATE_WIN_BLACK = 1;
Board.BOARD_STATE_WIN_WHITE = 2;
Board.BOARD_STATE_DRAW = 3;
