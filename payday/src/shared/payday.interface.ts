export interface Payday {
  gainings: Tax[];
  taxes: Tax[];
  finalStats: Tax[];
}

export interface Tax {
  name: string;
  value: string;
}
