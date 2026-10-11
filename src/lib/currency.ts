/**
 * Currency formatter for Pakistani Rupee (PKR / Rs.)
 * Safe against undefined, null, NaN, and non-numeric inputs.
 */
export const formatPKR = (amount?: number | string | null): string => {
  if (amount === undefined || amount === null || amount === '') {
    return 'Rs. 0';
  }
  const numeric = typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/[^0-9.-]+/g, ''));
  if (isNaN(numeric)) {
    return 'Rs. 0';
  }
  const rounded = Math.round(numeric);
  return `Rs. ${rounded.toLocaleString('en-PK')}`;
};

export const formatPKRFull = (amount?: number | string | null): string => {
  if (amount === undefined || amount === null || amount === '') {
    return 'PKR 0';
  }
  const numeric = typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/[^0-9.-]+/g, ''));
  if (isNaN(numeric)) {
    return 'PKR 0';
  }
  const rounded = Math.round(numeric);
  return `PKR ${rounded.toLocaleString('en-PK')}`;
};
