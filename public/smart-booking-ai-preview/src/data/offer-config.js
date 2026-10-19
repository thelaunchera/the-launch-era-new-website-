export const offerConfig = Object.freeze({
  discountPercent: 40,
  eligibleCharge: 'initial eligible bundle setup only',
  promotionEnabledAtVerification: true,
  promotionVerifiedAt: '2026-10-19',
  setupPrice: null,
  aiMonthlyPrice: null,
  promotionDeadline: null,
  paymentProcessorConnected: false
});

export const displayPrice = (value, lang = 'en') => {
  if (Number.isFinite(value) && value >= 0) {
    return new Intl.NumberFormat(lang === 'es' ? 'es-US' : 'en-US', { style: 'currency', currency: 'USD' }).format(value);
  }
  return lang === 'es' ? 'Se comparte antes de decidir' : 'Shared before you decide';
};
