import { Export, FiveMController } from '@core/decorators/armoury.decorators';
import { ServerDBDependentController } from '@core/server/server-db-dependent.controller';

import {
  Phone,
  PhoneContact,
  PhoneExtended,
  ServiceContact,
} from '@shared/phone.model';

import { Player } from '../../../../authentication/src/shared/models/player.model';

@FiveMController()
export class Server extends ServerDBDependentController<Phone> {
  private phones: Map<number, number> = new Map<number, number>();
  private activeConversations: Map<number, number> = new Map<number, number>();

  public constructor(dbTableName: string) {
    super(dbTableName, false);

    this.registerListeners();
    this.fetchOnlinePlayersPhones();
  }

  private registerListeners(): void {
    onNet(`${GetCurrentResourceName()}:add-contact`, (data: PhoneContact) => {
      const playerPhone: Phone = this.entities.find(
        (phone: Phone) =>
          phone.id ===
          Number(
            global.exports['authentication'].getPlayerInfo(source, 'phone')
          )
      );

      if (playerPhone) {
        playerPhone.contacts.push(data);
        this.saveDBEntityAsync(playerPhone.id);
      }
    });

    onNet(`${GetCurrentResourceName()}:request-use-phone`, () => {
      const serviceAgents: ServiceContact[] = [
        ...global.exports['factions-taxi']
          .getAvailableTaxiDrivers()
          .map(([factionMember, fare]: [number, number]) => {
            return {
              name: `${
                factionMember === -1
                  ? 'Vikash B.'
                  : GetPlayerName(factionMember)
              } ($${fare}/km)`,
              phone:
                factionMember === -1
                  ? '5555'
                  : global.exports['authentication']
                      .getPlayerInfo(factionMember, 'phone')
                      .toString(),
              service: 'taxi',
            };
          }),
      ];

      const playerPhone: Phone = {
        ...this.entities.find(
          (phone: Phone) =>
            phone.id ===
            Number(
              global.exports['authentication'].getPlayerInfo(source, 'phone')
            )
        ),
        serviceAgents: serviceAgents || [],
      };

      console.log(playerPhone);

      TriggerClientEvent(
        `${GetCurrentResourceName()}:force-showui`,
        source,
        playerPhone
      );
    });

    onNet(
      `${GetCurrentResourceName()}:request-service-call`,
      (contact: ServiceContact) => {
        if (!contact.phone) {
          // Call was made to the company directly and not to a specific taxi driver
          switch (contact.service) {
            case 'taxi': {
              break;
            }
          }
          return;
        }

        this.executeCall(source, Number(contact.phone));
      }
    );

    onNet(`${GetCurrentResourceName()}:execute-call`, (callingTo: number) => {
      this.executeCall(source, callingTo);
    });

    onNet(
      `${GetCurrentResourceName()}:answer-call`,
      (answeredToPhone: number) => {
        const currentPlayerPhone: number = Number(
          global.exports['authentication'].getPlayerInfo(source, 'phone')
        );
        this.answerCall(currentPlayerPhone, answeredToPhone);
      }
    );

    onNet(`${GetCurrentResourceName()}:refuse-call`, (toRefused: number) => {
      const currentPlayerPhone: number = Number(
        global.exports['authentication'].getPlayerInfo(source, 'phone')
      );

      if (!toRefused) {
        toRefused = Array.from(this.activeConversations.keys()).find(
          (_phoneNumber: number) =>
            this.activeConversations.get(_phoneNumber) === currentPlayerPhone
        );
      }

      if (toRefused) {
        this.refuseCall(currentPlayerPhone, toRefused);
      } else if (this.activeConversations.has(currentPlayerPhone)) {
        this.hangUp(
          currentPlayerPhone,
          this.activeConversations.get(currentPlayerPhone)
        );
      }
    });

    onNet(
      'authentication:player-authenticated',
      (playerAuthenticated: number, player: Player) => {
        let phone: number =
          !isNaN(player.phone) && player.phone > 0 ? player.phone : 0;

        if (!phone) {
          phone = 1000000 + player.id;

          global.exports['authentication'].setPlayerInfo(
            playerAuthenticated,
            'phone',
            phone,
            false
          );

          this.createEntity(
            {
              id: phone,
              contacts: [],
            },
            phone
          );
        } else {
          this.loadDBEntityFor(phone, 'id', playerAuthenticated);
        }

        this.phones.set(phone, playerAuthenticated);
      }
    );

    onNet('playerDropped', () => {
      const playerDroppedPhone: number = Array.from(this.phones.keys()).find(
        (phone: number) => this.phones[phone] === source
      );

      if (playerDroppedPhone) {
        // TODO: Debug if this actually happens
        this.phones.delete(playerDroppedPhone);
      }
    });
  }

