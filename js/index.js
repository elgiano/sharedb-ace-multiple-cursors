import sharedbAce from "sharedb-ace";
//import SharedbAceRWControl from "sharedb-ace-rw-control/client.js";
// my edits
import SharedbAceMultipleCursors from "sharedb-ace-multiple-cursors/client.js";

const editor = ace.edit("editor"); 
//editor.setTheme("ace/theme/twilight");
const session = editor.getSession();
session.setMode("ace/mode/javascript");
session.setNewLineMode("unix");

const editor2 = ace.edit("editor2"); 
//editor2.setTheme("ace/theme/twilight");
const session2 = editor2.getSession();
session2.setMode("ace/mode/javascript");
session2.setNewLineMode("unix"); 

function get(url, callback){
  const xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function(){
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
      callback(JSON.parse(xmlhttp.responseText));
    }
  }
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}

get("http://localhost:3000/gists/latest", function(data) {
  const ShareAce = new sharedbAce(data.id, {
    WsUrl: "ws://localhost:3000/ws",
    pluginWsUrl: "ws://localhost:3108/ws",
    namespace: "codepad",
  });
  ShareAce.on('ready', function() {
    //ShareAce.add(editor, ["code"], [ SharedbAceRWControl, SharedbAceMultipleCursors]);
    ShareAce.add(editor, ["code"], [SharedbAceMultipleCursors]);
    ShareAce.add(editor2, ["testcases"], []); 
  });
})
