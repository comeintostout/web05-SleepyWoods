import { changeState } from '../../util';

export class Player extends Phaser.GameObjects.Sprite {
  character: Phaser.GameObjects.Sprite | undefined;
  hair: Phaser.GameObjects.Sprite | undefined;
  dust: Phaser.GameObjects.Sprite | undefined;
  state: string = 'right';
  direction: string = 'wait';
  x: number;
  y: number;
  speed: number;
  heldDirection: string[];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'character');
    this.direction = 'right';
    this.state = 'wait';
    this.x = -25;
    this.y = 400;
    this.speed = 1;
    this.heldDirection = [];

    this.character = this.scene.add.sprite(this.x, this.y, 'character-wait');
    this.character.setScale(3);

    this.hair = this.scene.add.sprite(this.x, this.y, 'hair-wait');
    this.hair.setScale(3);

    this.dust = this.scene.add.sprite(this.x - 20, this.y + 5, 'dust');
    this.dust.setScale(3);

    changeState(this);
  }
}
