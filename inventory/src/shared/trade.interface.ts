import { Item } from './item-list.model';

export interface TradeInstance {
  tradeId: string;
  items: (Item & { _svAmount: number })[];
  timeRemaining: number;
  acceptButtonText: string;
  rejectButtonText: string;
}
