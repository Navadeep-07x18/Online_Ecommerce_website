const test = require('node:test')
const assert = require('node:assert/strict')
const { calculateDeliveryEstimate, isExpectedDeliveryDateWithinWindow } = require('../delivery-estimator')

test('rejects empty and malformed PIN codes', () => {
  assert.equal(calculateDeliveryEstimate('').available, false)
  assert.match(calculateDeliveryEstimate('12A456').error, /valid 6-digit/)
  assert.match(calculateDeliveryEstimate('012345').error, /valid 6-digit/)
})

test('standard delivery estimates a random date within six calendar days', () => {
  const orderedAt = new Date('2026-11-07T12:00:00.000Z')
  const earliest = calculateDeliveryEstimate('400001', orderedAt, 'standard', () => 0)
  const latest = calculateDeliveryEstimate('400001', orderedAt, 'standard', () => 0.999)

  assert.equal(earliest.expectedDeliveryDate, '2026-11-09')
  assert.equal(latest.expectedDeliveryDate, '2026-11-13')
  assert.equal(earliest.earliestDeliveryDate, '2026-11-09')
  assert.equal(earliest.latestDeliveryDate, '2026-11-13')
  assert.equal(earliest.estimatedFrom, earliest.estimatedTo)
  assert.equal(latest.maxDays, 6)
})

test('Flash delivery estimates a date within two days', () => {
  const orderedAt = new Date('2026-11-07T12:00:00.000Z')

  assert.equal(calculateDeliveryEstimate('400001', orderedAt, 'flash', () => 0).expectedDeliveryDate, '2026-11-08')
  assert.equal(calculateDeliveryEstimate('400001', orderedAt, 'flash', () => 0.999).expectedDeliveryDate, '2026-11-09')
  assert.equal(calculateDeliveryEstimate('400001', orderedAt, 'flash').deliveryOption, 'flash')
})

test('rejects unknown delivery options', () => {
  assert.match(calculateDeliveryEstimate('400001', new Date(), 'overnight').error, /valid delivery option/)
})

test('validates and keeps the selected expected date for standard and Flash orders', () => {
  const orderedAt = new Date('2026-11-07T12:00:00.000Z')

  assert.equal(isExpectedDeliveryDateWithinWindow('2026-11-12', '400001', 'standard', orderedAt), true)
  assert.equal(isExpectedDeliveryDateWithinWindow('2026-11-08', '400001', 'standard', orderedAt), false)
  assert.equal(isExpectedDeliveryDateWithinWindow('2026-11-08', '400001', 'flash', orderedAt), true)
  assert.equal(isExpectedDeliveryDateWithinWindow('2026-11-10', '400001', 'flash', orderedAt), false)
  assert.equal(isExpectedDeliveryDateWithinWindow('2026-02-30', '400001', 'standard', orderedAt), false)
})

test('marks configured unsupported regions unavailable', () => {
  const estimate = calculateDeliveryEstimate('990001')
  assert.equal(estimate.available, false)
  assert.match(estimate.error, /not available/)
})
