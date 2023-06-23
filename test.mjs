import {test} from 'node:test'
import assert from 'node:assert'

import * as scid from './index.mjs'

let file = './test.scid'
let fd

test('open', async function () {
    fd = await scid.open(file)
    assert(fd > 0)
})

test('header', async function () {
    let header = await scid.header(fd)
    assert(header.FileTypeUniqueHeaderID == 'SCID')
})

test('record', async function () {
    let record = await scid.record(fd)
    assert(new Date(record.timestamp))
    assert(record.High > record.Low)

    let record_0 = await scid.record(fd, 0)
    assert.deepEqual(record, record_0)

    let record_1 = await scid.record(fd, 1)
    assert.notDeepEqual(record_0, record_1)
})

test('records', async function () {
    let records = []
    for await (let record of scid.records(fd, 2, 4, 2)) {
        records.push(record)
    }
    assert(records.length == 2)

    let records_undefined = []
    for await (let record of scid.records(fd)) {
        records_undefined.push(record)
    }
    assert(records_undefined.length == 1)

    let records_all = []
    for await (let record of scid.records(fd, 0, await scid.quantity(fd))) {
        records_all.push(record)
    }
    assert(records_all.length == 10)
})

test('quantity', async function () {
    let quantity = await scid.quantity(fd)
    assert(quantity == 9)
})

test('find_index', async function () {
    let start_timestamp = new Date(1677011870544).getTime()
    let stop_timestamp = new Date(1677012028608).getTime()
    let index = await scid.find_index(fd, start_timestamp, stop_timestamp)
    assert(index.start == 2)
    assert(index.stop == 7)

    let records = []
    for await (let record of scid.records(fd, index.start, index.stop)) {
        records.push(record)
    }
    assert(records.length == 6)
})

test('console_log', {skip: true}, async function () {
    for await (let record of scid.records(fd, 0, await scid.quantity(fd))) {
        console.log(record)
    }
})

test('ESM23.scid', {skip: false}, async function () {
    console.time('open')
    let fd = await scid.open('./ESM23.scid')
    console.timeEnd('open')
    console.log(fd)

    console.time('quantity')
    let quantity = await scid.quantity(fd)
    console.timeEnd('quantity')
    console.log(quantity)

    // console.time('find_index')
    // let index = await scid.find_index(fd, new Date('May 1, 2023').getTime(), new Date('May 2, 2023').getTime())
    // console.timeEnd('find_index')
    // console.log(index)

    console.time('records')
    let count = 0
    for await (let record of scid.records(fd, 0, 100_000)) {
        count++
    }
    console.timeEnd('records')
    console.log(count)
})

test('close', async function () {
    scid.close(fd)
})
