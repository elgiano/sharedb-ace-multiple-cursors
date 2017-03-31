# Shared-ace-mulitple-cursors

plugin for [sharedb-ace](https://github.com/jethrokuan/sharedb-ace) , that enables display of cursor positions of other online users.

## Installation
```
npm install sharedb-ace-multiple-cursors
```

## Server
```js
import SharedbAceMultipleCursors from 'sharedb-ace-mulitple-cursors/server';

router.get('/ws', async (ctx) => {
  const mc = SharedbAceMultipleCursors(REDIS_URL);
  mc(ctx);
});
```

## Client 
```js
import SharedbAceMultipleCursors from 'sharedb-ace-multiple-cursors/client';
const editor = ace.edit("editor");
const ShareAce = new sharedAce(id, { ... });
ShareAce.on('ready', function() {
    ShareAce.add(editor, ["path"], [
        SharedAceMultipleCursors
    ]);
});
```
