/**
 * Convert number to Indian Currency Words format
 * e.g., 42500 -> "Rupees Forty-Two Thousand Five Hundred Only"
 */

const ones = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const tens = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

function convertLessThanThousand(n: number): string {
  if (n === 0) return '';
  let str = '';

  if (n >= 100) {
    str += ones[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }

  if (n >= 20) {
    str += tens[Math.floor(n / 10)];
    if (n % 10 > 0) {
      str += '-' + ones[n % 10];
    }
    str += ' ';
  } else if (n > 0) {
    str += ones[n] + ' ';
  }

  return str.trim();
}

export function numberToIndianWords(amount: number): string {
  if (!amount || isNaN(amount) || amount === 0) {
    return 'Rupees Zero Only';
  }

  const rounded = Math.round(amount * 100) / 100;
  const wholeNumber = Math.floor(rounded);
  const paise = Math.round((rounded - wholeNumber) * 100);

  let num = wholeNumber;
  let words = '';

  const crore = Math.floor(num / 10000000);
  num %= 10000000;

  const lakh = Math.floor(num / 100000);
  num %= 100000;

  const thousand = Math.floor(num / 1000);
  num %= 1000;

  const hundred = num;

  if (crore > 0) {
    words += convertLessThanThousand(crore) + ' Crore ';
  }
  if (lakh > 0) {
    words += convertLessThanThousand(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    words += convertLessThanThousand(thousand) + ' Thousand ';
  }
  if (hundred > 0) {
    words += convertLessThanThousand(hundred) + ' ';
  }

  words = words.trim();
  let result = words ? `Rupees ${words}` : 'Rupees Zero';

  if (paise > 0) {
    result += ` and ${convertLessThanThousand(paise)} Paise`;
  }

  result += ' Only';
  return result;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount || 0);
}
