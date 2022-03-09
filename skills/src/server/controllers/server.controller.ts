import { ServerController } from '../../../../[utils]/server/server.controller';
import { Skill } from '../../shared/models/skill.model';

export class Server extends ServerController {
    public constructor(){
        super();
        this.assignExports();
        this.registerCommands();
    }

    private registerCommands(){
        RegisterCommand('skills', () => {
            let playerSkills: Skill[] = this.getPlayerSkills(source);
            global.exports['chat'].addMessage(source, '------------------Skills List------------------')
            for (const skill of playerSkills){
                global.exports['chat'].addMessage(source, skill.name + ': ' + skill.value);
            }
            // playerSkills.forEach((skill: Skill) => {
            //     global.exports['chat'].addMessage(source, skill.name + ': ' + skill.value);
            // })
        }, false);
    }

    private updatePlayerSkill(playerId: number, skill: string, value: number): void{
        const updatedPlayerSkills: Skill[] = this.getPlayerSkills(playerId).map((_skill: Skill) => _skill.name === skill ? { ..._skill, value } : { ..._skill, value: _skill.value })
        global.exports['authentication'].setPlayerInfo(playerId, 'skills', updatedPlayerSkills, false)
    }

    public getPlayerSkills(playerId: number): Skill[] {
        const playerSkills: Skill[] = global.exports['authentication'].getPlayerInfo(playerId, 'skills');

        return playerSkills;
    }

    public getPlayerSkill(playerId: number, skill:string): Skill {
        const playerSkills: Skill[] = this.getPlayerSkills(playerId);

        return playerSkills.find((_entity: Skill) => _entity.name === skill)
    }

    public incrementPlayerSkill(playerId: number, skill: string, value: number): void {
        const playerSkill: Skill = this.getPlayerSkill(playerId, skill);

        this.updatePlayerSkill(playerId, skill, Math.max(100, value + playerSkill.value));
    }

    public decrementPlayerSkill(playerId: number, skill:string, value: number): void {
        const playerSkill: Skill = this.getPlayerSkill(playerId, skill);

        this.updatePlayerSkill(playerId, skill, Math.max(0, value - playerSkill.value));
    }

    private assignExports(): void {
        exports('getPlayerSkills', this.getPlayerSkills.bind(this));
        exports('getPlayerSkill', this.getPlayerSkill.bind(this));
        exports('incrementPlayerSkill', this.incrementPlayerSkill.bind(this));
        exports('decrementPlayerSkill', this.decrementPlayerSkill.bind(this));
    }
}