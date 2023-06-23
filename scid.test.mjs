import {test} from 'node:test'
import assert from 'node:assert'

import * as scid from './scid.mjs'

let file = './scid.test.scid'
let fd
let header
let record
let record_0
let record_1

test('open', await async function () {
    fd = await scid.open(file)
    assert(fd > 0)
})

test('header', await async function () {
    header = await scid.header(fd)
    assert(header.FileTypeUniqueHeaderID == 'SCID')
})

test('record', await async function () {
    record = await scid.record(fd)
    assert(new Date(record.timestamp))
    assert(record.High > record.Low)
})

test('record_0', await async function () {
    record_0 = await scid.record(fd, 0)
    assert.deepEqual(record, record_0)
})

test('record_1', await async function () {
    record_1 = await scid.record(fd, 1)
    assert.notDeepEqual(record_0, record_1)
})

test('records', await async function () {
    let records = []
    for await (let record of scid.records(fd, 2, 4, 2)) {
        records.push(2)
    }
    assert(records.length == 2)
})

test('close', await async function () {
    scid.close(fd)
})
