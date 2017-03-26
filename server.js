// import redis from 'redis';
const redis = require('redis');
const DB_NAME = 'userCursors';

function setDBFactory(redisUrl) {
  return (userName, cursor) => {
    const rc = redis.createClient(redisUrl); 
    rc.hset([DB_NAME, userName, JSON.stringify(cursor)], (err, reply) => {
      if (err) throw err;
      rc.quit();
    });
  };
}

function removeFromDBFactory(redisUrl) {
  return (userName) => {
    const rc = redis.createClient(redisUrl); 
    rc.del([DB_NAME, userName], (err, reply) => {
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
      if(channel === 'multiple-cursors') {
        ctx.websocket.send(message); 
      }
    });

    sub.subscribe('multiple-cursors');

    // listen to socket messages from client
    ctx.websocket.on('message', (message) => {
      try {
        message = JSON.parse(message);
      } catch(e) {
        console.warn(`unable to parse message: ${message}`);
        return;
      }

      console.log(message);

      switch(message.id) {
      case 'initUser':
        userName = message.userName;
        cursor = message.cursor;

        setDB(userName, cursor);
        pubMessage = {id : 'newUser', userName : userName};
        pub.publish('multiple-cursors', JSON.stringify(pubMessage));
        break;
      case 'cursorChange':
        userName = message.userName;
        cursor = message.cursor;
        setDB(userName, cursor);
        
        pubMessage = {id: 'cursorChange', userName : userName, cursor : cursor};
        pub.publish('multiple-cursors', JSON.stringify(pubMessage));
        break;
      case 'removeUser':
        userName = message.userName;
        removeFromDB(userName);

        pubMessage = {id: 'removeUser', userName : userName};
        pub.publish('multiple-cursors', JSON.stringify(pubMessage));
        break;
      default:
        console.warn(`unhandled message: ${message}`);
      }
    });
    
    ctx.websocket.on('close', (event) => {
      sub.unsubscribe();
      sub.quit();
      pub.quit();
    });
  };
  
};
