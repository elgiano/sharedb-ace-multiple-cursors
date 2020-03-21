import PubSub from 'pubsub-js';

const CH = 'multiple-cursors';

const messageTypes = [
  'newUser',
  'cursorChange',
  'selectionChange',
  'removeUser'
]

function registerChange(id:string, userName:string, db: any, change:any){
  db[userName] = Object.assign({},db[userName],change)
  const pubMessage = JSON.stringify({ userName, id , ...db[userName] });
  //console.log("remote",pubMessage);
  PubSub.publish(CH, pubMessage);
}

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

      userName = message.userName;
      const {cursor,selection,id} = message;
      if(messageTypes.includes(id)){
        if(id == 'removeUser'){
          removeUser(userName,db)
        }else{
          registerChange(id, userName,db, {cursor,selection});
        }
      }else{
          // console.warn(`unhandled message: ${message}`);
      }
    };

    websocket.onclose = () => {
      PubSub.unsubscribe(sub)
      if(userName) removeUser(userName, db)
    };

};
