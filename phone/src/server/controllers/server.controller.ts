import { ServerDBDependentController } from '../../../../[utils]/server/server-db-dependent.controller';
import { Phone, PhoneContact, ServiceContact } from '../../shared/phone.model';

export class Server extends ServerDBDependentController<Phone> {
    private phones: Map<number, number> = new Map<number, number>();

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
            // global.exports['pma-voice'].setPlayerCall(4, 3);
            // global.exports['pma-voice'].setPlayerCall(source, 3);
            if (!contact.phone) { // Call was made to the company directly and not to a specific taxi driver
                switch (contact.service) {
                    case 'taxi': {
                        break;
                    }
                }
                return;
            }

            this.executeCall(contact);
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

    private executeCall(contact: PhoneContact): void {
        const playerFound: number = this.phones[contact.phone];

        if (playerFound) {
            TriggerClientEvent(`${GetCurrentResourceName()}:execute-call`, source, contact);
        }
    }
}