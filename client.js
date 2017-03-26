const DB_NAME = 'userCursors';

colors = ['BurlyWood', 'PowderBlue', 'Violet', 'GreenYellow', 
  'Red', 'LimeGreen', 'DarkViolet', 'GhostWhite', 'OrangeRed', 'HotPink'];
MAX_COLORS = 10;

function SharedbMultipleCursors(socket, ace) {
  const MAX_USERS = 50;

  // no error checking for now
  //const _mode = prompt('Insert (unique) username:', 'user' 
  //  + Math.floor(Math.random() * MAX_USERS));
  marker = {};
  marker.cursors = {}; // username -> {color, cursors}

  const username = 'user' + Math.floor(Math.random() * MAX_USERS);
  console.log('local username: ' + username);

  // Initialize User
  socket.addEventListener('open', function() {
    message = {
      id:'initUser',
      userName:username,
      cursor:ace.getCursorPosition(),
    }; 
    socket.send(JSON.stringify(message)); 
  });

  // listen for local cursor changes
  ace.selection.on('changeCursor', function() {
    console.log('cursor change to: ' + JSON.stringify(ace.getCursorPosition()));
    message = {
      id:'cursorChange',
      userName : username,
      cursor : ace.getCursorPosition(),
    };
    
    socket.send(JSON.stringify(message));
    console.log('sent cursor change to server');
  });

  socket.addEventListener('message', (message) => {
    console.log('client received: ' + JSON.stringify(message.data));
    try {
      message = JSON.parse(message.data);
    } catch(e) {}

    console.log(message);
    switch (message.id) {
      case 'cursorChange':
      // if own cursor then ignore
      console.log('updating cursor data');
      if (message.userName === username) break;
      
      if(!(message.userName in marker.cursors)) {
        marker.cursors[message.userName] = {
          cursor : message.cursor,
          color : colors[Math.floor(Math.random() * MAX_COLORS)]
        }
      } else {
        marker.cursors[message.userName].cursor = message.cursor;
      }
      //marker.cursors[message.userName] = {cursor : message.cursor, color : 'Green'};
      console.log(JSON.stringify(marker.cursors));
      console.log('drawing cursors');
      marker.redraw();
      break;
      case 'removeUser':
        if(message.userName in marker.cursors) {
          delete marker.cursors[message.userName];
        }
    }
    });

  marker.update = function(html, markerLayer, session, config) {
    const start = config.firstRow, end = config.lastRow;
    const cursors = this.cursors;
    
    for(const property in cursors) {
      //for (var i = 0; i < cursors.length; i++) {
      var pos = this.cursors[property].cursor;
      if (pos.row < start) {
        continue;
      } else if (pos.row > end) {
        break;
      } else {
        // compute cursor position on screen
        // this code is based on ace/layer/marker.js
        var screenPos = session.documentToScreenPosition(pos);

        var height = config.lineHeight;
        var width = config.characterWidth;
        var top = markerLayer.$getTop(screenPos.row, config);
        var left = markerLayer.$padding + screenPos.column * width;
        // can add any html here 
        html.push(
          "<div style='",
          "position: absolute;",
          "border-left: 2px solid " + this.cursors[property].color + ";", 
          "height:", height, "px;",
          "top:", top, "px;",
          "left:", left, "px; width:", width, "px'></div>"
        );
      }
    }
  }
  marker.redraw = function() {
    this.session._signal("changeFrontMarker");
  };
  
  marker.session = ace.session;
  marker.session.addDynamicMarker(marker, true);
}

module.exports = SharedbMultipleCursors;
