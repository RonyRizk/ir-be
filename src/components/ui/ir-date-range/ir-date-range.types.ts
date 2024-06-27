export interface IDateModifiers {
  [date: string]: IDateModifierOptions;
}

export interface IDateModifierOptions {
  disabled?: boolean;
  withPrice: TPrice | null;
}

type TPrice = {
  price: number;
  currency: ICurrency;
};

export interface ICurrency {
  code: string;
  description: string;
}
