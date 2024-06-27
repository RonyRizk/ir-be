import { z } from 'zod';

const cardNumberPatterns = {
  VISA: /^4[0-9]{12}(?:[0-9]{3})?$/,
  Mastercard: /^5[1-5][0-9]{14}$/,
  AMEX: /^3[47][0-9]{13}$/,
};

const cvcPatterns = {
  VISA: /^[0-9]{3}$/,
  Mastercard: /^[0-9]{3}$/,
  AMEX: /^[0-9]{4}$/,
};

const validateExpiryDate = (expiry: string) => {
  const [month, year] = expiry.split('/').map(Number);
  if (!month || !year || month < 1 || month > 12) {
    return false;
  }
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false;
  }
  return true;
};

export const ZCreditCardSchema = z
  .object({
    cardNumber: z.string().refine(
      val => {
        return cardNumberPatterns.VISA.test(val) || cardNumberPatterns.Mastercard.test(val) || cardNumberPatterns.AMEX.test(val);
      },
      {
        message: 'Invalid card number',
      },
    ),
    cvc: z.string().min(3),
    expiryDate: z.string().refine(validateExpiryDate, {
      message: 'Invalid expiry date',
    }),
    cardHolderName: z.string().min(1, {
      message: 'Cardholder name cannot be empty',
    }),
  })
  .superRefine((data, ctx) => {
    const cardType = Object.keys(cardNumberPatterns).find(type => cardNumberPatterns[type as keyof typeof cardNumberPatterns].test(data.cardNumber));

    if (cardType && !cvcPatterns[cardType as keyof typeof cvcPatterns].test(data.cvc)) {
      ctx.addIssue({
        code: 'custom',
        path: ['cvc'],
        message: "'Invalid CVC",
      });
    }
  });
