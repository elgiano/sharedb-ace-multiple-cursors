'use strict';

var _pubsubJs = require('pubsub-js');

var _pubsubJs2 = _interopRequireDefault(_pubsubJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CH = 'multiple-cursors';

module.exports = function subscribe(websocket, db) {

  var sub = _pubsubJs2.default.subscribe(CH, function (ch, msg) {
    console.log("local", msg);
    websocket.send(msg);
  });

  // listen to socket messages from client
  websocket.on('message', function (msg) {

    var message = null;
    try {
      message = JSON.parse(msg);
    } catch (e) {
      // console.warn(`unable to parse message: ${message}`);
      return;
    }

    var pubMessage = null;
    var userName = message.userName;
    var cursor = message.cursor;
    switch (message.id) {
      case 'initUser':
        {
          db[userName] = msg.cursor;
          pubMessage = { id: 'newUser', userName: userName };
          pubMessage = JSON.stringify(pubMessage);
          //console.log("remote",pubMessage);
          _pubsubJs2.default.publish(CH, JSON.stringify(pubMessage));
          break;
        }
      case 'cursorChange':
        {
          db[userName] = cursor;
          pubMessage = { id: 'cursorChange', userName: userName, cursor: cursor };
          pubMessage = JSON.stringify(pubMessage);
          //console.log("remote",pubMessage);
          _pubsubJs2.default.publish(CH, JSON.stringify(pubMessage));
          break;
        }
      case 'removeUser':
        {
          delete db[userName];
          pubMessage = { id: 'removeUser', userName: userName };
          pubMessage = JSON.stringify(pubMessage);
          //console.log("remote",pubMessage);
          _pubsubJs2.default.publish(CH, JSON.stringify(pubMessage));
          break;
        }
      default:
      // console.warn(`unhandled message: ${message}`);
    }
  });

  websocket.on('close', function () {
    _pubsubJs2.default.unsubscribe(sub);
  });
};