import {Buffer} from 'node:buffer'
import {open as fs_open, close as fs_close, read as fs_read} from 'node:fs'

let s_IntradayHeaderSize = 56
let s_IntradayRecordSize = 40
let epoch = new Date('December 30, 1899 UTC')
let epoch_micro = BigInt(epoch.getTime() * 1000)

export function open(file) {
    let promise = new Promise(function (resolve) {
        fs_open(file, function (err, fd) {
            if (err) throw err
            resolve(fd)
        })
    })
    return promise
}

export function header(fd) {
    let buffer = Buffer.allocUnsafe(s_IntradayHeaderSize)
    let promise = new Promise (function (resolve) {
        fs_read(fd, buffer, 0, s_IntradayHeaderSize, null, function (err, bytesRead, buffer) {
            if (err) throw err
            if (bytesRead !== s_IntradayHeaderSize) throw new Error ('header size')

            let s_IntradayHeader = {
                FileTypeUniqueHeaderID: buffer.toString('ascii', 0, 4),
                HeaderSize: buffer.readUInt32LE(4),
                RecordSize: buffer.readUInt32LE(8),
                Version: buffer.readUInt16LE(12),
                Unused1: buffer.readUInt16LE(14),
                UTCStartIndex: buffer.readUInt32LE(16),
                Reserve: buffer.toString('hex', 20, 36),
            }

            if (s_IntradayHeader.FileTypeUniqueHeaderID !== 'SCID') throw new Error ('header id')

            resolve(s_IntradayHeader)
        })
    })
    return promise
}

export function record(fd, index) {
    let position
    if (typeof index !== 'undefined')
        position = s_IntradayHeaderSize + (index * s_IntradayRecordSize)
    else
        position = null // fs.open() will sequential read


    let buffer = Buffer.allocUnsafe(s_IntradayRecordSize)
    let promise = new Promise (function (resolve) {
        fs_read(fd, buffer, 0, s_IntradayRecordSize, position, function (err, bytesRead, buffer) {
            if (err) throw err
            if (bytesRead !== s_IntradayRecordSize) resolve(false)

            let s_IntradayRecord = {
                SCDateTimeMS: buffer.readBigUInt64LE(0),
                Open: buffer.readFloatLE(8),
                High: buffer.readFloatLE(12),
                Low: buffer.readFloatLE(16),
                Close: buffer.readFloatLE(20),
                NumTrades: buffer.readUInt32LE(24),
                TotalVolume: buffer.readUInt32LE(28),
                BidVolume: buffer.readUInt32LE(32),
                AskVolume: buffer.readUInt32LE(36),
            }

            if (! s_IntradayRecord.SCDateTimeMS) throw new Error ('record id')

            s_IntradayRecord.timestamp = Number(s_IntradayRecord.SCDateTimeMS + epoch_micro) / 1000

            resolve (s_IntradayRecord)
        })
    })
    return promise
}

export async function * records(fd, start, stop) {
/** @todo */
}

export function close(fd) {
    fs_close(fd)
}
