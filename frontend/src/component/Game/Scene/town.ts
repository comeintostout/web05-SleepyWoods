import { Socket } from 'socket.io-client';
import { MyPlayer } from '../Phaser/Player/myPlayer';
import { OtherPlayer } from '../Phaser/Player/otherPlayer';
import { emitter, hairInfo, spriteInfo } from '../util';
import { gameInitType, userType } from '../../../types/types';

export default class Town extends Phaser.Scene {
  myPlayer?: MyPlayer;
  otherPlayer: { [key: string]: OtherPlayer };
  socket?: Socket;
  autoPlay: boolean;
  townLayer?: Phaser.Tilemaps.TilemapLayer;
  gameEntry?: any;
  gameText: any[];
  isEnterGameZone: boolean;
  initData: any;

  constructor() {
    super('Town');

    this.socket;
    this.myPlayer;
    this.otherPlayer = {};
    this.autoPlay = false;
    this.gameText = [];
    this.isEnterGameZone = false;
  }

  init(data: any) {
    Object.values(this.otherPlayer).forEach(player => player.delete());
    this.otherPlayer = {};
    this.autoPlay = false;
    this.gameText = [];
    this.isEnterGameZone = false;
    this.myPlayer?.delete();
    delete this.myPlayer;

    if (data.myPlayer?.id) {
      this.initData = {
        id: data.myPlayer.id,
        hair: data.myPlayer.hairName,
        nickname: data.myPlayer.nickname,
        socket: data.socket,
      };
    } else {
      emitter.on('init', (data: gameInitType) => {
        this.socket = data.socket.connect();
        this.initUser(true, data);
      });
    }

    emitter.on('updateNickname', (nickname: string) => {
      this.myPlayer?.updateNickname(nickname);
    });

    emitter.on('updateHair', (hair: string) => {
      this.myPlayer?.updateHair(hair);
    });

    window.onclick = (e: MouseEvent) => {
      const elem = e.target as HTMLElement;
      const checkInput = elem.tagName === 'INPUT';

      if (this.myPlayer) this.myPlayer.isCanMove = !checkInput;
      this.input.keyboard.manager.enabled = !checkInput;
    };

    emitter.emit('game-start');
  }

  changeScene = (gameName: string, roomId: string) => {
    emitter.emit('closeContent');

    this.scene.pause();
    this.scene.start(gameName, {
      socket: this.socket,
      myPlayer: this.myPlayer,
      otherPlayer: this.otherPlayer,
      autoPlay: this.autoPlay,
      roomId: roomId,
    });

    // emitter 이벤트 지워주기
    emitter.removeListener('init');
    emitter.removeListener('updateNickname');
    emitter.removeListener('updateHair');
    emitter.removeListener('gameStart');
  };

