import { PhoneContact, PhoneExtended, ServiceContact } from '../../shared/phone.model';
import { ClientWithUIController } from '../../../../[utils]/client/client-ui.controller';
import { toThousandsString } from '../../../../[utils]/utils';

export class Client extends ClientWithUIController {
    public constructor() {
        super();

        this.addUIListener('add-contact');
        this.addUIListener('request-service-call');
        this.addUIListener('dialogbuttonclick');
        this.addUIListener('execute-call');
        this.addUIListener('refuse-call');
        this.addUIListener('answer-call');
        this.registerListeners();
        this.registerKeyBindings();
    }

    public onForceHideUI(): void {
        super.onForceHideUI();
    }

    public onForceShowUI(data: PhoneExtended): void {
        const wasPreviouslyUsingPhone: boolean = this.isUIShowing();
        super.onForceShowUI(data);

        this.showPhoneUI(data, wasPreviouslyUsingPhone);
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

        if (eventName === 'execute-call') {
            console.log('received execute-call event. attempting to make a call..');
            console.log('event data: ', eventData);
            TriggerServerEvent(`${GetCurrentResourceName()}:execute-call`, Number(eventData.callingTo));
        }

        if (eventName === 'answer-call') {
            console.log('received answer-call event. attempting to answer the call..');
            console.log('event data: ', eventData);
            TriggerServerEvent(`${GetCurrentResourceName()}:answer-call`, Number(eventData.answeredToCaller));
        }

        if (eventName === 'refuse-call') {
            console.log('received refuse-call event. attempting to refuse a call..');
            console.log('event data: ', eventData);
            TriggerServerEvent(`${GetCurrentResourceName()}:refuse-call`, Number(eventData.refusedCaller));
        }
    }

    private showPhoneUI(data: PhoneExtended, wasPreviouslyUsingPhone: boolean): void {
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
            myNumber: data.myNumber,
            isBeingCalledBy: data.isBeingCalledBy,
            serviceAgents: data.serviceAgents,
            shouldStartClosed: !wasPreviouslyUsingPhone && data.isBeingCalledBy != null,
        }));
    }

    private registerListeners(): void {
        onNet(`${GetCurrentResourceName()}:show-dialog`, (data: any) => {
            this.showDialog(data);
        });

        onNet(`${GetCurrentResourceName()}:execute-call`, (callingTo: number) => {
            /*SendNuiMessage(JSON.stringify({
                type: 'execute-call',
                contact: data
            }));*/
        });

        onNet(`${GetCurrentResourceName()}:being-called`, (calledBy: number) => {
            
        });

        onNet(`${GetCurrentResourceName()}:called-picked-up`, () => {
            SendNuiMessage(JSON.stringify({
                type: 'conversation-started',
                data: JSON.stringify({})
            }));
        });

        onNet(`${GetCurrentResourceName()}:called-refused-call`, () => {
            SendNuiMessage(JSON.stringify({
                type: 'conversation-ended',
                data: JSON.stringify({})
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