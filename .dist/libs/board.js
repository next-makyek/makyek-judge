'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _libreversi = require('libreversi');

var _libreversi2 = _interopRequireDefault(_libreversi);

var _errors = require('./errors');

var _errors2 = _interopRequireDefault(_errors);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Board = function () {
  (0, _createClass3.default)(Board, null, [{
    key: 'translateField',
    value: function translateField(fieldText) {
      (0, _assert2.default)(fieldText === 'black' || fieldText === 'white');
      if (fieldText === 'black') {
        return Board.FIELD_BLACK;
      } else if (fieldText === 'white') {
        return Board.FIELD_WHITE;
      }
    }
  }, {
    key: 'getOppositeField',
    value: function getOppositeField(field) {
      (0, _assert2.default)(field === Board.FIELD_BLACK || field === Board.FIELD_WHITE);
      if (field === Board.FIELD_BLACK) {
        return Board.FIELD_WHITE;
      } else if (field === Board.FIELD_WHITE) {
        return Board.FIELD_BLACK;
      }
    }
  }]);

  function Board(size, roundLimit) {
    (0, _classCallCheck3.default)(this, Board);

    (0, _assert2.default)(size > 0);
    _utils2.default.log('debug', { action: 'createBoard', size: size });
    this.size = size;
    this.roundLimit = roundLimit;
    this.roundsCount = 0;
    this.steps = [];
    this.clear();
  }

  (0, _createClass3.default)(Board, [{
    key: 'clear',
    value: function clear() {
      this.board = new _libreversi2.default.Board(this.size);
      this.nextField = Board.FIELD_BLACK;
      this.state = Board.BOARD_STATE_GOING;
      _utils2.default.log('debug', { action: 'clearBoard', board: this.getBoardMap(), nextField: this.nextField, newState: this.state });
    }
  }, {
    key: 'getBoardMap',
    value: function getBoardMap() {
      return this.board.board;
    }
  }, {
    key: 'getSteps',
    value: function getSteps() {
      return this.steps;
    }
  }, {
    key: 'place',
    value: function place(x, y, option) {
      this.steps.push([this.nextField, x, y, option]);
      (0, _assert2.default)(this.state === Board.BOARD_STATE_GOING);
      if (!this.board.inBound(x, y)) {
        throw new _errors2.default.UserError('Invalid placement: Position out of board.');
      }
      if (this.getBoardMap()[x][y] !== this.nextField) {
        throw new _errors2.default.UserError('Invalid placement: The position (' + x + ', ' + y + ') is not your stone. ' + this.getBoardMap()[x][y] + ', ' + this.nextField);
      }

      var field = this.nextField;
      var oppoField = Board.getOppositeField(field);

      if (!this.board.canPlaceAt(field, x, y, option)) {
        throw new _errors2.default.UserError('Invalid placement: Cannot put at stone at position (' + x + ', ' + y + ').');
      }

      this.board.placeAt(field, x, y, option);
      _utils2.default.log('debug', { action: 'place', position: [x, y], option: option, field: field });

      this.roundsCount++;
      var ended = false;
      if (!this.board.hasAvailablePlacement(oppoField)) {
        ended = true;
        if (this.nextField === Board.FIELD_BLACK) {
          this.state = Board.BOARD_STATE_WIN_BLACK;
        } else {
          this.state = Board.BOARD_STATE_WIN_WHITE;
        }

        var info = {
          action: 'roundEnd',
          board: this.getBoardMap(),
          causedBy: 'hasAvailablePlacement'
        };
        _utils2.default.log('debug', info);
      } else if (this.roundsCount > this.roundLimit) {
        ended = true;
        var analytics = this.board.count();
        if (analytics[Board.FIELD_BLACK] > analytics[Board.FIELD_WHITE]) {
          this.state = Board.BOARD_STATE_WIN_BLACK;
        } else if (analytics[Board.FIELD_BLACK] < analytics[Board.FIELD_WHITE]) {
          this.state = Board.BOARD_STATE_WIN_WHITE;
        } else {
          this.state = Board.BOARD_STATE_DRAW;
        }

        var _info = {
          action: 'roundEnd',
          causedBy: 'roundLimit',
          'roundsCount': this.roundsCount,
          'roundLimit': this.roundLimit,
          analytics: analytics,
          board: this.getBoardMap()
        };
        _utils2.default.log('debug', _info);
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

      return { x: x, y: y, option: option, ended: ended };
    }
  }]);
  return Board;
}();

exports.default = Board;


Board.FIELD_BLANK = _libreversi2.default.STATE_EMPTY;
Board.FIELD_BLACK = _libreversi2.default.STATE_BLACK;
Board.FIELD_WHITE = _libreversi2.default.STATE_WHITE;

Board.BOARD_STATE_GOING = 0;
Board.BOARD_STATE_WIN_BLACK = 1;
Board.BOARD_STATE_WIN_WHITE = 2;
Board.BOARD_STATE_DRAW = 3;
//# sourceMappingURL=board.js.map
