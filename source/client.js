import marker from '../marker';

const colors = ['BurlyWood', 'PowderBlue', 'Violet', 'GreenYellow',
  'Red', 'LimeGreen', 'DarkViolet', 'GhostWhite', 'OrangeRed', 'HotPink'];
const MAX_COLORS = 10;

function SharedbMultipleCursors(socket, ace) {
  console.log("starting mulitple cursors");
  const MAX_USERS = 50;

  const username = `user${Math.floor(Math.random() * MAX_USERS)}`;
  marker.init(ace);

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
    console.log("received changing cursors", message)


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
  };
}
export default SharedbMultipleCursors;
