export interface Phone {
    id: number;
    contacts: PhoneContact[];
    serviceAgents: ServiceContact[];
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
