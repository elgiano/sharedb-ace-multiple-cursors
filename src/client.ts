import {Marker} from './marker';

const colors = ['BurlyWood', 'PowderBlue', 'Violet', 'GreenYellow',
  'Red', 'LimeGreen', 'DarkViolet', 'GhostWhite', 'OrangeRed', 'HotPink'];
const MAX_COLORS = 10;
const MAX_USERS = 50;


export class SharedbAceMultipleCursorsClient {

  marker: Marker;

  constructor(socket:WebSocket, ace:any){
    //console.log("starting mulitple cursors");
    const username = `user${Math.floor(Math.random() * MAX_USERS)}`;
    this.marker = new Marker(ace);

    // Initialize User
    socket.onopen = () => {
      const message = {
        id: 'initUser',
        userName: username,
        cursor: ace.getCursorPosition(),
      };
      socket.send(JSON.stringify(message));
    };

    // listen for local cursor changes
    ace.selection.on('changeCursor', () => {
      const message = {
        id: 'cursorChange',
        userName: username,
        cursor: ace.getCursorPosition(),
      };
      socket.send(JSON.stringify(message));
    });

    socket.onmessage = (msg) => {

      let message = null;
      try {
        message = JSON.parse(msg.data);
      } catch (e) {
        return;
      }
      //console.log("received changing cursors", message)

      switch (message.id) {
        case 'cursorChange':
          if (message.userName === username) break;

          if (!(message.userName in this.marker.cursors)) {
            this.marker.cursors[message.userName] = {
              cursor: message.cursor,
              color: colors[Math.floor(Math.random() * MAX_COLORS)],
            };
          } else {
            this.marker.cursors[message.userName].cursor = message.cursor;
          }
          this.marker.redraw();
          break;
        case 'removeUser':
          if (message.userName in this.marker.cursors) {
            delete this.marker.cursors[message.userName];
            this.marker.redraw()
          }
        break;
      default:
      }
    };
  }


}
