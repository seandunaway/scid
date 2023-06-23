import {test} from 'node:test'
import assert from 'node:assert'

import * as scid from './scid.mjs'

let file = './scid.test.scid'
let fd
let header
let record_default
let record_index
let record_sequential

test('open', await async function () {
    fd = await scid.open(file)
    assert(fd > 0)
})

test('header', await async function () {
    header = await scid.header(fd)
    assert(header.FileTypeUniqueHeaderID == 'SCID')
})

test('record_default', await async function () {
    record_default = await scid.record(fd)
    assert(new Date(record_default.timestamp))
    assert(record_default.High > record_default.Low)
})

test('record_index', await async function () {
    record_index = await scid.record(fd, 0)
    assert.deepEqual(record_default, record_index)
})

test('record_sequential', await async function () {
    record_sequential = await scid.record(fd)
    assert(record_sequential.timestamp > record_index.timestamp)
})

test('records_generator', await async function () {
    let records = []
    for await (let record of scid.records(fd, 2, 4, 2)) {
        records.push(2)
    }
    assert(records.length == 2)
})

test('close', await async function () {
    scid.close(fd)
})
