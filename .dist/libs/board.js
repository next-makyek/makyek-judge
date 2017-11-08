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

  function Board(size) {
    (0, _classCallCheck3.default)(this, Board);

    (0, _assert2.default)(size > 0);
    _utils2.default.log('debug', { action: 'createBoard', size: size });
    this.size = size;
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
    key: 'getOrderMap',
    value: function getOrderMap() {
      return this.board.order;
    }
  }, {
    key: 'place',
    value: function place(row, col) {
      (0, _assert2.default)(this.state === Board.BOARD_STATE_GOING);
      if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
        throw new _errors2.default.UserError('Invalid placement: Position out of board.');
      }
      if (this.getBoardMap()[row][col] !== Board.FIELD_BLANK) {
        throw new _errors2.default.UserError('Invalid placement: There is already a stone at position (' + row + ', ' + col + ').');
      }

      var field = this.nextField;
      var oppoField = Board.getOppositeField(field);

      if (!this.board.canPlaceAt(field, row, col)) {
        throw new _errors2.default.UserError('Invalid placement: Cannot put at stone at position (' + row + ', ' + col + ').');
      }

      this.board.placeAt(field, row, col);
      _utils2.default.log('debug', { action: 'place', position: [row, col], field: field });

      var switchField = void 0;
      var ended = void 0;
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
        var analytics = this.board.count();
        if (analytics[Board.FIELD_BLACK] > analytics[Board.FIELD_WHITE]) {
          this.state = Board.BOARD_STATE_WIN_BLACK;
        } else if (analytics[Board.FIELD_BLACK] < analytics[Board.FIELD_WHITE]) {
          this.state = Board.BOARD_STATE_WIN_WHITE;
        } else {
          this.state = Board.BOARD_STATE_DRAW;
        }
        var info = { action: 'roundEnd', board: this.getBoardMap(), analytics: analytics };
        _utils2.default.log('debug', info);
      }

      return { row: row, col: col, ended: ended };
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
