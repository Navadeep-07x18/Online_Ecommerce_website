const crypto = require('crypto')

const paymentMethods = ['UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'COD']

const simulatePayment = (paymentMethod, simulateFailure = false) => {
  if (!paymentMethods.includes(paymentMethod)) {
    throw new Error('Unsupported payment method.')
  }

  if (paymentMethod === 'COD') {
    return { status: 'PENDING', transactionReference: null, paidAt: null }
  }

  return {
    status: simulateFailure ? 'FAILED' : 'SUCCESS',
    transactionReference: `LUXE-PAY-${crypto.randomBytes(6).toString('hex').toUpperCase()}`,
    paidAt: simulateFailure ? null : new Date().toISOString(),
  }
}

module.exports = { paymentMethods, simulatePayment }
