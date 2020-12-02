import MRPC from 'muxrpc'
import { pull } from 'pull-stream'
import toPull from 'stream-to-pull-stream'


//we need a manifest of methods we wish to expose.
const manifest = {
  //async is a normal async function
  hello: 'async',

  //source is a pull-stream (readable)
  stuff: 'source'

  //TODO: sink and duplex pull-streams
}

//the actual methods which the server exposes
const api = {
  hello(name, cb) {
    cb(null, 'hello, ' + name + '!')
  },
  stuff() {
    return pull.values([1, 2, 3, 4, 5])
  }
}

//pass the manifests into the constructor, and then pass the local api object you are wrapping
//(if there is a local api)
const client = MRPC(manifest, null) () //MRPC (remoteManifest, localManifest) (localApi)
const server = MRPC(null, manifest) (api)

const onClose = () => {
  console.log('connected to muxrpc server')
}

const serverStream = server.createStream()
const clientStream = client.createStream(onClose)



pull(clientStream, pull.map(s => {
  console.log('dummy-script got: '+s)
  return s
}),
serverStream, clientStream)
// Now you can call methods like this.
client.hello('world', function (err, value) {
  if(err) throw err
  console.log(value)
  // hello, world!
})

// Alternatively, you can use the promise syntax.
client.hello('würld').then((value) => {
  console.log(value)
})

pull(client.stuff(), pull.drain(console.log))