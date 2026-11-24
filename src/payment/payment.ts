export interface PaymentInput {
  cardNumber: string;
  expiry: string; // MM/YY
  cvc: string;
  amount: number;
}

export function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\s+/g, "");
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return sum % 10 === 0;
}

export function isExpiryValid(expiry: string, now = new Date()): boolean {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(expiry);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  // card is valid through the last day of its expiry month
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  return endOfMonth >= now;
}

export function isCvcValid(cvc: string): boolean {
  return /^\d{3,4}$/.test(cvc);
}

export function validatePayment(input: PaymentInput): string | null {
  if (!luhnCheck(input.cardNumber)) return "Invalid card number";
  if (!isExpiryValid(input.expiry)) return "Card is expired or expiry is invalid";
  if (!isCvcValid(input.cvc)) return "Invalid CVC";
  if (!(input.amount > 0)) return "Amount must be greater than zero";
  return null;
}