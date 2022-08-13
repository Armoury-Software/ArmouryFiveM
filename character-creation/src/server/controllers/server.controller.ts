import {
  Command,
  EventListener,
  Export,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { ServerController } from '@core/server/server.controller';
import { Character, CharacterUpdate } from '@shared/character.interface';
import {
  UPPER_ITEMS_WITH_ACCESSORIES,
  UPPER_ITEMS_WITH_HANDS,
  UPPER_ITEMS_WITH_UPPER_UNDER_ITEMS,
} from '../clothing.pairs';
import {
  ACCESSORIES_TEXTURE_IDS,
  LEGS_TEXTURE_IDS,
  MASKS_TEXTURE_IDS,
  SHOES_TEXTURE_IDS,
  UNDERSHIRTS_TEXTURE_IDS,
  UPPER_ITEMS_TEXTURE_IDS,
} from '../clothings.textures';
import { Clothing } from '../../../../inventory/src/shared/models/clothing.model';

var fs = require('fs');

@FiveMController()
export class Server extends ServerController {
  // TODO: Delete key from this map when the player cancels or successfully creates character as well
  private playersUpdatingCharacters: Map<number, Character> = new Map();
  private playersWithClothes: Map<number, Clothing> = new Map();

  @EventListener()
  public onAccountAuthenticate(source: number, players: any[]) {
    this.showCharacterSelection(
      source,
      players.map((player: any) => ({
        id: player.id,
        name: player.name,
        age: 1, // TODO: Replace this with actual data
        days: Number(player.hoursPlayed),
        faction: 'LSPD', // TODO: Replace this with actual data
      }))
    );
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:character-selected`,
  })
  public onPlayerSelectCharacter(character: Character): void {
    const playerId: number = source;
    if (!(Number(character.age) > 0 && Number(character.days) > 0)) {
      this.showCharacterCreation(playerId);
    } else {
      if (this.playersUpdatingCharacters.has(playerId)) {
        this.playersUpdatingCharacters.delete(playerId);
      }
    }
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:character-updated`,
  })
  public onPlayerUpdateCharacter(character: CharacterUpdate): void {
    if (this.playersUpdatingCharacters.has(source)) {
      const existingCharacter: Character =
        this.playersUpdatingCharacters.get(source);
      const playerPed: number = GetPlayerPed(source);

      if (character.face) {
        SetPedHeadBlendData(
          playerPed,
          character.face?.componentId,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          false
        );

        if (
          existingCharacter.face?.componentId !== character.face?.componentId ||
          existingCharacter.face?.sex !== character.face?.sex
        ) {
          TriggerClientEvent(
            `${GetCurrentResourceName()}:change-camera`,
            source,
            'face'
          );
          SetPedComponentVariation(
            playerPed,
            0,
            character.face.componentId,
            0,
            0
          );
        }
      }

      if (character.faceFeatures?.length) {
        for (let i = 0; i < character.faceFeatures?.length; i++) {
          if (
            !existingCharacter.faceFeatures ||
            existingCharacter.faceFeatures[i] !== character.faceFeatures[i]
          ) {
            SetPedFaceFeature(playerPed, i, Number(character.faceFeatures[i]));
          }
        }
      }

      if (character.componentVariations?.length) {
        for (let i = 0; i < character.componentVariations?.length; i++) {
          if (
            !existingCharacter.componentVariations ||
            existingCharacter.componentVariations[i] !==
              character.componentVariations[i]
          ) {
            this.setCorrectedComponentVariation(
              source,
              playerPed,
              i,
              Number(character.componentVariations[i][0]),
              Number(character.componentVariations[i][1]),
              Number(character.componentVariations[i][2]),
              character
            );

            this.updatePlayerClothingPairs(source, character);
          }
        }
      }

      if (character.headOverlays?.length) {
        for (let i = 0; i < character.headOverlays?.length; i++) {
          if (
            !existingCharacter.headOverlays ||
            existingCharacter.headOverlays[i] !== character.headOverlays[i]
          ) {
            SetPedHeadOverlay(
              playerPed,
              i,
              Number(character.headOverlays[i][0]),
              Number(character.headOverlays[i][2])
            );

            let colorType: number;
            switch (i) {
              case 0:
              case 1:
              case 2: {
                colorType = 1;
                break;
              }
              case 5:
              case 8: {
                colorType = 2;
              }
              default: {
                colorType = 0;
                break;
              }
            }

            SetPedHeadOverlayColor(
              playerPed,
              i,
              colorType,
              Number(character.headOverlays[i][1]),
              0
            );
          }
        }
      }

      if (character.latestCustomization) {
        TriggerClientEvent(
          `${GetCurrentResourceName()}:change-camera`,
          source,
          this.getSuitableCamera(
            character.latestCustomization[0],
            character.latestCustomization[1]
          )
        );
      }
    }

    if (
      character.shouldFinalize &&
      this.playersUpdatingCharacters.has(source)
    ) {
      this.playersUpdatingCharacters.delete(source);

      emit(`${GetCurrentResourceName()}:character-created`, character, source);
      return;
    }

    this.playersUpdatingCharacters.set(source, character);
  }

  @EventListener()
  public onPlayerAuthenticate(source: number, playerData: any) {
    TriggerClientEvent(`${GetCurrentResourceName()}:force-hideui`, source);
    this.updatePlayerClothingComponents(source, JSON.parse(playerData.outfit));
  }

  @EventListener()
  public onPlayerDisconnect() {
    super.onPlayerDisconnect();

    if (this.playersUpdatingCharacters.has(source)) {
      this.playersUpdatingCharacters.delete(source);
    }

    if (this.playersWithClothes.has(source)) {
      this.playersWithClothes.delete(source);
    }
  }

  @Export()
  public showCharacterSelection(
    playerId: number,
    characters?: Character[],
    uppershirts?: number[],
    undershirts?: number[],
    accessories?: number[]
  ) {
    TriggerClientEvent(`${GetCurrentResourceName()}:force-showui`, playerId, {
      characters,
      uppershirts,
      undershirts,
      accessories,
      menuResource: GetCurrentResourceName(),
    });

    SetEntityCoords(
      GetPlayerPed(playerId),
      -1575.3323974609376,
      -3007.513916015625,
      -79.00585174560547,
      true,
      false,
      false,
      false
    );
    SetEntityHeading(GetPlayerPed(playerId), 88.54656219482422);
  }

  @Export()
  public showCharacterCreation(playerId: number) {
    this.showCharacterSelection(
      playerId,
      null,
      Object.keys(UPPER_ITEMS_WITH_HANDS).map((key: string) => Number(key)),
      this.getSuitableUndershirtsForUppershirt(
        Number(Object.keys(UPPER_ITEMS_WITH_HANDS)[0])
      ),
      this.getSuitableAccessoriesForUppershirt(
        Number(Object.keys(UPPER_ITEMS_WITH_HANDS)[0])
      )
    );

    this.playersUpdatingCharacters.set(playerId, { name: '', days: 0, age: 0 });
  }

  @Export()
  public getPlayerClothingComponents(playerId: number): Clothing {
    if (this.playersWithClothes.has(playerId)) {
      return this.playersWithClothes.get(playerId);
    }

    return {
      components: {
        clothingId: 'clothing_0_4_1_0_0',
        0: {
          drawableId: 0,
          textureId: 0,
          paletteId: 2,
        },
        4: {
          drawableId: 4,
          textureId: 2,
          paletteId: 0,
        },
        6: {
          drawableId: 1,
          textureId: 0,
          paletteId: 2,
        },
        8: {
          drawableId: 0,
          textureId: 0,
          paletteId: 0,
        },
        11: {
          drawableId: 0,
          textureId: 8,
          paletteId: 0,
        },
      },
      title: 'clothing_0_4_1_0_0',
    };
  }

  @Export()
  public updatePlayerClothingComponents(
    playerId: number,
    outfit: Clothing,
    ignoreSQLCommand = true
  ): void {
    Object.keys(outfit.components).forEach((_componentId) => {
      const componentId = Number(_componentId);
      if (componentId > 0) {
        SetPedComponentVariation(
          GetPlayerPed(playerId),
          componentId,
          outfit.components[componentId].drawableId,
          outfit.components[componentId].textureId,
          outfit.components[componentId].paletteId || 0
        );
      }
    });

    this.playersWithClothes.set(playerId, outfit);

    if (!ignoreSQLCommand) {
      global.exports['authentication'].setPlayerInfo(
        playerId,
        'outfit',
        outfit,
        false
      );
    }
  }

  private updatePlayerClothingPairs(
    playerId: number,
    character: Character
  ): void {
    TriggerClientEvent(
      `${GetCurrentResourceName()}:update-clothing-pairs`,
      playerId,
      {
        uppershirts: {
          ...Object.keys(UPPER_ITEMS_WITH_HANDS).map((key: string) =>
            Number(key)
          ),
        },
        undershirts: this.getSuitableUndershirtsForUppershirt(
          Number(character.componentVariations[11][0])
        ),
        accessories: this.getSuitableAccessoriesForUppershirt(
          Number(character.componentVariations[11][0])
        ), // Here should be INTERSECTION between getSuitableAccessoriesForUppershirt and getSuitableAccessoriesForUndershirt
        uppershirtsTextureIds:
          UPPER_ITEMS_TEXTURE_IDS[Number(character.componentVariations[11][0])]
            .length,
        undershirtsTextureIds:
          UNDERSHIRTS_TEXTURE_IDS[Number(character.componentVariations[8][0])]
            .length,
        accessoriesTextureIds:
          ACCESSORIES_TEXTURE_IDS[Number(character.componentVariations[7][0])]
            .length,
        legsTextureIds:
          LEGS_TEXTURE_IDS[Number(character.componentVariations[4][0])].length,
        shoesTextureIds:
          SHOES_TEXTURE_IDS[Number(character.componentVariations[6][0])].length,
        masksTextureIds:
          MASKS_TEXTURE_IDS[Number(character.componentVariations[1][0])].length,
      }
    );
  }

  private setCorrectedComponentVariation(
    playerId: number,
    playerPed: number,
    componentId: number,
    _drawableId: number,
    _textureId: number,
    _extraId: number,
    character: CharacterUpdate
  ): void {
    let drawableId: number = _drawableId;
    let textureId: number = _textureId;
    let extraId: number = _extraId;

    // prettier-ignore
    const currentUppershirt = componentId === 11 ? _drawableId : character.componentVariations[11][0];
    // prettier-ignore
    const currentHands = componentId === 3 ? _drawableId : character.componentVariations[8][0];
    // prettier-ignore
    const currentUndershirt = componentId === 8 ? _drawableId : character.componentVariations[8][0];
    // prettier-ignore
    const currentAccessory = componentId === 7 ? _drawableId : character.componentVariations[7][0];

    const correctedItems: number[] = [];

    if (
      !this.isUppershirtCompatibleWithHands(currentUppershirt, currentHands)
    ) {
      SetPedComponentVariation(
        playerPed,
        3,
        Number(UPPER_ITEMS_WITH_HANDS[currentUppershirt][0]),
        0,
        0
      );
      correctedItems.push(3);
    }

    if (
      !this.isUppershirtCompatibleWithAccessory(
        currentUppershirt,
        currentAccessory
      )
    ) {
      SetPedComponentVariation(
        playerPed,
        7,
        Number(UPPER_ITEMS_WITH_ACCESSORIES[currentUppershirt][0]),
        0,
        0
      );
      correctedItems.push(7);
    }

    if (
      !this.isUppershirtCompatibleWithUndershirt(
        currentUppershirt,
        currentUndershirt
      )
    ) {
      SetPedComponentVariation(
        playerPed,
        8,
        Number(UPPER_ITEMS_WITH_UPPER_UNDER_ITEMS[currentUppershirt][0]),
        0,
        0
      );
      correctedItems.push(8);
    }

    if (!correctedItems.includes(componentId)) {
      SetPedComponentVariation(
        playerPed,
        componentId,
        drawableId,
        textureId,
        extraId
      );
    }
  }

  private isUppershirtCompatibleWithHands(
    uppershirt: number,
    hands: number
  ): boolean {
    return UPPER_ITEMS_WITH_HANDS[uppershirt].includes(hands);
  }

  private isUppershirtCompatibleWithAccessory(
    uppershirt: number,
    accessory: number
  ): boolean {
    return UPPER_ITEMS_WITH_ACCESSORIES[uppershirt].includes(accessory);
  }

  private isUppershirtCompatibleWithUndershirt(
    uppershirt: number,
    undershirt: number
  ): boolean {
    return UPPER_ITEMS_WITH_UPPER_UNDER_ITEMS[uppershirt].includes(undershirt);
  }

  private getSuitableUndershirtsForUppershirt(uppershirt: number): number[] {
    return UPPER_ITEMS_WITH_UPPER_UNDER_ITEMS[uppershirt];
  }

  private getSuitableAccessoriesForUppershirt(uppershirt: number): number[] {
    return UPPER_ITEMS_WITH_ACCESSORIES[uppershirt];
  }

  private getSuitableCamera(
    componentGroup: number,
    componentId: number
  ): string {
    switch (componentGroup) {
      case 0: {
        switch (componentId) {
          case 2:
          case 3:
          case 4:
          case 5:
          case 7:
          case 16: {
            return 'face_side';
          }
          default: {
            return 'face';
          }
        }
      }
      case 1: {
        switch (componentId) {
          default: {
            return 'face';
          }
        }
      }
      case 2: {
        switch (componentId) {
          case 3:
          case 4:
          case 5:
          case 6:
          case 7:
          case 8:
          case 9:
          case 10:
          case 11: {
            return 'body';
          }
          default: {
            return 'face';
          }
        }
      }
    }

    return 'body';
  }

  private get clothingComponents(): number[] {
    return [3, 4, 5, 6, 7, 8, 9, 10, 11];
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:texture-variation-limits`,
  })
  public onTextureVariationLimitsReceivedForUppershirts(
    uppershirts_textureIds: { [key: number]: number[] },
    accessories_textureIds: { [key: number]: number[] },
    undershirts_textureIds: { [key: number]: number[] },
    shoes_textureIds: { [key: number]: number[] },
    legs_textureIds: { [key: number]: number[] },
    masks_textureIds: { [key: number]: number[] },
    hairs_textureIds: { [key: number]: number[] }
  ): void {
    try {
      let content = 'const UPPER_ITEMS_TEXTURE_IDS = {\r\n';
      Object.keys(uppershirts_textureIds).forEach((key) => {
        const id = Number(key);
        content += `    ${id}: [${uppershirts_textureIds[key].join(
          ', '
        )}],\r\n`;
      });
      content += '};';

      fs.writeFile('uppershirts_textureIds.txt', content, function (err) {
        if (err) throw err;
        console.log('Saved!');
      });

      content = 'const ACCESSORIES_TEXTURE_IDS = {\r\n';
      Object.keys(accessories_textureIds).forEach((key) => {
        const id = Number(key);
        content += `    ${id}: [${accessories_textureIds[key].join(
          ', '
        )}],\r\n`;
      });
      content += '};';

      fs.writeFile('accessories_textureIds.txt', content, function (err) {
        if (err) throw err;
        console.log('Saved!');
      });

      content = 'const UNDERSHIRTS_TEXTURE_IDS = {\r\n';
      Object.keys(undershirts_textureIds).forEach((key) => {
        const id = Number(key);
        content += `    ${id}: [${undershirts_textureIds[key].join(
          ', '
        )}],\r\n`;
      });
      content += '};';

      fs.writeFile('undershirts_textureIds.txt', content, function (err) {
        if (err) throw err;
        console.log('Saved!');
      });

      content = 'const SHOES_TEXTURE_IDS = {\r\n';
      Object.keys(shoes_textureIds).forEach((key) => {
        const id = Number(key);
        content += `    ${id}: [${shoes_textureIds[key].join(', ')}],\r\n`;
      });
      content += '};';

      fs.writeFile('shoes_textureIds.txt', content, function (err) {
        if (err) throw err;
        console.log('Saved!');
      });

      content = 'const LEGS_TEXTURE_IDS = {\r\n';
      Object.keys(legs_textureIds).forEach((key) => {
        const id = Number(key);
        content += `    ${id}: [${legs_textureIds[key].join(', ')}],\r\n`;
      });
      content += '};';

      fs.writeFile('legs_textureIds.txt', content, function (err) {
        if (err) throw err;
        console.log('Saved!');
      });

      content = 'const MASKS_TEXTURE_IDS = {\r\n';
      Object.keys(masks_textureIds).forEach((key) => {
        const id = Number(key);
        content += `    ${id}: [${masks_textureIds[key].join(', ')}],\r\n`;
      });
      content += '};';

      fs.writeFile('masks_textureIds.txt', content, function (err) {
        if (err) throw err;
        console.log('Saved!');
      });

      content = 'const HAIRS_TEXTURE_IDS = {\r\n';
      Object.keys(hairs_textureIds).forEach((key) => {
        const id = Number(key);
        content += `    ${id}: [${hairs_textureIds[key].join(', ')}],\r\n`;
      });
      content += '};';

      fs.writeFile('hairs_textureIds.txt', content, function (err) {
        if (err) throw err;
        console.log('Saved!');
      });
    } catch (error) {
      console.error('Received error', error);
    }
  }
}
