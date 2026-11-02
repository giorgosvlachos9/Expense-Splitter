// currencies.ts
// Rates are relative to 1 USD (hardcoded for demo purposes)
export type Currency = {
    code: string;
    symbol: string;
    name: string;
    ratePerEUR: number;
    decimals: number;
  };
  
  export const CURRENCIES: Currency[] = [
    { code: 'EUR', symbol: '€', name: 'Euro',           ratePerEUR: 1,      decimals: 2 },
    { code: 'USD', symbol: '$', name: 'US Dollar',      ratePerEUR: 1.09,   decimals: 2 },
    { code: 'GBP', symbol: '£', name: 'British Pound',  ratePerEUR: 0.86,   decimals: 2 },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen',   ratePerEUR: 162.5,  decimals: 0 },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee',   ratePerEUR: 90.4,   decimals: 2 },
  ];
  
  export function getCurrency(code: string): Currency {
    return CURRENCIES.find(c => c.code === code) ?? CURRENCIES[0];
  }
  
  
//  Convert an amount in the given currency into EUR.
//   Example: toEUR(109, USD) -> 100
  export function toEUR(amount: number, currency: Currency): number {
    return amount / currency.ratePerEUR;
  }

//   Convert an amount in EUR into the given currency.
//   Example: fromEUR(100, USD) -> 109
  export function fromEUR(amountEUR: number, currency: Currency): number {
    return amountEUR * currency.ratePerEUR;
  }
