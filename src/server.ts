import PubSub from 'pubsub-js';

const CH = 'multiple-cursors';

function removeUser(userName:string, db:any){
  delete db[userName];
  let pubMessage = { id: 'removeUser', userName };
  let message = JSON.stringify(pubMessage);
  //console.log("remote",pubMessage);
  PubSub.publish(CH, message);
}

export function subscribe(websocket:WebSocket,db:any) {

    const sub = PubSub.subscribe(CH,(_:string,msg:string)=>{
      //console.log("local",msg);
      websocket.send(msg);
    })

    let userName:string;

    // listen to socket messages from client
    websocket.onmessage = (msg) => {

      let message = null;
      try {
        message = JSON.parse(msg.data);
      } catch (e) {
        // console.warn(`unable to parse message: ${message}`);
        return;
      }

      let pubMessage = null;
      userName = message.userName;
      const cursor = message.cursor;
      switch (message.id) {
        case 'initUser': {
          db[userName] = message.cursor;
          pubMessage = { id: 'newUser', userName };
          pubMessage = JSON.stringify(pubMessage);
          //console.log("remote",pubMessage);
          PubSub.publish(CH, pubMessage);
          break;
        }
        case 'cursorChange': {
          db[userName] = cursor;
          pubMessage = { id: 'cursorChange', userName, cursor };
          pubMessage = JSON.stringify(pubMessage);
          //console.log("remote",pubMessage);
          PubSub.publish(CH, pubMessage);
          break;
        }
        case 'removeUser': {
          removeUser(userName,db);
          break;
        }
        default:
          // console.warn(`unhandled message: ${message}`);
      }
    };

    websocket.onclose = () => {
      PubSub.unsubscribe(sub)
      if(userName) removeUser(userName, db)
    };

};
