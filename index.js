const { createSocket } = require('dgram')
const { createServer } = require('net')
const { ViscaDecoder } = require('./decoder')
const { PanasonicController } = require('./encoder')

const decoder = new ViscaDecoder()
decoder.on('log', (msg) => console.log(msg))

console.log('host', process.argv[2], 'port', process.argv[4] || 52381, process.argv[3])

const encoder = new PanasonicController(process.argv[2])

decoder.on('panTiltOp', controls => {
    let {
        panOperation,
        panSpeed,
        tiltOperation,
        tiltSpeed,
    } = controls

    let pan = 50
    let tilt = 50

    // convert speed from 0...23 to 0...49
    const convert = (speed) => (speed / 23) * 49

    panSpeed = convert(panSpeed)
    tiltSpeed = convert(tiltSpeed)

    const panModifier = panOperation === 'left' ? -1 : panOperation === 'right' ? 1 : 0
    const tiltModifier = tiltOperation === 'up' ? -1 : tiltOperation === 'down' ? 1 : 0

    pan += panModifier * panSpeed
    tilt += tiltModifier * tiltSpeed

    encoder.setPanTilt(pan, tilt)
})
decoder.on('zoomOp', controls => {
    const { operation, speed } = controls
    const modifier = operation === 'in' ? 1 : operation === 'out' ? -1 : 0
    const zoom = 50 + modifier * 49 * ((0.125 + speed / 8) || 0.5)
    console.log(operation, speed, modifier, zoom)
    encoder.setZoom(zoom)
})
decoder.on('focusOp', controls => {
    const { operation, speed } = controls
    const modifier = operation === 'far' ? 1 : operation === 'near' ? -1 : 0
    const focus = 50 + modifier * 49 * ((0.125 + speed / 8) || 0.5)
    console.log(operation, speed, modifier, focus)
    encoder.setFocus(focus)
})
decoder.on('focusMode', controls => {
    const { mode } = controls
    console.log("focusMode", mode)
    encoder.setFocusMode(mode)
})
decoder.on('focusSet', controls => {
    const { target } = controls
    setPoint = (0xe000 - (target - 0x1000)) * 0xffff / 0xe000
    //0x1000 in = 0xffff out, 0xf000 in = 0x0000 out
    console.log("focusMode", setPoint)
    encoder.setFocusPoint(setPoint)
})

if (process.argv[3] === 'udp') {
    const receiveSocket = createSocket('udp4', (msg, origin) => {
        receiveSocket.send(Buffer.from[[0x90, 0x40, 0xff]], origin.port, origin.address)
        console.log(msg)
        decoder.processBuffer(msg)
        receiveSocket.send(Buffer.from[[0x90, 0x50, 0xff]], origin.port, origin.address)
    })
    receiveSocket.bind(process.argv[4] || 52381)
} else if (process.argv[3] === 'tcp') {
    const tcpReceive = createServer((socket) => {
        socket.on('data', (msg) => {
            socket.write(Buffer.from([0x90, 0x40, 0xff]))
            console.log(msg)
            decoder.processBuffer(msg)
            socket.write(Buffer.from([0x90, 0x50, 0xff]))
        })
    })
    tcpReceive.listen(process.argv[4] || 52381)
} else {
    throw new Error('TCP or UDP not specified!')
}
