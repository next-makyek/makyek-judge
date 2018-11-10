'use strict';

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var main = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
    var _this = this;

    var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, id, lastPlacement, code;

    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (!_yargs.argv.config) {
              _context4.next = 16;
              break;
            }

            _context4.prev = 1;
            _context4.t0 = JSON;
            _context4.next = 5;
            return _fsPromise2.default.readFile(_yargs.argv.config);

          case 5:
            _context4.t1 = _context4.sent.toString();
            argvConfig = _context4.t0.parse.call(_context4.t0, _context4.t1);
            _context4.next = 14;
            break;

          case 9:
            _context4.prev = 9;
            _context4.t2 = _context4['catch'](1);

            _utils2.default.log('error', { message: 'Failed to parse config from "argv.config": ' + _context4.t2.message });
            shutdown(_exitCode2.default.EXIT_ERROR, MSG_CAUSED_BY_SYS);
            return _context4.abrupt('return');

          case 14:
            _context4.next = 17;
            break;

          case 16:
            argvConfig = _yargs.argv;

          case 17:

            // set brainsConfig
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context4.prev = 20;
            for (_iterator = (0, _getIterator3.default)(BRAIN_IDS); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              id = _step.value;

              brainsConfig[id] = {};
            }
            _context4.next = 28;
            break;

          case 24:
            _context4.prev = 24;
            _context4.t3 = _context4['catch'](20);
            _didIteratorError = true;
            _iteratorError = _context4.t3;

          case 28:
            _context4.prev = 28;
            _context4.prev = 29;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 31:
            _context4.prev = 31;

            if (!_didIteratorError) {
              _context4.next = 34;
              break;
            }

            throw _iteratorError;

          case 34:
            return _context4.finish(31);

          case 35:
            return _context4.finish(28);

          case 36:
            brainsConfig[0].field = argvConfig['brain0.field'];

            if (!(brainsConfig[0].field !== 'black' && brainsConfig[0].field !== 'white')) {
              _context4.next = 41;
              break;
            }

            _utils2.default.log('error', { message: 'Invalid argument "brain0.field", expecting "black" or "white", but received ' + brainsConfig[0].field });
            shutdown(_exitCode2.default.EXIT_ERROR, MSG_CAUSED_BY_SYS);
            return _context4.abrupt('return');

          case 41:
            // Translate text to constant
            brainsConfig[0].field = _board2.default.translateField(brainsConfig[0].field);
            brainsConfig[1].field = _board2.default.getOppositeField(brainsConfig[0].field);

            _lodash2.default.forEach(brainsConfig, function (config, id) {
              config.bin = argvConfig['brain' + id + '.bin'];
              if (config.bin === undefined) {
                _utils2.default.log('error', { message: 'Missing argument "brain' + id + '.bin"' });
                shutdown(_exitCode2.default.EXIT_ERROR, MSG_CAUSED_BY_SYS);
                return;
              }
              try {
                _fsPromise2.default.accessSync(config.bin, _fsPromise2.default.constants.X_OK);
              } catch (err) {
                _utils2.default.log('error', { message: 'Unable to access "' + config.bin + '"' });
                shutdown(_exitCode2.default.EXIT_ERROR, MSG_CAUSED_BY_SYS);
                return;
              }
              config.core = parseInt(argvConfig['brain' + id + '.core'], 10);
              if (isNaN(config.core)) {
                config.core = false;
              }
              config.moveTimeout = parseInt(argvConfig['brain' + id + '.moveTimeout'], 10);
              if (isNaN(config.moveTimeout)) {
                config.moveTimeout = DEFAULT_MOVE_TIMEOUT;
              }
              config.roundTimeout = parseInt(argvConfig['brain' + id + '.roundTimeout'], 10);
              if (isNaN(config.roundTimeout)) {
                config.roundTimeout = DEFAULT_ROUND_TIMEOUT;
              }
              config.memoryLimit = parseInt(argvConfig['brain' + id + '.memoryLimit'], 10);
              if (isNaN(config.memoryLimit)) {
                config.memoryLimit = DEFAULT_MEMORY_LIMIT;
              }
            });

            // set roundConfig
            roundConfig.size = parseInt(argvConfig['round.size'], 10);
            if (isNaN(roundConfig.size)) {
              roundConfig.size = DEFAULT_BOARD_SIZE;
            }
            roundConfig.limit = parseInt(argvConfig['round.limit'], 10);
            if (isNaN(roundConfig.limit)) {
              roundConfig.limit = DEFAULT_ROUND_LIMIT;
            }

            _utils2.default.log('debug', { action: 'initialize', roundConfig: roundConfig, brainsConfig: brainsConfig });

            board = new _board2.default(roundConfig.size, roundConfig.limit);

            // Spawn brain processes
            _lodash2.default.forEach(brainsConfig, function (config, id) {
              var brain = new _brain2.default(id, {
                bin: config.bin,
                sandbox: argvConfig.sandbox,
                affinity: config.core,
                maxMemory: config.memoryLimit,
                maxTime: config.roundTimeout
              });
              brain.on('error', function (err) {
                return handleBrainError(id, err);
              });
              brain.on('exit', function (code) {
                return handleBrainExit(id, code);
              });
              brain.config = config;
              brains[id] = brain;
            });

            if (!hasShutdown) {
              _context4.next = 53;
              break;
            }

            return _context4.abrupt('return');

          case 53:
            _context4.prev = 53;
            _context4.next = 56;
            return _promise2.default.all(_lodash2.default.map(brains, function (brain) {
              return brain.emitErrorOnException((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                var resp;
                return _regenerator2.default.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.next = 2;
                        return brain.waitForOneResponse(DEFAULT_START_TIMEOUT, function () {
                          brain.writeInstruction('START ' + brain.config.field);
                        });

                      case 2:
                        resp = _context.sent;

                        if (!(resp !== 'OK')) {
                          _context.next = 5;
                          break;
                        }

                        throw new _errors2.default.UserError('Expect "OK", but received "' + resp + '"');

                      case 5:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, _callee, _this);
              })));
            }));

          case 56:
            _context4.next = 63;
            break;

          case 58:
            _context4.prev = 58;
            _context4.t4 = _context4['catch'](53);

            if (!(_context4.t4 instanceof _errors2.default.UserError)) {
              _context4.next = 62;
              break;
            }

            return _context4.abrupt('return');

          case 62:
            throw _context4.t4;

          case 63:

            // Send BEGIN or TURN
            lastPlacement = null;

          case 64:
            if (!(!hasShutdown && (lastPlacement === null || lastPlacement.ended === false))) {
              _context4.next = 76;
              break;
            }

            _context4.prev = 65;
            return _context4.delegateYield( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
              var currentBrainId, brain, anotherBrain;
              return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                  switch (_context3.prev = _context3.next) {
                    case 0:
                      currentBrainId = getCurrentBrain();
                      brain = brains[currentBrainId];
                      anotherBrain = brains[1 - currentBrainId];
                      _context3.next = 5;
                      return brain.emitErrorOnException((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                        var resp, m, placement;
                        return _regenerator2.default.wrap(function _callee2$(_context2) {
                          while (1) {
                            switch (_context2.prev = _context2.next) {
                              case 0:
                                _context2.next = 2;
                                return brain.waitForOneResponse(brain.config.moveTimeout, function () {
                                  brain.writeInstruction('TURN');
                                });

                              case 2:
                                resp = _context2.sent;
                                m = resp.match(/^(-?\d+) (-?\d+) (-?\d+)$/);

                                if (m) {
                                  _context2.next = 6;
                                  break;
                                }

                                throw new _errors2.default.UserError('Invalid response. Expect a placement format as "[X] [Y] [Z]".');

                              case 6:
                                placement = board.place(parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10));

                                lastPlacement = placement;
                                anotherBrain.writeInstruction('PLACE ' + placement.x + ' ' + placement.y + ' ' + placement.option);

                              case 9:
                              case 'end':
                                return _context2.stop();
                            }
                          }
                        }, _callee2, _this);
                      })));

                    case 5:
                    case 'end':
                      return _context3.stop();
                  }
                }
              }, _callee3, _this);
            })(), 't5', 67);

          case 67:
            _context4.next = 74;
            break;

          case 69:
            _context4.prev = 69;
            _context4.t6 = _context4['catch'](65);

            if (!(_context4.t6 instanceof _errors2.default.UserError)) {
              _context4.next = 73;
              break;
            }

            return _context4.abrupt('return');

          case 73:
            throw _context4.t6;

          case 74:
            _context4.next = 64;
            break;

          case 76:

            // Round ended
            code = void 0;

            if (!(board.state === _board2.default.BOARD_STATE_DRAW)) {
              _context4.next = 81;
              break;
            }

            code = _exitCode2.default.EXIT_DRAW;
            _context4.next = 90;
            break;

          case 81:
            if (!(board.state === _board2.default.BOARD_STATE_WIN_BLACK)) {
              _context4.next = 85;
              break;
            }

            if (brains[0].config.field === _board2.default.FIELD_BLACK) {
              code = _exitCode2.default.EXIT_B0_WIN;
            } else {
              code = _exitCode2.default.EXIT_B1_WIN;
            }
            _context4.next = 90;
            break;

          case 85:
            if (!(board.state === _board2.default.BOARD_STATE_WIN_WHITE)) {
              _context4.next = 89;
              break;
            }

            if (brains[0].config.field === _board2.default.FIELD_WHITE) {
              code = _exitCode2.default.EXIT_B0_WIN;
            } else {
              code = _exitCode2.default.EXIT_B1_WIN;
            }
            _context4.next = 90;
            break;

          case 89:
            throw new Error('Invalid board state ' + board.state);

          case 90:

            _lodash2.default.forEach(function (brain) {
              return brain.ignoreAllEvents = true;
            });
            shutdown(code, '(normal round exit)');

          case 92:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this, [[1, 9], [20, 24, 28, 36], [29,, 31, 35], [53, 58], [65, 69]]);
  }));

  return function main() {
    return _ref.apply(this, arguments);
  };
}();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _fsPromise = require('fs-promise');

