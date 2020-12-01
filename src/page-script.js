import MRPC from 'muxrpc'
import { pull } from 'pull-stream'
//const MRPC = require('muxrpc')
//const pull = require('pull-stream')




let messageDataCallback = null
let messageDataBuffer = []

pull(
  function read(abort, cb) {
    if (messageDataBuffer.length > 0) {
      const data = messageDataBuffer[0]
      messageDataBuffer = messageDataBuffer.splice(1)
      cb(null, data)
    } else {
      messageDataCallback = cb
    }

  },
  pull.map(s => 'page-script got: '+s),
  pull.log()
)

window.addEventListener("message", (event) => {
  if (event.source == window &&
      event.data &&
      event.data.direction == "from-content-script") {
        if (messageDataCallback) {
          const _messageDataCallback = messageDataCallback
          messageDataCallback = null
          _messageDataCallback(null, event.data.message)
        } else {
          messageDataBuffer.push(1)
        }
  }
});


var messenger = document.getElementById("from-page-script");

messenger.addEventListener("click", messageContentScript);

function messageContentScript() {
  window.postMessage({
    direction: "from-page-script",
    message: "Message from the page"
  }, "*");
}
