# Sharedb-ace-collab

plugin for [sharedb-ace](https://github.com/jethrokuan/sharedb-ace) , that enables display of cursor positions and current selection of other online users.

Fork of [sharedb-ace-multiple-cursors](https://github.com/raynoldng/sharedb-ace-multiple-cursors/), using [@convergencelabs/ace-collab-ext](https://github.com/convergencelabs/ace-collab-ext). Rewritten in Typescript, using PubSub instead of redis.

## Installation
```
npm install sharedb-ace-collab
```

## Server
```js
const {subscribe : SharedbAceMultipleCursorsServer} = require('../sharedb-ace-multiple-cursors/dist/server');

var wss = new WebSocket.Server({server: server});
wss.on('connection', function(ws,req) {
  if(req.url == '/cursor'){
    SharedbAceMultipleCursorsServer(ws,cursorDb);
  }else{
    // Connect any other incoming WebSocket connection to ShareDB
    var stream = new WebSocketJSONStream(ws);
    backend.listen(stream);
  }
});
```

## Client
Include @convergencelabs/ace-collab-ext css:
```
npm install @convergencelabs/ace-collab-ext
```

```js
import {SharedbAceMultipleCursorsClient} from 'sharedb-ace-collab';
const editor = ace.edit("editor");
const ShareAce = new sharedAce(id, { ... });
ShareAce.on('ready', function() {
    ShareAce.add(editor, ["path"], [
        SharedAceMultipleCursors
    ]);
});
```
