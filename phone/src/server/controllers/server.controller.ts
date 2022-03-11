import { ServerDBDependentController } from '../../../../[utils]/server/server-db-dependent.controller';
import { Phone, PhoneContact, PhoneExtended, ServiceContact } from '../../shared/phone.model';

export class Server extends ServerDBDependentController<Phone> {
    private phones: Map<number, number> = new Map<number, number>();
    private activeConversations: Map<number, number> = new Map<number, number>();

    public constructor(dbTableName: string) {
        super(dbTableName);

        this.registerListeners();
        this.fetchOnlinePlayersPhones();
    }

    private registerListeners(): void {
        onNet(`${GetCurrentResourceName()}:add-contact`, (data: PhoneContact) => {
            const playerPhone: Phone = this.entities.find((phone: Phone) => phone.id === Number(global.exports['authentication'].getPlayerInfo(source, 'phone')));

            if (playerPhone) {
                playerPhone.contacts.push(data);
                this.saveDBEntityAsync(playerPhone.id);
            }
        });

        onNet(`${GetCurrentResourceName()}:request-use-phone`, () => {
            const serviceAgents: ServiceContact[] = [
                ...(global.exports['factions'].getOnlineFactionMembers('taxi').map((factionMember) => ({
                    name: GetPlayerName(factionMember.onlineId),
                    phone: global.exports['authentication'].getPlayerInfo(factionMember.onlineId, 'phone').toString(),
                    service: 'taxi'
                })))
            ];

            const playerPhone: Phone = {
                ...this.entities.find((phone: Phone) => phone.id === Number(global.exports['authentication'].getPlayerInfo(source, 'phone'))),
                serviceAgents
            };

            TriggerClientEvent(`${GetCurrentResourceName()}:force-showui`, source, playerPhone);
        });

        onNet(`${GetCurrentResourceName()}:request-service-call`, (contact: ServiceContact) => {
            if (!contact.phone) { // Call was made to the company directly and not to a specific taxi driver
                switch (contact.service) {
                    case 'taxi': {
                        break;
                    }
                }
                return;
            }

            this.executeCall(source, Number(contact.phone));
        });

        onNet(`${GetCurrentResourceName()}:execute-call`, (callingTo: number) => {
            console.log('attempting to start a call on server.ts. source:', source, 'callingTo:', callingTo);
            this.executeCall(source, callingTo);
        });

        onNet(`${GetCurrentResourceName()}:answer-call`, (answeredToPhone: number) => {
            const currentPlayerPhone: number = Number(global.exports['authentication'].getPlayerInfo(source, 'phone'));
            this.answerCall(currentPlayerPhone, answeredToPhone);
        });

        onNet(`${GetCurrentResourceName()}:refuse-call`, (toRefused: number) => {
            const currentPlayerPhone: number = Number(global.exports['authentication'].getPlayerInfo(source, 'phone'));
            
            if (!toRefused) {
                console.log('activeConversations:', Array.from(this.activeConversations.keys()), 'values:', Array.from(this.activeConversations.values()));
                toRefused =
                    Array.from(this.activeConversations.keys()).find((_phoneNumber: number) => this.activeConversations.get(_phoneNumber) === currentPlayerPhone);
            }

            if (toRefused) {
                this.refuseCall(currentPlayerPhone, toRefused);
            } else if (this.activeConversations.has(currentPlayerPhone)) {
                console.log('calling this.hangUp (hanging up my own call..)');
                this.hangUp(currentPlayerPhone, this.activeConversations.get(currentPlayerPhone));
            }
        });

        onNet('authentication:player-authenticated', (playerAuthenticated: number, player: any) => {
            this.phones.set(player.phone, playerAuthenticated);
        });

        onNet('playerDropped', () => {
            const playerDroppedPhone: number = Array.from(this.phones.keys()).find((phone: number) => this.phones[phone] === source);

            if (playerDroppedPhone) {
                // TODO: Debug if this actually happens
                this.phones.delete(playerDroppedPhone);
            }
        });
    }

