const colors = ['BurlyWood', 'PowderBlue', 'Violet', 'GreenYellow',
  'Red', 'LimeGreen', 'DarkViolet', 'GhostWhite', 'OrangeRed', 'HotPink'];
const MAX_COLORS = 10;

function SharedbMultipleCursors(socket, ace) {
  const MAX_USERS = 50;

  const marker = {};
  marker.cursors = {}; // username -> {color, cursors}

  const username = `user${Math.floor(Math.random() * MAX_USERS)}`;

  // Initialize User
  socket.addEventListener('open', () => {
    const message = {
      id: 'initUser',
      userName: username,
      cursor: ace.getCursorPosition(),
    };
    socket.send(JSON.stringify(message));
  });

  // listen for local cursor changes
  ace.selection.on('changeCursor', () => {
    const message = {
      id: 'cursorChange',
      userName: username,
      cursor: ace.getCursorPosition(),
    };

    socket.send(JSON.stringify(message));
  });

  socket.addEventListener('message', (msg) => {
    let message = null;
    try {
      message = JSON.parse(msg.data);
    } catch (e) {
      return;
    }

    switch (message.id) {
      case 'cursorChange':
        if (message.userName === username) break;

        if (!(message.userName in marker.cursors)) {
          marker.cursors[message.userName] = {
            cursor: message.cursor,
            color: colors[Math.floor(Math.random() * MAX_COLORS)],
          };
        } else {
          marker.cursors[message.userName].cursor = message.cursor;
        }
        marker.redraw();
        break;
      case 'removeUser':
        if (message.userName in marker.cursors) {
          delete marker.cursors[message.userName];
        }
        break;
      default:
    }
  });

  marker.update = function (html, markerLayer, session, config) {
    const start = config.firstRow;
    const end = config.lastRow;
    const cursors = this.cursors;

    for (const property in cursors) {
      // for (var i = 0; i < cursors.length; i++) {
      if ('cursor' in this.cursors[property]) {
        const pos = this.cursors[property].cursor;
        if (pos.row > end) {
          break;
        }
        if (pos.row >= start) {
          // compute cursor position on screen
          // this code is based on ace/layer/marker.js
          const screenPos = session.documentToScreenPosition(pos);

          const height = config.lineHeight;
          const width = config.characterWidth;
          const top = markerLayer.$getTop(screenPos.row, config);
          const left = markerLayer.$padding + (screenPos.column * width);
          // can add any html here
          html.push(
            "<div style='",
            'position: absolute;',
            `border-left: 2px solid ${this.cursors[property].color};`,
            'height:', height, 'px;',
            'top:', top, 'px;',
            'left:', left, 'px; width:', width, "px'></div>",
          );
        }
      }
    }
  };
  marker.redraw = function () {
    this.session._signal('changeFrontMarker');
  };

  marker.session = ace.session;
  marker.session.addDynamicMarker(marker, true);
}

module.exports = SharedbMultipleCursors;
