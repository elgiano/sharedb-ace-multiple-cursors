// import redis from 'redis';
const redis = require('redis');

const DB_NAME = 'userCursors';

function setDBFactory(redisUrl) {
  return (userName, cursor) => {
    const rc = redis.createClient(redisUrl);
    rc.hset([DB_NAME, userName, JSON.stringify(cursor)], (err) => {
      if (err) throw err;
      rc.quit();
    });
  };
}

function removeFromDBFactory(redisUrl) {
  return (userName) => {
    const rc = redis.createClient(redisUrl);
    rc.del([DB_NAME, userName], (err) => {
      if (err) throw err;
      rc.quit();
    });
  };
}

module.exports = function subscribe(redisUrl) {
  return (ctx) => {
    const setDB = setDBFactory(redisUrl);
    const removeFromDB = removeFromDBFactory(redisUrl);

    const pub = redis.createClient(redisUrl);
    const sub = redis.createClient(redisUrl);

    sub.on('message', (channel, message) => {
      if (channel === 'multiple-cursors') {
        ctx.websocket.send(message);
      }
    });

    sub.subscribe('multiple-cursors');

    // listen to socket messages from client
    ctx.websocket.on('message', (msg) => {
      let message = null;
      try {
        message = JSON.parse(msg);
      } catch (e) {
        // console.warn(`unable to parse message: ${message}`);
        return;
      }

      // console.log(message);
      let pubMessage = null;
      const userName = message.userName;
      const cursor = message.cursor;
      switch (message.id) {
        case 'initUser': {
          setDB(userName, cursor);
          pubMessage = { id: 'newUser', userName };
          pub.publish('multiple-cursors', JSON.stringify(pubMessage));
          break;
        }
        case 'cursorChange': {
          setDB(userName, cursor);

          pubMessage = { id: 'cursorChange', userName, cursor };
          pub.publish('multiple-cursors', JSON.stringify(pubMessage));
          break;
        }
        case 'removeUser': {
          removeFromDB(userName);

          pubMessage = { id: 'removeUser', userName };
          pub.publish('multiple-cursors', JSON.stringify(pubMessage));
          break;
        }
        default:
          // console.warn(`unhandled message: ${message}`);
      }
    });

    ctx.websocket.on('close', () => {
      sub.unsubscribe();
      sub.quit();
      pub.quit();
    });
  };
};
