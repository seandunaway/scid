import {test} from 'node:test'
import assert from 'node:assert'

import * as scid from './scid.mjs'

let file = './scid.test.scid'
let fd

test('open', await async function () {
    fd = await scid.open(file)
    assert(fd > 0)
})

test('header', await async function () {
    let header = await scid.header(fd)
    assert(header.FileTypeUniqueHeaderID == 'SCID')
})

test('record', await async function () {
    let record = await scid.record(fd)
    assert(new Date(record.timestamp))
    assert(record.High > record.Low)

    let record_0 = await scid.record(fd, 0)
    assert.deepEqual(record, record_0)

    let record_1 = await scid.record(fd, 1)
    assert.notDeepEqual(record_0, record_1)
})

test('records', await async function () {
    let records = []
    for await (let record of scid.records(fd, 2, 4, 2)) {
        records.push(record)
    }
    assert(records.length == 2)

    let records_undefined = []
    for await (let record of scid.records(fd)) {
        records_undefined.push(record)
    }
})

test('quantity', await async function () {
    let quantity = await scid.quantity(fd)
    assert(quantity == 10)
})

test('close', await async function () {
    scid.close(fd)
})
