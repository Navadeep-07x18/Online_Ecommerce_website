const deliveryConfig = Object.freeze({
  unsupportedPrefixes: ['99'],
  options: {
    standard: { label: 'Standard delivery', minDays: 2, maxDays: 6 },
    flash: { label: 'Flash delivery', minDays: 1, maxDays: 2 },
  },
})

const addCalendarDays = (date, days) => {
  const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  result.setUTCDate(result.getUTCDate() + days)
  return result.toISOString().slice(0, 10)
}

const calculateDeliveryEstimate = (postalCode, now = new Date(), option = 'standard', random = Math.random) => {
  const normalizedPostalCode = String(postalCode || '').trim()
  if (!/^[1-9]\d{5}$/.test(normalizedPostalCode)) {
    return { available: false, error: 'Enter a valid 6-digit Indian PIN code.' }
  }

  if (deliveryConfig.unsupportedPrefixes.some((prefix) => normalizedPostalCode.startsWith(prefix))) {
    return {
      available: false,
      postalCode: normalizedPostalCode,
      error: 'Delivery is not available for this PIN code.',
    }
  }

  const selectedOption = deliveryConfig.options[option]
  if (!selectedOption) {
    return { available: false, postalCode: normalizedPostalCode, error: 'Choose a valid delivery option.' }
  }

  const randomValue = Number(random())
  if (!Number.isFinite(randomValue)) throw new Error('The delivery date could not be calculated.')
  const boundedRandom = Math.max(0, Math.min(randomValue, 1 - Number.EPSILON))
  const daysUntilDelivery = selectedOption.minDays
    + Math.floor(boundedRandom * (selectedOption.maxDays - selectedOption.minDays + 1))
  const expectedDeliveryDate = addCalendarDays(now, daysUntilDelivery)

  return {
    available: true,
    postalCode: normalizedPostalCode,
    deliveryOption: option,
    deliveryType: selectedOption.label,
    minDays: selectedOption.minDays,
    maxDays: selectedOption.maxDays,
    estimatedFrom: expectedDeliveryDate,
    estimatedTo: expectedDeliveryDate,
    expectedDeliveryDate,
  }
}

module.exports = { calculateDeliveryEstimate, deliveryConfig }
