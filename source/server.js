import PubSub from 'pubsub-js';

const CH = 'multiple-cursors';

module.exports = function subscribe(websocket,db) {

    const sub = PubSub.subscribe(CH,(ch,msg)=>{
      console.log("local",msg);
      websocket.send(msg);
    })

    // listen to socket messages from client
    websocket.on('message', (msg) => {

      let message = null;
      try {
        message = JSON.parse(msg);
      } catch (e) {
        // console.warn(`unable to parse message: ${message}`);
        return;
      }

      let pubMessage = null;
      const userName = message.userName;
      const cursor = message.cursor;
      switch (message.id) {
        case 'initUser': {
          db[userName] = msg.cursor;
          pubMessage = { id: 'newUser', userName };
          pubMessage = JSON.stringify(pubMessage);
          //console.log("remote",pubMessage);
          PubSub.publish(CH, JSON.stringify(pubMessage));
          break;
        }
        case 'cursorChange': {
          db[userName] = cursor;
          pubMessage = { id: 'cursorChange', userName, cursor };
          pubMessage = JSON.stringify(pubMessage);
          //console.log("remote",pubMessage);
          PubSub.publish(CH, JSON.stringify(pubMessage));
          break;
        }
        case 'removeUser': {
          delete db[userName];
          pubMessage = { id: 'removeUser', userName };
          pubMessage = JSON.stringify(pubMessage);
          //console.log("remote",pubMessage);
          PubSub.publish(CH, JSON.stringify(pubMessage));
          break;
        }
        default:
          // console.warn(`unhandled message: ${message}`);
      }
    });

    websocket.on('close', () => {
      PubSub.unsubscribe(sub)
    });

};
