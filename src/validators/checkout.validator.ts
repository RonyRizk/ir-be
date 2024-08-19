import { z } from 'zod';

// const cardNumberPatterns = {
//   VISA: /^4[0-9]{12}(?:[0-9]{3})?$/,
//   Mastercard: /^5[1-5][0-9]{14}$/,
//   AMEX: /^3[47][0-9]{13}$/,
// };

// const cvcPatterns = {
//   VISA: /^[0-9]{3}$/,
//   Mastercard: /^[0-9]{3}$/,
//   AMEX: /^[0-9]{4}$/,
// };

// const validateExpiryDate = (expiry: string) => {
//   const [month, year] = expiry.split('/').map(Number);
//   if (!month || !year || month < 1 || month > 12) {
//     return false;
//   }
//   const currentYear = new Date().getFullYear() % 100;
//   const currentMonth = new Date().getMonth() + 1;
//   if (year < currentYear || (year === currentYear && month < currentMonth)) {
//     return false;
//   }
//   return true;
// };
function validateCreditCardNumber(number) {
  // Remove all non-digit characters
  number = number.replace(/\D/g, '');

  let sum = 0;
  let shouldDouble = false;

  // Traverse the number from right to left
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number.charAt(i), 10);

    if (shouldDouble) {
      // Double the digit
      digit *= 2;

      // If the result is a two-digit number, add the digits together
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  // If the sum is divisible by 10, the number is valid
  return sum % 10 === 0;
}
export const ZCreditCardSchemaWithCvc = z.object({
  cardNumber: z.string().refine(arg => validateCreditCardNumber(arg), {
    message: 'Invalid credit card number',
  }),
  cvc: z.string().regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
  cardHolderName: z.string().min(1, 'Holder name is required'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry date must be in MM/YY format'),
});
export const ZCreditCardSchemaWithoutCvc = z.object({
  cardNumber: z.string().regex(/^\d{15,16}$/, 'Card number must be 15 or 16 digits'),
  cardHolderName: z.string().min(1, 'Holder name is required'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry date must be in MM/YY format'),
});
// export const ZCreditCardSchema = z
//   .object({
//     cardNumber: z.string().refine(
//       val => {
//         return cardNumberPatterns.VISA.test(val) || cardNumberPatterns.Mastercard.test(val) || cardNumberPatterns.AMEX.test(val);
//       },
//       {
//         message: 'Invalid card number',
//       },
//     ),
//     cvc: z.string().min(3),
//     expiryDate: z.string().refine(validateExpiryDate, {
//       message: 'Invalid expiry date',
//     }),
//     cardHolderName: z.string().min(1, {
//       message: 'Cardholder name cannot be empty',
//     }),
//   })
//   .superRefine((data, ctx) => {
//     const cardType = Object.keys(cardNumberPatterns).find(type => cardNumberPatterns[type as keyof typeof cardNumberPatterns].test(data.cardNumber));

//     if (cardType && !cvcPatterns[cardType as keyof typeof cvcPatterns].test(data.cvc)) {
//       ctx.addIssue({
//         code: 'custom',
//         path: ['cvc'],
//         message: "'Invalid CVC",
//       });
//     }
//   });

const ICardProcessingWithoutCVC = z.object({
  code: z.literal('004'),
  cardNumber: z.string(),
  cardHolderName: z.string(),
  expiry_month: z.string(),
  expiry_year: z.string(),
});

const ICardProcessingWithCVC = z.object({
  code: z.literal('001'),
  cardNumber: z.string(),
  cardHolderName: z.string(),
  expiry_month: z.string(),
  expiry_year: z.string(),
  cvc: z.string(),
});

export const ICardProcessing = z.union([ICardProcessingWithoutCVC, ICardProcessingWithCVC]);