    // First parameter: caller player ID, second parameter: callED player PHONE
    private executeCall(byPlayer: number, callingTo: number): void {
        console.log('(server.ts:) finding a player with that phone number (' + callingTo + ')');
        console.log('(server.ts:) typeof callingTo: ', typeof(callingTo));
        const playerFound: number = this.phones.get(callingTo);
        const byPlayerPhone: number = Number(global.exports['authentication'].getPlayerInfo(byPlayer, 'phone'));

        if (playerFound) {
            console.log('(server.ts:) found a player with that phone number');
            const playerFoundPhone: number = Number(global.exports['authentication'].getPlayerInfo(playerFound, 'phone'));
            this.activeConversations.set(byPlayerPhone, playerFoundPhone);
            this.notifyPlayerIsBeingCalled(playerFound, byPlayerPhone);
        } else {
            console.log('(server.ts:) found no player with that phone number');
            console.log('(server.ts:) current phones: ', Array.from(this.phones.keys()), Array.from(this.phones.values()));
        }
    }

    // First parameter: called player ID, second parameter: caller PHONE
    private notifyPlayerIsBeingCalled(player: number, isBeingCalledBy: number): void {
        const calledPlayerPhone: number = Number(global.exports['authentication'].getPlayerInfo(player, 'phone'));
        const playerPhone: PhoneExtended = {
            ...this.entities.find((phone: Phone) => phone.id === calledPlayerPhone),
            myNumber: calledPlayerPhone,
            isBeingCalledBy
        };

        TriggerClientEvent(`${GetCurrentResourceName()}:force-showui`, player, playerPhone);
    }

    // First parameter: called player PHONE, second parameter: callER player PHONE
    private answerCall(playerCalled: number, answeredTo: number): void {
        if (!(this.activeConversations.has(answeredTo) && this.activeConversations.get(answeredTo) === playerCalled)) {
            console.log('(server.ts:) removing active conversation because of issue..');
            console.log(this.activeConversations);
            console.log('answeredTo:', answeredTo, 'playerCalled:', playerCalled);
            this.activeConversations.delete(answeredTo);
            return;
        }
        const playerCalledId: number = this.phones.get(playerCalled);
        const playerCallerId: number = this.phones.get(answeredTo);
        console.log('(server.ts:) assigning', GetPlayerName(playerCalledId), 'and', GetPlayerName(playerCallerId), 'into a call..');

        global.exports['pma-voice'].setPlayerCall(playerCallerId, playerCallerId);
        global.exports['pma-voice'].setPlayerCall(playerCalledId, playerCallerId);

        TriggerClientEvent(`${GetCurrentResourceName()}:called-picked-up`, playerCallerId);
    }

    // First parameter: called player PHONE, second paramater: callER player PHONE
    private refuseCall(playerCalled: number, refusedTo: number): void {
        this.endCall(refusedTo);

        console.log('a call has been refused or hanged up on!');
        console.log('playerCalled:', playerCalled, 'refusedTo:', refusedTo);
        const refusedToPlayerID: number = this.phones.get(refusedTo);
        TriggerClientEvent(`${GetCurrentResourceName()}:call-ended`, refusedToPlayerID);
    }

    private hangUp(callerPhone: number, calledPhone: number): void {
        this.endCall(callerPhone);

        const calledPlayerId: number = this.phones.get(calledPhone);
        TriggerClientEvent(`${GetCurrentResourceName()}:call-ended`, calledPlayerId);
    }

    private fetchOnlinePlayersPhones(): void {
        const authenticatedPlayers: number[] = global.exports['authentication'].getAuthenticatedPlayers();

        authenticatedPlayers.forEach((authenticatedPlayer: number) => {
            this.phones.set(
                Number(global.exports['authentication'].getPlayerInfo(authenticatedPlayer, 'phone')),
                authenticatedPlayer
            );
        });

        console.log('currently authenticated players phones:', this.phones);
    }

    private endCall(callerPhone: number): void {
        if (this.activeConversations.has(callerPhone)) {
            const callerPlayerId: number = this.phones.get(callerPhone);
            const calledPlayerId: number = this.phones.get(this.activeConversations.get(callerPhone));

            global.exports['pma-voice'].setPlayerCall(calledPlayerId, 0);
            global.exports['pma-voice'].setPlayerCall(callerPlayerId, 0);

            this.activeConversations.delete(callerPhone);
        }
    }
}