  // First parameter: caller player ID, second parameter: callED player PHONE
  @Export()
  private executeCall(byPlayer: number, callingTo: number): void {
    const playerFound: number = this.phones.get(callingTo);
    const byPlayerPhone: number = Number(
      global.exports['authentication'].getPlayerInfo(byPlayer, 'phone')
    );

    if (playerFound) {
      const playerFoundPhone: number = Number(
        global.exports['authentication'].getPlayerInfo(playerFound, 'phone')
      );
      this.activeConversations.set(byPlayerPhone, playerFoundPhone);
      this.notifyPlayerIsBeingCalled(playerFound, byPlayerPhone);
    }
  }

  // First parameter: called player ID, second parameter: caller PHONE
  private notifyPlayerIsBeingCalled(
    player: number,
    isBeingCalledBy: number
  ): void {
    const calledPlayerPhone: number = Number(
      global.exports['authentication'].getPlayerInfo(player, 'phone')
    );
    const playerPhone: PhoneExtended = {
      ...this.entities.find((phone: Phone) => phone.id === calledPlayerPhone),
      myNumber: calledPlayerPhone,
      isBeingCalledBy,
    };

    TriggerClientEvent(
      `${GetCurrentResourceName()}:force-showui`,
      player,
      playerPhone
    );
  }

  // First parameter: called player PHONE, second parameter: callER player PHONE
  private answerCall(playerCalled: number, answeredTo: number): void {
    if (
      !(
        this.activeConversations.has(answeredTo) &&
        this.activeConversations.get(answeredTo) === playerCalled
      )
    ) {
      this.activeConversations.delete(answeredTo);
      return;
    }
    const playerCalledId: number = this.phones.get(playerCalled);
    const playerCallerId: number = this.phones.get(answeredTo);

    global.exports['pma-voice'].setPlayerCall(playerCallerId, playerCallerId);
    global.exports['pma-voice'].setPlayerCall(playerCalledId, playerCallerId);

    TriggerClientEvent(
      `${GetCurrentResourceName()}:called-picked-up`,
      playerCallerId
    );
  }

  // First parameter: called player PHONE, second paramater: callER player PHONE
  private refuseCall(playerCalled: number, refusedTo: number): void {
    this.endCall(refusedTo);

    const refusedToPlayerID: number = this.phones.get(refusedTo);
    TriggerClientEvent(
      `${GetCurrentResourceName()}:call-ended`,
      refusedToPlayerID
    );
  }

  private hangUp(callerPhone: number, calledPhone: number): void {
    this.endCall(callerPhone);

    const calledPlayerId: number = this.phones.get(calledPhone);
    TriggerClientEvent(
      `${GetCurrentResourceName()}:call-ended`,
      calledPlayerId
    );
  }

  private fetchOnlinePlayersPhones(): void {
    const authenticatedPlayers: number[] =
      global.exports['authentication'].getAuthenticatedPlayers();

    authenticatedPlayers.forEach((authenticatedPlayer: number) => {
      this.phones.set(
        Number(
          global.exports['authentication'].getPlayerInfo(
            authenticatedPlayer,
            'phone'
          )
        ),
        authenticatedPlayer
      );
    });
  }

  private endCall(callerPhone: number): void {
    if (this.activeConversations.has(callerPhone)) {
      const callerPlayerId: number = this.phones.get(callerPhone);
      const calledPlayerId: number = this.phones.get(
        this.activeConversations.get(callerPhone)
      );

      global.exports['pma-voice'].setPlayerCall(calledPlayerId, 0);
      global.exports['pma-voice'].setPlayerCall(callerPlayerId, 0);

      this.activeConversations.delete(callerPhone);
    }
  }
}
