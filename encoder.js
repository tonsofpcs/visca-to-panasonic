const axios = require('axios')

class PanasonicController {
    constructor (ip) {
        this.ip = ip
        axios.defaults.baseURL = `http://${this.ip}/cgi-bin/aw_ptz`
    }

    toValidPanTiltVal (val) {
        return ('00' + Math.max(Math.min(Math.abs(Math.round(val)), 99), 1)).substr(-2)
    }

    setPanTilt (p, t) {
        console.log(`#PTS${this.toValidPanTiltVal(p)}${this.toValidPanTiltVal(t)}`)
        axios.get('', {
            params: {
                cmd: `#PTS${this.toValidPanTiltVal(p)}${this.toValidPanTiltVal(t)}`,
                res: 1
            }
        })
    }
    setZoom (z) {
        console.log(`#Z${this.toValidPanTiltVal(z)}`)
        axios.get('', {
            params: {
                cmd: `#Z${this.toValidPanTiltVal(z)}`,
                res: 1
            }
        })
    }
    setFocus (f) {
        console.log(`#F${this.toValidPanTiltVal(f)}`)
        axios.get('', {
            params: {
                cmd: `#F${this.toValidPanTiltVal(f)}`,
                res: 1
            }
        })
    }
    setFocusMode (m) {
        console.log(`#D1${m}`)
        axios.get('', {
            params: {
                cmd: `#D1${m}`,
                res: 1
            }
        })
    }
    setFocusPoint (p) {
        p = 0x555 + p * (0xfff - 0x555)/0xffff
        //0xffff in = 0xfff out, 0x0000 in = 0x555 out
        const ps = p.toString(16)
        console.log(`#AXF${ps}h`)
        axios.get('', {
            params: {
                cmd: `#AXF${ps}h`,
                res: 1
            }
        })
    }
}

module.exports = { PanasonicController }