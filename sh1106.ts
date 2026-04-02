namespace SH1106 {

    export enum I2CAddress {
        Addr_3C = 0x3C,
        Addr_3D = 0x3D
    }

    let addr = 0x3C
    let initialized = false

    // 1 byte controllo (0x40) + 1024 byte framebuffer
    let buffer = pins.createBuffer(1025)

    // -------------------------------------------------------
    //  LOW LEVEL
    // -------------------------------------------------------

    function cmd(c: number) {
        let b = pins.createBuffer(2)
        b[0] = 0x00
        b[1] = c
        pins.i2cWriteBuffer(addr, b)
    }

    function refresh() {
        if (!initialized) return

        for (let page = 0; page < 8; page++) {
            cmd(0xB0 + page)   // set page
            cmd(0x02)          // low column
            cmd(0x10)          // high column

            let start = 1 + page * 128
            let slice = buffer.slice(start, 128)
            pins.i2cWriteBuffer(addr, slice)
        }
    }

    // -------------------------------------------------------
    //  INIT
    // -------------------------------------------------------

    export function init(address: I2CAddress = I2CAddress.Addr_3C) {
        addr = address
        initialized = true

        buffer[0] = 0x40

        cmd(0xAE)        // display off
        cmd(0xD5); cmd(0x80)
        cmd(0xA8); cmd(0x3F)
        cmd(0xD3); cmd(0x00)
        cmd(0x40)
        cmd(0xA1)
        cmd(0xC8)
        cmd(0xDA); cmd(0x12)
        cmd(0x81); cmd(0x7F)
        cmd(0xD9); cmd(0x22)
        cmd(0xDB); cmd(0x20)
        cmd(0xA4)
        cmd(0xA6)
        cmd(0xAF)

        clear()
        refresh()
    }

    // -------------------------------------------------------
    //  DRAWING
    // -------------------------------------------------------

    export function clear() {
        for (let i = 1; i < 1025; i++) buffer[i] = 0
        refresh()
    }

    export function setPixel(x: number, y: number, color: boolean = true) {
        if (x < 0 || x >= 128 || y < 0 || y >= 64) return

        let page = y >> 3
        let index = 1 + page * 128 + x
        let mask = 1 << (y & 7)

        if (color) buffer[index] |= mask
        else buffer[index] &= ~mask
    }

    export function drawLine(x0: number, y0: number, x1: number, y1: number) {
        let dx = Math.abs(x1 - x0)
        let sx = x0 < x1 ? 1 : -1
        let dy = -Math.abs(y1 - y0)
        let sy = y0 < y1 ? 1 : -1
        let err = dx + dy

        while (true) {
            setPixel(x0, y0, true)
            if (x0 == x1 && y0 == y1) break
            let e2 = err << 1
            if (e2 >= dy) { err += dy; x0 += sx }
            if (e2 <= dx) { err += dx; y0 += sy }
        }
    }

    export function fillRect(x: number, y: number, w: number, h: number) {
        for (let yy = y; yy < y + h; yy++) {
            for (let xx = x; xx < x + w; xx++) {
                setPixel(xx, yy, true)
            }
        }
    }

    // -------------------------------------------------------
    //  TEXT (font 5x7 base)
    // -------------------------------------------------------

    const font: number[] = [
        // font minimale: spazio + ASCII base
        // puoi aggiungere tutto il font completo se vuoi
        0x00,0x00,0x00,0x00,0x00, // space
        0x00,0x00,0x5F,0x00,0x00, // !
        0x00,0x07,0x00,0x07,0x00, // "
        // ...
    ]

    export function writeChar(x: number, y: number, c: string) {
        let code = c.charCodeAt(0)
        if (code < 32 || code > 126) return
        let index = (code - 32) * 5

        for (let col = 0; col < 5; col++) {
            let line = font[index + col]
            for (let row = 0; row < 7; row++) {
                let pixel = (line >> row) & 1
                if (pixel) setPixel(x + col, y + row)
            }
        }
    }

    export function writeString(x: number, y: number, text: string) {
        let cursor = x
        for (let i = 0; i < text.length; i++) {
            writeChar(cursor, y, text.charAt(i))
            cursor += 6
        }
        refresh()
    }
}
