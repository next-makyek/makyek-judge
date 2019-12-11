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
      this.board = new _libreversi2.default.Board();
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
    key: 'deepcopyArr',
    value: function deepcopyArr(arr) {
      var outarr = [],
          len = arr.length;
      for (var i = 0; i < len; i++) {
        outarr[i] = new Array();
        for (var j = 0; j < arr[i].length; j++) {
          outarr[i][j] = arr[i][j];
        }
      }
      return outarr;
    }
  }, {
    key: 'getMaxJumpTimes',
    value: function getMaxJumpTimes(field) {
      var currentBoard = this.getBoardMap();
      var maxDepth = 0;
      for (var i = 0; i < 8; ++i) {
        for (var j = 0; j < 8; ++j) {
          if (currentBoard[i][j] === field || currentBoard[i][j] === field + 3) {
            var tempBoard = this.deepcopyArr(currentBoard);
            //console.log('dfs for', i, j)
            var tempDepth = this.searchJumpTimes(i, j, 0, tempBoard, field);
            //console.log('dfs searchjump out')
            //console.log('tempdepth and maxdepth',tempDepth,maxDepth)
            if (tempDepth > maxDepth) {
              //console.log('compare jump out')
              maxDepth = tempDepth;
            }
          }
          //console.log('i,j', i,j)
        }
      }
      //console.log('return maxdepth', maxDepth)
      return maxDepth;
    }
  }, {
    key: 'searchJumpTimes',
    value: function searchJumpTimes(x, y, depth, tempBoard, field) {
      //console.log('x, y, depth', x, y, depth)
      var oppoF = Board.getOppositeField(field);

      var direction = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      var curMaxDepth = depth;
      for (var k = 0; k < 4; ++k) {
        var newNeiborX = x + direction[k][0];
        var newNeiborY = y + direction[k][1];
        var newTargetX = newNeiborX + direction[k][0];
        var newTargetY = newNeiborY + direction[k][1];
        //console.log('tempboard', tempBoard)
        //console.log('newNeiborx,y', newNeiborX,newNeiborY)
        if (this.board.inBound(newTargetX, newTargetY) && (tempBoard[newNeiborX][newNeiborY] === oppoF || tempBoard[newNeiborX][newNeiborY] === oppoF + 3) && tempBoard[newTargetX][newTargetY] === 0) {
          //console.log('tempboard', tempBoard)
          //console.log('dfs x y newNeiborx,y targetx y',x, y, newNeiborX,newNeiborY, newTargetX, newTargetY)
          tempBoard[newTargetX][newTargetY] = field;
          tempBoard[x][y] = 0;
          tempBoard[newNeiborX][newNeiborY] = 0;
          var temp = this.searchJumpTimes(newTargetX, newTargetY, depth + 1, tempBoard, field);
          if (temp > curMaxDepth) {
            curMaxDepth = temp;
          }
          tempBoard[x][y] = field;
          tempBoard[newTargetX][newTargetY] = 0;
          tempBoard[newNeiborX][newNeiborY] = oppoF;
        }
      }
      depth = curMaxDepth;

      return depth;
    }
  }, {
    key: 'place',
    value: function place(order) {

      var stepNum = order[0] - 1;
      //console.log('order[0]', order[0])
      //console.log('order[1]', order[1])
      //console.log('order[2]', order[2])

      //this.steps.push([this.nextField, x, y, option]);
      var field = this.nextField;

      var oppoField = Board.getOppositeField(field);
      var maxJumpTimes = this.getMaxJumpTimes(field);

      //console.log('maxJumpTimes', maxJumpTimes)
      //console.log('stepNum', stepNum)
      var loseFlag = 0;
      var ended = false;
      if (stepNum !== order.length - 2 || stepNum === 0) {
        console.log('out point 1');
        loseFlag = 1;
        ended = true;
        if (this.nextField === Board.FIELD_BLACK) {
          this.state = Board.BOARD_STATE_WIN_WHITE;
        } else {
          this.state = Board.BOARD_STATE_WIN_BLACK;
        }
        return { ended: ended };
      }
      if (0 < maxJumpTimes && maxJumpTimes != stepNum || maxJumpTimes === 0 && stepNum != 1) {
        loseFlag = 1;
        console.log('out point 3');
      } else if (maxJumpTimes === 0 && stepNum === 1) {
        var curX = order[1][0] - '0';
        var curY = order[1][2] - '0';
        var nextX = order[2][0] - '0';
        var nextY = order[2][2] - '0';
        console.log('out point 4');
        if (!(this.board.inBound(nextX, nextY) && Math.abs(curX - nextX) == 1 && Math.abs(curY - nextY) == 1 && this.board.canPlaceAt(field, curX, curY, nextX, nextY))) {
          loseFlag = 1;
          console.log('out point 5');
        }
      } else {
        var tempBd = this.deepcopyArr(this.getBoardMap());

        //console.log('after dfs', tempBd)
        for (var i = 1; i <= stepNum; ++i) {
          //console.log('out point 6')
          (0, _assert2.default)(this.state === Board.BOARD_STATE_GOING);
          var curX = order[i][0] - '0';
          var curY = order[i][2] - '0';
          var nextX = order[i + 1][0] - '0';
          var nextY = order[i + 1][2] - '0';
          var neiborX = (curX + nextX) / 2;
          var neiborY = (curY + nextY) / 2;
          if (!(this.board.inBound(curX, curY) && this.board.inBound(nextX, nextY))) {
            loseFlag = 1;
            this.board.board = tempBd;
            throw new _errors2.default.UserError('Invalid placement: The position () out of board.');
          }
          if (!(Math.abs(curX - nextX) == 2 && Math.abs(curY - nextY) == 2)) {
            loseFlag = 1;
            this.board.board = tempBd;
            throw new _errors2.default.UserError('Invalid placement: This is not a jump.');
          }
          //if (!(this.getBoardMap()[neiborX][neiborY] === oppoField && this.getBoardMap()[nextX][nextY] === 0)) {
          //  loseFlag = 1
          //  this.board.board = tempBd
          //  throw new errors.UserError(`Invalid placement: Invalid jump.`);
          //}
          if (!this.board.canPlaceAt(field, curX, curY, nextX, nextY)) {
            loseFlag = 1;
            this.board.board = tempBd;
            throw new _errors2.default.UserError('Invalid placement: Cannot move.');
          }
          this.board.placeAt(field, curX, curY, nextX, nextY, false);
          //if (this.getBoardMap()[curX][curY] !== this.nextField) {
          //loseFlag = 1
          //throw new errors.UserError(`Invalid placement: The position (${curX}, ${curY}) is not your stone.`);
          //}
          //if (!this.board.canPlaceAt(field, curX, curY, nextX, nextY)) {
          //loseFlag = 1
          //throw new errors.UserError(`Invalid placement: Cannot move stone at position (${nextX}, ${nextY}).`);
          //}
          // this.board.placeAt(field, curX, curY, nextX, nextY);
          //utils.log('debug', {action: 'place', position: [x, y], option, field});    
        }
        //console.log('tempBd', tempBd)
        this.board.board = tempBd;
        //console.log('board', this.getBoardMap(), this.board.board)
      }
      this.roundsCount++;
      console.log('out point 7');
      if (loseFlag === 0) {
        console.log('out point 8');
        //console.log('board before')
        //console.log(this.getBoardMap())
        for (var _i = 1; _i < stepNum; ++_i) {
          //console.log('out point 9')
          var curX = order[_i][0] - '0';
          var curY = order[_i][2] - '0';
          var nextX = order[_i + 1][0] - '0';
          var nextY = order[_i + 1][2] - '0';
          this.board.placeAt(field, curX, curY, nextX, nextY, false);
          this.steps.push([this.nextField, curX, curY, nextX, nextY, 0]);
          //console.log('board here')
          //console.log(this.getBoardMap())
        }
        var curX = order[stepNum][0] - '0';
        var curY = order[stepNum][2] - '0';
        var nextX = order[stepNum + 1][0] - '0';
        var nextY = order[stepNum + 1][2] - '0';
        this.board.placeAt(field, curX, curY, nextX, nextY, true);
        this.steps.push([this.nextField, curX, curY, nextX, nextY, 0]);

        _utils2.default.log('debug', { action: 'place', field: field, position: order.join(' ') });
        // if (!this.board.hasAvailablePlacement(oppoField)) {
        //   console.log('out point 10')
        //   ended = true;
        //   if (this.nextField === Board.FIELD_BLACK) {
        //     this.state = Board.BOARD_STATE_WIN_BLACK;
        //   } else {
        //     this.state = Board.BOARD_STATE_WIN_WHITE;
        //   }

        //   const info = {
        //     action: 'roundEnd',

        //     board: this.getBoardMap(),
        //     causedBy: 'hasAvailablePlacement'
        //   };
        //   utils.log('debug', info);
        // } else 
        if (this.roundsCount >= this.roundLimit) {
          console.log('out point 11');
          ended = true;
          var analytics = this.board.count();
          if (analytics[Board.FIELD_BLACK] > analytics[Board.FIELD_WHITE]) {
            this.state = Board.BOARD_STATE_WIN_BLACK;
          } else if (analytics[Board.FIELD_BLACK] < analytics[Board.FIELD_WHITE]) {
            this.state = Board.BOARD_STATE_WIN_WHITE;
          } else {
            this.state = Board.BOARD_STATE_DRAW;
          }

          var info = {
            action: 'roundEnd',
            causedBy: 'roundLimit',
            'roundsCount': this.roundsCount,
            'roundLimit': this.roundLimit,
            analytics: analytics,
            board: this.getBoardMap()
          };
          _utils2.default.log('debug', info);
        }
      } else {
        console.log('out point 12');
        ended = true;
        if (this.nextField === Board.FIELD_BLACK) {
          this.state = Board.BOARD_STATE_WIN_WHITE;
        } else {
          this.state = Board.BOARD_STATE_WIN_BLACK;
        }
      }

      this.nextField = oppoField;

      return { ended: ended };
    }
  }, {
    key: 'place1',
    value: function place1(order) {
      this.steps.push([this.nextField, x, y, option]);
      (0, _assert2.default)(this.state === Board.BOARD_STATE_GOING);
      if (!this.board.inBound(x, y)) {
        throw new _errors2.default.UserError('Invalid placement: The position (' + x + ', ' + y + ') out of board.');
      }
      if (this.getBoardMap()[x][y] !== this.nextField) {
        throw new _errors2.default.UserError('Invalid placement: The position (' + x + ', ' + y + ') is not your stone.');
      }

      if (option !== _libreversi2.default.OPTION_UP && option !== _libreversi2.default.OPTION_DOWN && option !== _libreversi2.default.OPTION_LEFT && option !== _libreversi2.default.OPTION_RIGHT && option !== _libreversi2.default.OPTION_UP_LEFT && option !== _libreversi2.default.OPTION_UP_RIGHT && option !== _libreversi2.default.OPTION_DOWN_LEFT && option !== _libreversi2.default.OPTION_DOWN_RIGHT) {
        throw new _errors2.default.UserError('Invalid option: The option ' + option + ' is not a valid option.');
      }

      var field = this.nextField;
      var oppoField = Board.getOppositeField(field);

      if (!this.board.canPlaceAt(field, x, y, option)) {
        throw new _errors2.default.UserError('Invalid placement: Cannot move stone at position (' + x + ', ' + y + ') with option ' + option + '.');
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
      } else if (this.roundsCount >= this.roundLimit) {
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
