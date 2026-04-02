namespace SH1106 {

    //% block="scrivi testo %text a x %x y %y"
    export function writeStringBlock(x: number, y: number, text: string) {
        writeString(x, y, text)
    }

    //% block="disegna pixel a x %x y %y"
    export function pixelBlock(x: number, y: number) {
        setPixel(x, y, true)
        refresh()
    }

    //% block="disegna linea da x0 %x0 y0 %y0 a x1 %x1 y1 %y1"
    export function lineBlock(x0: number, y0: number, x1: number, y1: number) {
        drawLine(x0, y0, x1, y1)
        refresh()
    }

    //% block="riempi rettangolo x %x y %y larghezza %w altezza %h"
    export function fillRectBlock(x: number, y: number, w: number, h: number) {
        fillRect(x, y, w, h)
        refresh()
    }

    //% block="cancella schermo"
    export function clearBlock() {
        clear()
    }

    //% block="inizializza display indirizzo %address"
    export function initBlock(address: I2CAddress) {
        init(address)
    }
}
