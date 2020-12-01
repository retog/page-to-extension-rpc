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
  pull.map(s => 'content-script got: '+s),
  pull.log()
)

window.addEventListener("message", (event) => {
  if (event.source == window &&
      event.data &&
      event.data.direction == "from-page-script") {
        if (messageDataCallback) {
          const _messageDataCallback = messageDataCallback
          messageDataCallback = null
          _messageDataCallback(null, event.data.message)
        } else {
          messageDataBuffer.push(1)
        }
  }
});

/*
Send a message to the page script.
*/
function messagePageScript() {
  window.postMessage({
    direction: "from-content-script",
    message: "Message from the köntent skript"
  }, window.location.origin);
}



var fromContentScript = document.getElementById("from-content-script");
fromContentScript.addEventListener("click", messagePageScript);
/*
const manifest = {
  //async is a normal async function
  hello: 'async',

  //source is a pull-stream (readable)
  stuff: 'source'

  //TODO: sink and duplex pull-streams
}

const api = {
  hello(name, cb) {
    cb(null, 'hello, ' + name + '!')
  },
  stuff() {
    return pull.values([1, 2, 3, 4, 5])
  }
}

const client = MRPC(manifest, null) () //MRPC (remoteManifest, localManifest) (localApi)
const server = MRPC(null, manifest) (api)

*/