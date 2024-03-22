import { ServerItemsService, Server_Init } from '@armoury/fivem-roleplay-gamemode';
import { Server } from './controllers/server.controller';
import {
  Apple,
  Bandages,
  BeerCan,
  Champagne,
  Chocolate,
  Coke,
  ColdCoffee,
  Donut,
  Medkit,
  RedBull,
  Rum,
  Sandwich,
  Water,
  Whiskey,
} from '@shared/items';

Server_Init(
  Server,
  ServerItemsService.withItems(
    Apple,
    Bandages,
    BeerCan,
    Champagne,
    Chocolate,
    Coke,
    ColdCoffee,
    Donut,
    Medkit,
    RedBull,
    Rum,
    Sandwich,
    Water,
    Whiskey
  )
);
