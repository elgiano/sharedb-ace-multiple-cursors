'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _marker = require('../marker');

var _marker2 = _interopRequireDefault(_marker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var colors = ['BurlyWood', 'PowderBlue', 'Violet', 'GreenYellow', 'Red', 'LimeGreen', 'DarkViolet', 'GhostWhite', 'OrangeRed', 'HotPink'];
var MAX_COLORS = 10;

function SharedbMultipleCursors(socket, ace) {
  console.log("starting mulitple cursors");
  var MAX_USERS = 50;

  var username = 'user' + Math.floor(Math.random() * MAX_USERS);
  _marker2.default.init(ace);

  // Initialize User
  socket.onopen = function () {
    var message = {
      id: 'initUser',
      userName: username,
      cursor: ace.getCursorPosition()
    };
    socket.send(JSON.stringify(message));
  };

  // listen for local cursor changes
  ace.selection.on('changeCursor', function () {
    var message = {
      id: 'cursorChange',
      userName: username,
      cursor: ace.getCursorPosition()
    };
    socket.send(JSON.stringify(message));
  });

  socket.onmessage = function (msg) {

    var message = null;
    try {
      message = JSON.parse(msg.data);
    } catch (e) {
      return;
    }
    console.log("received changing cursors", message);

    switch (message.id) {
      case 'cursorChange':
        if (message.userName === username) break;

        if (!(message.userName in _marker2.default.cursors)) {
          _marker2.default.cursors[message.userName] = {
            cursor: message.cursor,
            color: colors[Math.floor(Math.random() * MAX_COLORS)]
          };
        } else {
          _marker2.default.cursors[message.userName].cursor = message.cursor;
        }
        _marker2.default.redraw();
        break;
      case 'removeUser':
        if (message.userName in _marker2.default.cursors) {
          delete _marker2.default.cursors[message.userName];
        }
        break;
      default:
    }
  };
}
exports.default = SharedbMultipleCursors;