//import redis from 'redis';
redis = require('redis');
const DB_NAME = 'userCursors';

module.exports = function subscribe(redisUrl) {
  console.log('inside multiple-cursors subscribe');
  return (ctx) => {
    const rc = redis.createClient(redisUrl);

    console.log('inside return body of multiple-cursors subscribe');
    
    const pub = redis.createClient(redisUrl);
    const sub = redis.createClient(redisUrl);


    sub.on('message', (channel, message) => {
      if(channel == 'multiple-cursors') {
        try {
          message = JSON.parse(message);
        } catch(e) {
          return;
        }

        switch (message.id) {
          case 'newUser':
            ctx.websocket.send(JSON.stringify(message));
            break;

          case 'cursorChange':
            ctx.websocket.send(JSON.stringify(message));
            break;

          case 'removeUser'
            ctx.websocket.send(JSON.stringify(message));
          default:
        }
      }
    });

    sub.subscribe('multiple-cursors');

    // listen to socket messages from client
    ctx.websocket.on('message', (message) => {
      try {
        message = JSON.parse(message);
      } catch(e) {
        // meh
      }

      if('id' in message && message.id === 'initUser') {
        userName = message.userName;
        cursor = message.cursor;

        // push data to redis
        rc.hset([DB_NAME, userName, JSON.stringify(cursor)], redis.print);

        pubMessage = {id : 'newUser', userName : userName}
        pub.publish('multiple-cursors', JSON.stringify(pubMessage));
      } else if('id' in message && message.id == 'cursorChange') {
        userName = message.userName;
        cursor = message.cursor;

        console.log(cursor);

        rc.hset([DB_NAME, userName, JSON.stringify(cursor)], redis.print);

        pubMessage = {id: 'cursorChange', userName : userName, cursor : cursor};
        pub.publish('multiple-cursors', JSON.stringify(pubMessage));
      } else if('id' in message && message.id == 'removeUser') {
        userName = message.userName;
        rc.del([DB_NAME, userName], redis.print);

        pubMessage = {id: 'removeUser', userName : userName}
        pub.publish('multiple-cursors', JSON.stringify(pubMessage));
      }
    })
  }


}