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

  deepcopyArr(arr) {
    var outarr = [],len = arr.length;
    for (var i=0; i < len; i++) {
         outarr[i]=new Array();
         for(var j=0;j<arr[i].length;j++){
            outarr[i][j]=arr[i][j];
         }
    }
    return outarr;
  }

  getMaxJumpTimes(field){
    var currentBoard = this.getBoardMap()
    let maxDepth = 0;
    for(let i = 0; i < 8; ++i){
        for (let j = 0; j < 8; ++j){
          if (currentBoard[i][j] === field || currentBoard[i][j] ===  (field + 3) ){
              var tempBoard = this.deepcopyArr(currentBoard) 
              //console.log('dfs for', i, j)
              let tempDepth = this.searchJumpTimes(i, j, 0, tempBoard,field);
              //console.log('dfs searchjump out')
              //console.log('tempdepth and maxdepth',tempDepth,maxDepth)
              if (tempDepth > maxDepth){
                //console.log('compare jump out')
                maxDepth = tempDepth
              }
          }
          //console.log('i,j', i,j)
        }
    }
    //console.log('return maxdepth', maxDepth)
    return maxDepth
  }

  searchJumpTimes(x, y, depth, tempBoard, field){
    //console.log('x, y, depth', x, y, depth)
    const oppoF = Board.getOppositeField(field)
    
    var direction = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    var curMaxDepth = depth
    for (let k = 0; k < 4; ++k){
      let newNeiborX = x + direction[k][0];
      let newNeiborY = y + direction[k][1];
      let newTargetX = newNeiborX + direction[k][0];
      let newTargetY = newNeiborY + direction[k][1];
      //console.log('tempboard', tempBoard)
      //console.log('newNeiborx,y', newNeiborX,newNeiborY)
      if (this.board.inBound(newTargetX,newTargetY)&&(tempBoard[newNeiborX][newNeiborY] === oppoF || tempBoard[newNeiborX][newNeiborY] === oppoF+3) && tempBoard[newTargetX][newTargetY] === 0){
        //console.log('tempboard', tempBoard)
        //console.log('dfs x y newNeiborx,y targetx y',x, y, newNeiborX,newNeiborY, newTargetX, newTargetY)
        tempBoard[newTargetX][newTargetY] = field
        tempBoard[x][y] = 0
        tempBoard[newNeiborX][newNeiborY] = 0
        let temp = this.searchJumpTimes(newTargetX, newTargetY, depth + 1, tempBoard, field)
        if (temp > curMaxDepth){
          curMaxDepth = temp
        }
        tempBoard[x][y] = field
        tempBoard[newTargetX][newTargetY] = 0
        tempBoard[newNeiborX][newNeiborY] = oppoF
      }
    }
    depth = curMaxDepth
    
    return depth
  }

  place(order) {

    var stepNum = order[0] - 1
    //console.log('order[0]', order[0])
    //console.log('order[1]', order[1])
    //console.log('order[2]', order[2])
  
    //this.steps.push([this.nextField, x, y, option]);
    const field = this.nextField;
    
    const oppoField = Board.getOppositeField(field)
    var maxJumpTimes = this.getMaxJumpTimes(field)

    //console.log('maxJumpTimes', maxJumpTimes)
    //console.log('stepNum', stepNum)
    var loseFlag = 0
    let ended = false;
    if (stepNum !== order.length - 2){
      console.log('out point 1')
      loseFlag = 1
      ended = true
      if (this.nextField === Board.FIELD_BLACK) {
        this.state = Board.BOARD_STATE_WIN_WHITE;
      } else {
        this.state = Board.BOARD_STATE_WIN_BLACK;
      }
      return {ended};
    }
    if (0 < maxJumpTimes && maxJumpTimes != stepNum || maxJumpTimes === 0 && stepNum != 1){
      loseFlag = 1
      console.log('out point 3')
    }else if(maxJumpTimes === 0 && stepNum === 1){
      var curX = order[1][0] - '0'
      var curY = order[1][2] - '0'
      var nextX = order[2][0] - '0'
      var nextY = order[2][2] - '0'
      console.log('out point 4')
      if(!(this.board.inBound(nextX, nextY) && Math.abs(curX - nextX) == 1 && Math.abs(curY - nextY) == 1 && this.board.canPlaceAt(field, curX, curY, nextX, nextY) )){
        loseFlag = 1
        console.log('out point 5')
      }
    }else {
      var tempBd = this.deepcopyArr(this.getBoardMap()) 
      
      //console.log('after dfs', tempBd)
      for (let i = 1; i <= stepNum; ++i){
        //console.log('out point 6')
        assert(this.state === Board.BOARD_STATE_GOING);
        var curX = order[i][0] - '0'
        var curY = order[i][2] - '0'
        var nextX = order[i+1][0] - '0'
        var nextY = order[i+1][2] - '0'
        var neiborX = (curX + nextX)/2
        var neiborY = (curY + nextY)/2
        if (!(this.board.inBound(curX, curY) && this.board.inBound(nextX, nextY))) {
          loseFlag = 1
          this.board.board = tempBd
          throw new errors.UserError(`Invalid placement: The position () out of board.`);
        }
        if (!( Math.abs(curX - nextX) == 2 &&  Math.abs(curY - nextY) == 2)) {
          loseFlag = 1
          this.board.board = tempBd
          throw new errors.UserError(`Invalid placement: This is not a jump.`);
        }
        //if (!(this.getBoardMap()[neiborX][neiborY] === oppoField && this.getBoardMap()[nextX][nextY] === 0)) {
        //  loseFlag = 1
        //  this.board.board = tempBd
        //  throw new errors.UserError(`Invalid placement: Invalid jump.`);
        //}
        if (!this.board.canPlaceAt(field, curX, curY, nextX, nextY)) {
          loseFlag = 1
          this.board.board = tempBd
          throw new errors.UserError(`Invalid placement: Cannot move.`);
        }
        this.board.placeAt(field, curX, curY, nextX, nextY, false)
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
      this.board.board = tempBd
      //console.log('board', this.getBoardMap(), this.board.board)
    }
    this.roundsCount++;
    console.log('out point 7')
    if (loseFlag === 0) {
      console.log('out point 8')
      //console.log('board before')
      //console.log(this.getBoardMap())
      for (let i = 1; i < stepNum; ++i){
        //console.log('out point 9')
        var curX = order[i][0] - '0'
        var curY = order[i][2] - '0'
        var nextX = order[i+1][0] - '0'
        var nextY = order[i+1][2] - '0'
        this.board.placeAt(field, curX, curY, nextX, nextY,false)
        this.steps.push([this.nextField, curX, curY, nextX, nextY, 0]);
        //console.log('board here')
        //console.log(this.getBoardMap())
      }
      var curX = order[stepNum][0] - '0'
      var curY = order[stepNum][2] - '0'
      var nextX = order[stepNum+1][0] - '0'
      var nextY = order[stepNum+1][2] - '0'
      this.board.placeAt(field, curX, curY, nextX, nextY,true)
      this.steps.push([this.nextField, curX, curY, nextX, nextY, 0]);

      utils.log('debug', {action: 'place', field: field, position: order.join(' ')});
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
        console.log('out point 11')
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
    } else{
      console.log('out point 12')
      ended = true
      if (this.nextField === Board.FIELD_BLACK) {
        this.state = Board.BOARD_STATE_WIN_WHITE;
      } else {
        this.state = Board.BOARD_STATE_WIN_BLACK;
      }
    }
    
    this.nextField = oppoField;

    return {ended};
  }

  place1(order) {
    this.steps.push([this.nextField, x, y, option]);
    assert(this.state === Board.BOARD_STATE_GOING);
    if (!this.board.inBound(x, y)) {
      throw new errors.UserError(`Invalid placement: The position (${x}, ${y}) out of board.`);
    }
    if (this.getBoardMap()[x][y] !== this.nextField) {
      throw new errors.UserError(`Invalid placement: The position (${x}, ${y}) is not your stone.`);
    }

    if (option !== makyek.OPTION_UP && option !== makyek.OPTION_DOWN
      && option !== makyek.OPTION_LEFT && option !== makyek.OPTION_RIGHT
      && option !== makyek.OPTION_UP_LEFT && option !== makyek.OPTION_UP_RIGHT
      && option !== makyek.OPTION_DOWN_LEFT && option !== makyek.OPTION_DOWN_RIGHT) {
      throw new errors.UserError(`Invalid option: The option ${option} is not a valid option.`);
    }

    const field = this.nextField;
    const oppoField = Board.getOppositeField(field);

    if (!this.board.canPlaceAt(field, x, y, option)) {
      throw new errors.UserError(`Invalid placement: Cannot move stone at position (${x}, ${y}) with option ${option}.`);
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
    } else if (this.roundsCount >= this.roundLimit) {
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
