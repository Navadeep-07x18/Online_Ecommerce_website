const test = require('node:test')
const assert = require('node:assert/strict')
const { simulatePayment } = require('../payment-simulator')

test('simulates successful and failed online payments without collecting credentials', () => {
  for (const method of ['UPI', 'CREDIT_CARD', 'DEBIT_CARD']) {
    const success = simulatePayment(method)
    const failure = simulatePayment(method, true)
    assert.equal(success.status, 'SUCCESS')
    assert.match(success.transactionReference, /^LUXE-PAY-/)
    assert.ok(success.paidAt)
    assert.equal(failure.status, 'FAILED')
    assert.equal(failure.paidAt, null)
  }
})

test('keeps COD pending and rejects unknown payment methods', () => {
  assert.deepEqual(simulatePayment('COD'), {
    status: 'PENDING',
    transactionReference: null,
    paidAt: null,
  })
  assert.throws(() => simulatePayment('WIRE_TRANSFER'), /Unsupported payment method/)
})