var _fsPromise2 = _interopRequireDefault(_fsPromise);

var _yargs = require('yargs');

var _utils = require('./libs/utils');

var _utils2 = _interopRequireDefault(_utils);

var _brain = require('./libs/brain');

var _brain2 = _interopRequireDefault(_brain);

var _board = require('./libs/board');

var _board2 = _interopRequireDefault(_board);

var _errors = require('./libs/errors');

var _errors2 = _interopRequireDefault(_errors);

var _exitCode = require('./libs/exitCode');

var _exitCode2 = _interopRequireDefault(_exitCode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MSG_CAUSED_BY_SYS = 'Judge system internal error';

var DEFAULT_ROUND_LIMIT = 120;
var DEFAULT_BOARD_SIZE = 16;
var DEFAULT_START_TIMEOUT = 5000;
var DEFAULT_MOVE_TIMEOUT = 5000;
var DEFAULT_ROUND_TIMEOUT = 180000;
var DEFAULT_MEMORY_LIMIT = 350 * 1024 * 1024;

var BRAIN_IDS = ['0', '1'];

var roundConfig = {};
var brains = {};
var brainsConfig = {};

var board = null;
var argvConfig = {};
var hasShutdown = false;

function getCurrentBrain() {
  return brains[0].config.field === board.nextField ? 0 : 1;
}

function shutdown(exitCode, causedBy) {
  _utils2.default.log('debug', { action: 'shutdown', exitCode: exitCode, causedBy: causedBy });
  _lodash2.default.forEach(brains, function (brain) {
    brain.ignoreAllEvents = true;
    brain.kill();
  });

  if (argvConfig && argvConfig.summary) {
    var summaryData = {
      elapsedRoundTime: _lodash2.default.mapValues(brains, 'usedTime'),
      exitCausedBy: causedBy,
      currentBoard: board ? board.getBoardMap() : null,
      // boardSteps: board ? board.getSteps() : null,
      roundConfig: roundConfig
    };
    _utils2.default.log('info', { action: 'summary', data: summaryData });
    _fs2.default.writeFileSync(argvConfig.summary, (0, _stringify2.default)(summaryData));
  }

  hasShutdown = true;
  process.exit(exitCode);
}

function handleBrainError(id, err) {
  _utils2.default.log('info', { type: 'brainError', error: err.message, id: id });
  shutdown(_exitCode2.default.getCodeForBrainLose(id), 'Brain ' + id + ' error: ' + err.message);
}

function handleBrainExit(id) {
  _utils2.default.log('info', { type: 'brainProcessExit', id: id });
  shutdown(_exitCode2.default.getCodeForBrainLose(id), 'Brain ' + id + ' process terminated');
}

main().catch(function (e) {
  _utils2.default.log('error', { message: 'Uncaught system exception: ' + e.stack });
  shutdown(_exitCode2.default.EXIT_ERROR, MSG_CAUSED_BY_SYS);
});
//# sourceMappingURL=judge.js.map
