import * as EventEmitter from 'events';
import { ClientController } from './client.controller';
import { IClientWithUIController } from './interfaces/client-ui.interface'; 

export class ClientWithUIController extends ClientController implements IClientWithUIController {
    private uiDisplay: boolean = false;
    private uiDisplayCooldownTimestamp: number = 0;

    public constructor() {
        super();

        this.addDefaultListeners();
    }

    protected onIncomingUIMessageEvent: EventEmitter = new EventEmitter();

    protected isUIShowing(): boolean {
        return this.uiDisplay;
    }

    protected isUIOnCooldown(): boolean {
        return Date.now() < this.uiDisplayCooldownTimestamp;
    }

    protected showUI(): void {
        if (!this.isUIShowing()) {
            EnterCursorMode();
            SetNuiFocus(true, true);
            SetNuiFocusKeepInput(false);
        }
        this.uiDisplay = true;
    
        this.addToTickUnique({
            id: `${GetCurrentResourceName()}_UI`,
            function: () => {
                DisableControlAction(0, 1, this.uiDisplay);
                DisableControlAction(0, 2, this.uiDisplay);
                DisableControlAction(0, 142, this.uiDisplay);
                DisableControlAction(0, 18, this.uiDisplay);
                DisableControlAction(0, 322, this.uiDisplay);
                DisableControlAction(0, 106, this.uiDisplay);
                
                if (!this.uiDisplay) {
                    this.removeFromTick(`${GetCurrentResourceName()}_UI`);
                    SetNuiFocus(false, false);
                }
            }
        });
    }
    
    protected hideUI(): void {
        this.uiDisplayCooldownTimestamp = Date.now() + (1000 * 3);
        LeaveCursorMode();
        this.uiDisplay = false;
    
        SendNuiMessage(JSON.stringify({
            type: 'dismiss'
        }));
    }

    protected addUIListener(name: string): void {
        RegisterNuiCallbackType(name);

        on(`__cfx_nui:${name}`, (data: any, callback: Function) => {
            this.onIncomingUIMessageEvent.emit(name, data);
            callback('ok');
        });

        this.onIncomingUIMessageEvent.on(name, (eventData) => { this.onIncomingUIMessage.call(this, name, eventData); });
    }

    /** Remember that you NEED to use addUIListener in order to be able to listen for events */
    protected onIncomingUIMessage(eventName: string, eventData: any): void { }

    public onForceShowUI(data: any): void {
        this.showUI();
    }

    public onForceHideUI(): void {
        this.hideUI();
    }

    private addDefaultListeners(): void {
        RegisterNuiCallbackType('dismiss');

        on(`__cfx_nui:dismiss`, (data: any, callback: Function) => {
            this.onForceHideUI();
            TriggerServerEvent(`${GetCurrentResourceName()}:on-force-hidden`);
            emit(`${GetCurrentResourceName()}:on-force-hidden`);
            callback('ok');
        });

        onNet(`${GetCurrentResourceName()}:force-showui`, (data: any) => {
            this.onForceShowUI(data);
        });
    }
}