export interface Phone {
  id: number;
  contacts: PhoneContact[];
  serviceAgents: ServiceContact[];
  myNumber?: number;
}

export interface PhoneExtended extends Phone {
  shouldStartClosed?: boolean;
  isBeingCalledBy?: number;
  cachedTransactions?: any[];
}

export interface PhoneContact {
  name: string;
  phone: string;
  nickname?: string;
  available?: boolean;
}

export interface ServiceContact extends PhoneContact {
  service: string;
}
