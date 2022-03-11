import { ServerDBDependentController } from '../../../../[utils]/server/server-db-dependent.controller';
import { Phone, PhoneContact, PhoneExtended, ServiceContact } from '../../shared/phone.model';

export class Server extends ServerDBDependentController<Phone> {
    private phones: Map<number, number> = new Map<number, number>();
    private activeConversations: Map<number, number> = new Map<number, number>();

    public constructor(dbTableName: string) {
        super(dbTableName);

        this.registerListeners();
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

        onNet(`${GetCurrentResourceName()}:answer-call`, (answeredTo: number) => {
            const currentPlayerPhone: number = Number(global.exports['authentication'].getPlayerInfo(source, 'phone'));
            this.answerCall(currentPlayerPhone, answeredTo);
        });

        onNet(`${GetCurrentResourceName()}:refuse-call`, (toRefused: number) => {
            console.log('toRefused:', toRefused);
            const currentPlayerPhone: number = Number(global.exports['authentication'].getPlayerInfo(source, 'phone'));
            this.refuseCall(currentPlayerPhone, toRefused);
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
            // TriggerClientEvent(`${GetCurrentResourceName()}:execute-call`, byPlayer, callingTo);
            // TriggerClientEvent(`${GetCurrentResourceName()}:being-called`, playerFound, callingTo);
            this.activeConversations.set(byPlayerPhone, playerFound);
            this.notifyPlayerIsBeingCalled(playerFound, byPlayer);
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
            this.activeConversations.delete(answeredTo);
            return;
        }
        console.log('(server.ts:) assigning', GetPlayerName(playerCalled), 'and', GetPlayerName(answeredTo), 'into a call..');

        global.exports['pma-voice'].setPlayerCall(answeredTo, answeredTo);
        global.exports['pma-voice'].setPlayerCall(playerCalled, answeredTo);

        const answeredToPlayerID: number = this.phones.get(answeredTo);
        TriggerClientEvent(`${GetCurrentResourceName()}:called-picked-up`, answeredToPlayerID);
    }

    // First parameter: called player PHONE, second paramater: callER player PHONE
    private refuseCall(playerCalled: number, refusedTo: number): void {
        console.log('(server.ts:) clearing', GetPlayerName(playerCalled), 'and', GetPlayerName(refusedTo), 'conversation..');

        if (this.activeConversations.has(refusedTo)) {
            this.activeConversations.delete(refusedTo);
        }

        const refusedToPlayerID: number = this.phones.get(refusedTo);
        TriggerClientEvent(`${GetCurrentResourceName()}:called-refused-call`, refusedToPlayerID);
    }
}