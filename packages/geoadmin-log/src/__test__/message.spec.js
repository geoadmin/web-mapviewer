import { expect } from 'chai'
import { ErrorMessage } from 'packages/geoadmin-log/src/Message'
import { describe, it } from 'vitest'

describe('Unit Tests for messages', () => {
    describe('checking equality between messages', () => {
        it('Ensure that errors with no sources are considered equal too when the rest is equal', () => {
            const msg1 = new ErrorMessage({ msg: 'test text', params: {} })
            const msg2 = new ErrorMessage({ msg: 'test text', params: {} })
            const msg3 = new ErrorMessage({
                msg: 'test text',
                params: { key1: 'value1', key2: 'value2' },
            })
            const msg4 = new ErrorMessage({
                msg: 'test text',
                params: { key1: 'value1', key2: 'value2' },
            })
            expect(msg1.isEquals(msg1)).to.equal(true)
            expect(msg1.isEquals(msg2)).to.equal(true)
            expect(msg3.isEquals(msg3)).to.equal(true)
            expect(msg3.isEquals(msg4)).to.equal(true)
        })
        it('detects equality and inequality between two messages', () => {
            // messages without parameter
            const simpleTextMsg1 = new ErrorMessage({
                msg: 'test text',
                params: {},
                sourceId: 'test_source_12345',
            })
            const copyOfimpleTextMsg1 = new ErrorMessage({
                msg: 'test text',
                params: {},
                sourceId: 'test_source_12345',
            })
            const simpleTextMsg1OtherSource = new ErrorMessage({
                msg: 'test text',
                params: {},
                sourceId: 'test_source_02345',
            })
            const simpleTextMsg2 = new ErrorMessage({
                msg: 'Another test text',
                params: {},
                sourceId: 'test_source_12345',
            })

            expect(simpleTextMsg1.isEquals(simpleTextMsg1)).to.be.true
            expect(simpleTextMsg1.isEquals(copyOfimpleTextMsg1)).to.be.true
            expect(simpleTextMsg1.isEquals(simpleTextMsg1OtherSource)).to.be.false // different source
            expect(simpleTextMsg1.isEquals(simpleTextMsg2)).to.be.false // different msg

            // messages with parameters
            const paramMsg1 = new ErrorMessage({
                msg: 'test text',
                params: { key1: 'value1', key2: 'value2' },
                sourceId: 'test_source_12345',
            })
            const copyOfParamMsg1 = new ErrorMessage({
                msg: 'test text',
                params: { key1: 'value1', key2: 'value2' },
                sourceId: 'test_source_12345',
            })
            const paramMsg2 = new ErrorMessage({
                msg: 'test text',
                params: { key1: 'value2', key2: 'value2' },
                sourceId: 'test_source_12345',
            })

            const paramMsg3 = new ErrorMessage({
                msg: 'test text',
                params: { key2: 'value1', key3: 'value2' },
                sourceId: 'test_source_12345',
            })
            const paramMsg4 = new ErrorMessage({
                msg: 'Another test text',
                params: { key1: 'value1', key2: 'value2' },
                sourceId: 'test_source_12345',
            })
            expect(simpleTextMsg1.isEquals(paramMsg1)).to.be.false // empty params vs params
            expect(paramMsg1.isEquals(paramMsg1)).to.be.true
            expect(paramMsg1.isEquals(copyOfParamMsg1)).to.be.true
            expect(paramMsg1.isEquals(paramMsg4)).to.be.false // different text with params
            expect(paramMsg1.isEquals(paramMsg2)).to.be.false // different values in params
            expect(paramMsg1.isEquals(paramMsg3)).to.be.false // different keys in params
        })
        it('ensure that acknowledement of a message does not change equality', () => {
            const msg1 = new ErrorMessage({ msg: 'test', params: {}, isAcknowledged: false })
            const msg2 = new ErrorMessage({ msg: 'test', params: {}, isAcknowledged: true })
            expect(msg1.isEquals(msg2)).to.be.true
        })
    })
})
