import { Phone, PhoneContact, ServiceContact } from '../../shared/phone.model';
import { ClientWithUIController } from '../../../../[utils]/client/client-ui.controller';
import { toThousandsString } from '../../../../[utils]/utils';

export class Client extends ClientWithUIController {
    public constructor() {
        super();

        this.addUIListener('add-contact');
        this.addUIListener('request-service-call');
        this.addUIListener('dialogbuttonclick');
        this.registerListeners();
        this.registerKeyBindings();
    }

    public onForceHideUI(): void {
        super.onForceHideUI();
    }

    public onForceShowUI(data: Phone): void {
        super.onForceShowUI(data);

        this.showPhoneUI(data);
    }

    protected onIncomingUIMessage(eventName: string, eventData: any): void {
        super.onIncomingUIMessage(eventName, eventData);

        if (eventName === 'add-contact') {
            TriggerServerEvent(`${GetCurrentResourceName()}:add-contact`, <PhoneContact> eventData);
        }

        if (eventName === 'request-service-call') {
            const serviceContact: ServiceContact = <ServiceContact> eventData;

            if (IsWaypointActive()) {
                TriggerServerEvent(`${GetCurrentResourceName()}:request-service-call`, serviceContact);
            } else {
                this.showDialog(
                    {
                        message: 'You need to have set a waypoint on the map before calling for a taxi!',
                        buttons: [
                            {
                                title: 'Ok'
                            }
                        ]
                    }
                );
            }
        }

        if (eventName === 'dialogbuttonclick') {
            
        }
    }

    private showPhoneUI(data: Phone): void {
        SendNuiMessage(JSON.stringify({
            type: 'update',
            resource: GetCurrentResourceName(),
            apps: [
                {
                    icon: 'call',
                    text: 'Dial',
                    page: 'call'
                },
                {
                    icon: 'contact_page',
                    text: 'Contacts',
                    page: 'contacts'
                },
                {
                    icon: 'email',
                    text: 'Messages',
                    page: 'messages'
                },
                {
                    icon: 'support',
                    text: 'Services',
                    page: 'services'
                }
            ],
            homescreenWidgets: [
                {
                    title: 'Bank',
                    value: `$${toThousandsString(Number(this.getPlayerInfo('bank')), 1)}`
                },
                {
                    title: 'Days',
                    value: Number(this.getPlayerInfo('hoursPlayed')).toFixed(1)
                }
            ],
            contacts: data.contacts.map((contact: PhoneContact) => ({ ...contact, phone: contact.phone.toString() })),
            serviceAgents: data.serviceAgents
        }));
    }

    private registerListeners(): void {
        onNet(`${GetCurrentResourceName()}:show-dialog`, (data: any) => {
            this.showDialog(data);
        });

        onNet(`${GetCurrentResourceName()}:execute-call`, (data: ServiceContact) => {
            SendNuiMessage(JSON.stringify({
                type: 'execute-call',
                contact: data
            }));
        });
    }

    private showDialog(data: any): void {
        SendNuiMessage(JSON.stringify({
            type: 'opendialog',
            dialogdata: JSON.stringify(data)
        }));
    }

    private registerKeyBindings(): void {
        RegisterCommand('+phoneopen', () => {
            TriggerServerEvent(`${GetCurrentResourceName()}:request-use-phone`);
        }, false);

        RegisterKeyMapping('+phoneopen', 'Use phone', 'keyboard', 'l');

        RegisterCommand('phone', () => {
            TriggerServerEvent(`${GetCurrentResourceName()}:request-use-phone`);
        }, false);

    }
}