import {AceMultiCursorManager, AceMultiSelectionManager} from '@convergencelabs/ace-collab-ext'
import {Range} from 'ace-builds'
const stringToColor = require('string-to-color')

const MAX_USERS = 50;

export class SharedbAceMultipleCursorsClient {

  multiCursor: AceMultiCursorManager
  multiSelection: AceMultiSelectionManager


  constructor(socket:WebSocket, ace:any, userName:string){
    //console.log("starting mulitple cursors");
    const username = userName || `user${Math.floor(Math.random() * MAX_USERS)}`;
    this.multiCursor = new AceMultiCursorManager(ace.session)
    this.multiSelection = new AceMultiSelectionManager(ace.session)
    // Initialize User
    socket.onopen = () => {
      const message = {
        id: 'newUser',
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

    ace.selection.on('changeSelection', () => {
      const message = {
        id: 'selectionChange',
        userName: username,
        selection: ace.getSelectionRange(),
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
      if (message.userName === username) return
      console.log("received changing cursors", message)

      const {userName, selection, cursor} = message;

      switch (message.id) {
        case 'newUser':
          this.addUser(userName,cursor,selection)
          break;
        case 'cursorChange':
          this.update(userName, {cursor});
          break;
        case 'selectionChange':
          const sel = this.getRange(selection);
          console.log("sel",sel);
          this.update(userName, {selection});
          break;
        case 'removeUser':
          this.multiCursor.removeCursor(userName);
          // this.multiSelection.removeSelection(userName);
          break;
      }
    };
  }

  addUser(userName, cursor:any, selection:any){
    try{
      const color = this.getColor(userName);
      if(cursor) this.multiCursor.addCursor(userName, userName, color, cursor);
      if(selection) this.multiSelection.addSelection(userName, userName, color, [this.getRange(selection)]);
    }catch(e){console.warn(e)}
  }

  update(userName:string, {cursor=null,selection=null}){
    try{
      if(cursor) this.multiCursor.setCursor(userName, cursor);
      if(selection) this.multiSelection.setSelection(userName, [this.getRange(selection)]);
    }catch(e){
      this.addUser(userName, cursor, selection);
      if(cursor) this.multiCursor.setCursor(userName, cursor);
      if(selection) this.multiSelection.setSelection(userName, [this.getRange(selection)]);
    }
  }

  getColor(userName:string):string{
    return stringToColor(userName)//colors[Math.floor(Math.random() * colors.length)]
  }

  getRange(selection:any){
    return new Range(selection.start.row,selection.start.column,selection.end.row,selection.end.column)
  }
}
