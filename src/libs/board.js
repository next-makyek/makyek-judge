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

  constructor(size) {
    assert(size > 0);
    utils.log('debug', {action: 'createBoard', size});
    this.size = size;
    this.steps = [];
    this.roundsCount = 0;
    this.initialStoneNums = 4;
    this.clear();
  }

  clear() {
    this.board = new makyek.Board(this.size);
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

  _deepcopyArr(arr) {
    var outarr = [],len = arr.length;
    for (var i=0; i < len; i++) {
         outarr[i]=new Array();
         for(var j=0;j<arr[i].length;j++){
            outarr[i][j]=arr[i][j];
         }
    }
    return outarr;
  }

  _isFive(x, y, field) {
    var count = 1;
    var reset = function() {
      count = 1;
    }
    // check vertical
    for (var i = x + 1; true; i++){
      if (i >= this.size) {
        break;
      }
      if (this.board.board[i][y] !== field) {
        break;
      }
      count++;
      if (count >= 5) {
        return true;
      }
    }
    for (var i = x - 1; true; i--){
      if (i <= 0) {
        break;
      }
      if (this.board.board[i][y] !== field) {
        break;
      }
      count++;
      if (count >= 5) {
        return true;
      }
    }
    // check horizontal
    reset();
    for (var i = y + 1; true; i++){
      if (i >= this.size) {
        break;
      }
      if (this.board.board[x][i] !== field) {
        break;
      }
      count++;
      if (count >= 5) {
        return true;
      }
    }
    for (var i = y - 1; true; i--){
      if (i <= 0) {
        break;
      }
      if (this.board.board[x][i] !== field) {
        break;
      }
      count++;
      if (count >= 5) {
        return true;
      }
    }
    // check //
    reset();
    for (var i = 1; true; i++){
      var new_x = x + i;
      var new_y = y + i;
      if (new_x >= this.size || new_y >= this.size) {
        break;
      }
      if (this.board.board[new_x][new_y] !== field) {
        break;
      }
      count++;
      if (count >= 5) {
        return true;
      }
    }
    for (var i = 1; true; i++){
      var new_x = x - i;
      var new_y = y - i;
      if (new_x <= 0 || new_y <= 0) {
        break;
      }
      if (this.board.board[new_x][new_y] !== field) {
        break;
      }
      count++;
      if (count >= 5) {
        return true;
      } 
    }
    // check \\
    reset();
    for (var i = 1; true; i++){
      var new_x = x + i;
      var new_y = y - i;
      if (new_x >= this.size || new_y <= 0) {
        break;
      }
      if (this.board.board[new_x][new_y] !== field) {
        break;
      }
      count++;
      if (count >= 5) {
        return true;
      }
    }
    for (var i = 1; true; i++){
      var new_x = x - i;
      var new_y = y + i;
      if (new_x <= 0 || new_y >= this.size) {
        break;
      }
      if (this.board.board[new_x][new_y] !== field) {
        break;
      }
      count++;
      if (count >= 5) {
        return true;
      } 
    }
    return false;
  }

  _isLastPlacement() {
    return this.roundsCount + this.initialStoneNums === this.size * this.size;
  }

  place(order) {
    // order: "[X, Y]"

    // get postion
    let x, y;
    try {
      x = order[0];
      y = order[1];
    } catch (error) {
      console.log("[ERROR] error in board.js place, error is:", error);
    }
    // get the field
    const field = this.nextField;
    const oppoField = Board.getOppositeField(field);
    // check board state
    assert(this.state === Board.BOARD_STATE_GOING);
    // check postion is in bound
    if (!this.board.inBound(x, y)) {
      if (this.nextField === Board.FIELD_BLACK) {
        this.state = Board.BOARD_STATE_WIN_WHITE;
      } else {
        this.state = Board.BOARD_STATE_WIN_BLACK;
      }
      throw new errors.UserError(`Invalid placement: The position is out of board.`);
    }
    // check postion is can placed
    if (!this.board.canPlaceAt(field, x, y)) {
      if (this.nextField === Board.FIELD_BLACK) {
        this.state = Board.BOARD_STATE_WIN_WHITE;
      } else {
        this.state = Board.BOARD_STATE_WIN_BLACK;
      }
      throw new errors.UserError(`Invalid placement: Cannot move.`);
    }
    // place stone
    this.board.placeAt(field, x, y);
    this.roundsCount++;
    // 
    this.steps.push([this.nextField, x, y]);
    utils.log('debug', { action: 'place', field: field, position: order.join(' ') });
    // check is win
    if (this._isFive(x, y, field)) {
      if (this.nextField === Board.FIELD_BLACK) {
        this.state = Board.BOARD_STATE_WIN_WHITE;
      } else {
        this.state = Board.BOARD_STATE_WIN_BLACK;
      }
    }
    // check is last place
    if (this._isLastPlacement()) {
      this.state = Board.BOARD_STATE_DRAW;
    }
    this.nextField = oppoField;
    return true;
  }
}

Board.FIELD_BLANK = makyek.STATE_EMPTY;
Board.FIELD_BLACK = makyek.STATE_BLACK;
Board.FIELD_WHITE = makyek.STATE_WHITE;

Board.BOARD_STATE_GOING = 0;
Board.BOARD_STATE_WIN_BLACK = 1;
Board.BOARD_STATE_WIN_WHITE = 2;
Board.BOARD_STATE_DRAW = 3;