  create() {
    this.cameras.main.setBounds(0, 0, 2000, 2000);

    const map = this.make.tilemap({ key: 'town' });
    const tileset = map.addTilesetImage('town', 'tileset');
    this.townLayer = map.createLayer('town', tileset, 0, 0).setScale(2.5);
    this.townLayer.setCollisionByProperty({ collides: true });

    this.physics.world.setBounds(
      0,
      0,
      this.townLayer.width * 2.5,
      this.townLayer.height * 2.5
    );

    this.sound.add('christmas');

    spriteInfo.forEach(
      (info: { action: string; start: number; end: number }) => {
        const { action, start, end } = info;

        this.anims.create({
          key: `character-${action}`,
          frames: this.anims.generateFrameNames(action, {
            prefix: 'base',
            start,
            end,
          }),
          frameRate: 10,
          repeat: -1,
        });

        this.anims.create({
          key: `tool-${action}`,
          frames: this.anims.generateFrameNames(action, {
            prefix: 'tool',
            start,
            end,
          }),
          frameRate: 10,
          repeat: -1,
        });

        hairInfo.forEach((hair: string) => {
          this.anims.create({
            key: `${hair}-${action}`,
            frames: this.anims.generateFrameNames(action, {
              prefix: `${hair}`,
              start,
              end,
            }),
            frameRate: 10,
            repeat: -1,
          });
        });
      }
    );

    this.anims.create({
      key: 'dust',
      frames: this.anims.generateFrameNames('dust', {
        start: 0,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    });

    if (!this.initData) emitter.emit('ready');
    else {
      this.initUser(false, this.initData);
      emitter.emit('leaveGame');
    }
  }

  update() {
    this.myPlayer?.update();

    this.musicControll();
  }

  socketInit() {
    if (!this.socket) return;
    const userInitiated = (data: userType[]) => {
      if (!Array.isArray(data)) data = [data];

      data.forEach((user: userType) => {
        const id = user.id.toString().trim();
        if (this.myPlayer?.id === id) return;
        if (this.otherPlayer[id]) return;

        this.otherPlayer[id] = new OtherPlayer(this, user);
      });
    };

    const userCreated = (user: any) => {
      const id = user.id.toString().trim();
      if (this.myPlayer?.id === id) return;
      if (this.otherPlayer[id]) return;

      this.otherPlayer[id] = new OtherPlayer(this, user);
    };

    const move = (data: userType) => {
      const id = data.id.toString().trim();

      if (!this.otherPlayer[id]) return;
      const { state, x, y, direction } = data;
      this.otherPlayer[id].update(state, x, y, direction);
    };

    const userLeaved = (data: userType) => {
      const id = data.id.toString().trim();
      this.otherPlayer[id].delete();
      delete this.otherPlayer[id];
    };

    const userDataChanged = (data: userType) => {
      const { id, nickname, characterName } = data;
      this.otherPlayer[id].updateNickname(nickname);
      this.otherPlayer[id].updateHair(characterName);
    };

    this.socket.on('userInitiated', userInitiated);
    this.socket.on('userCreated', userCreated);
    this.socket.on('move', move);
    this.socket.on('userLeaved', userLeaved);
    this.socket.on('userDataChanged', userDataChanged);

    const readyGame = (data: any) => {
      if (!this.socket) return;
      this.socket.removeListener('userInitiated', userInitiated);
      this.socket.removeListener('userCreated', userCreated);
      this.socket.removeListener('move', move);
      this.socket.removeListener('userLeaved', userLeaved);
      this.socket.removeListener('userDataChanged', userDataChanged);

      this.changeScene(data.gameName, data.roomId);
      emitter.removeListener('readyGame', readyGame);
    };

    emitter.on('readyGame', readyGame);
    this.socket.emit('getUserInitiated');
  }

  initUser(isSocketInit: boolean, data: any) {
    const { id, hair, nickname, socket } = data;

    this.myPlayer = new MyPlayer(this, 800, 800, id, hair, nickname, socket);

    if (this.townLayer)
      this.physics.add.collider(this.myPlayer, this.townLayer);

    if (isSocketInit) {
      this.socket?.on('connect', () => {
        this.socketInit();
      });
    } else {
      this.socket = socket;
      this.socketInit();
    }

    this.gameEntry = this.physics.add.staticGroup({
      key: 'portal',
      frameQuantity: 2,
    });

    const gameZonePosition = [
      { name: 'Maze', x: 980, y: 1270 },
      { name: 'Running', x: 1480, y: 680 },
      // { name: 'Survival', x: 540, y: 810 },
    ];

    this.gameEntry
      .getChildren()[0]
      .setPosition(gameZonePosition[0].x, gameZonePosition[0].y);
    this.gameEntry
      .getChildren()[1]
      .setPosition(gameZonePosition[1].x, gameZonePosition[1].y);
    // this.gameEntry
    //   .getChildren()[2]
    //   .setPosition(gameZonePosition[2].x, gameZonePosition[2].y);

    this.gameEntry.refresh();

    const keyG = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);

    this.physics.add.overlap(
      this.myPlayer,
      this.gameEntry,
      (player, entry: any) => {
        const game = gameZonePosition.filter(({ x }) => x === entry.x)[0];
        const { name, x, y } = game;
        const text: (
          | Phaser.GameObjects.Graphics
          | Phaser.GameObjects.Text
          | undefined
        )[] = [];

        if (!this.isEnterGameZone) {
          text.push(
            this.add
              .graphics()
              .fillStyle(0xffffff, 50)
              .fillRoundedRect(x - 60, y - 70, 125, 40, 20),
            this.add.text(x - 50, y - 60, 'push G key!', {
              color: '#000',
              font: '700 18px Arial',
            })
          );

          this.isEnterGameZone = true;

          setTimeout(() => {
            text[0]?.destroy();
            text[1]?.destroy();
            this.isEnterGameZone = false;
          }, 500);
        }

        if (Phaser.Input.Keyboard.JustDown(keyG)) {
          emitter.emit('game', { gameName: name });
        }
      }
    );
  }

  musicControll() {
    const music = this.sound.get('christmas');
    if (this.autoPlay && !this.sound.get('christmas').isPlaying) music.play();

    emitter.on('musicControll', (state: boolean) => {
      const changeState = music.isPlaying === state ? false : true;

      if (!changeState) return;

      music.isPlaying ? music.stop() : music.play();
      this.autoPlay = !this.autoPlay;
    });
  }
}
