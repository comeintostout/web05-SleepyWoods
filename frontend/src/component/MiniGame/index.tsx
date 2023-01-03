import { useEffect, useState } from 'react';
import * as style from './miniGame.styled';
import { emitter } from '../Game/util';
import FriendMode from './FriendMode';
import ModeBox from './ModeBox';
import GameCode from './GameCode';
import GameWait from './GameWait';
import GameResult from './GameResult';
import { useRecoilValue } from 'recoil';
import { socketState } from '../../store/atom/socket';

const games: { [key: string]: string } = {
  Survival: '술래를 피해 끝까지 살아남으세요!',
  Running: '장애물을 피해서 결승점에 먼저 도달해보세요!',
  Maze: '보이지 않는 길을 찾아 모래사장에 도달하세요!',
};

export const gamesName: { [key: string]: string } = {
  Survival: '살아남기',
  Running: '달리기경주',
  Maze: '미로탈출',
};

const MiniGame = () => {
  const socket = useRecoilValue(socketState);
  const [isShowModal, setIsShowModal] = useState(false);
  const [selectGame, setSelectGame] = useState('');
  const [selectModeFriend, setSelectModeFriend] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [isGameFinish, setIsGameFinish] = useState(false);
  const [winnerGame, setWinnerGame] = useState<any>(undefined);

  useEffect(() => {
    const game = ({ gameName }: { gameName: string }) => {
      setIsShowModal(true);
      setSelectGame(gameName);
    };

    const closeContent = () => {
      setIsShowModal(false);
      initGame();
    };

    const finishGame = (data: any) => {
      setWinnerGame(data);
      setIsShowModal(true);
      setIsGameFinish(true);
    };

    emitter.on('game', game);
    emitter.on('closeContent', closeContent);
    socket.on('finishGame', finishGame);

    return () => {
      emitter.removeListener('game', game);
      emitter.removeListener('closeContent', closeContent);
      socket.removeListener('finishGame', finishGame);
    };
  }, []);

  const handleModal = () => {
    setIsShowModal(!isShowModal);
  };

  const initGame = () => {
    setIsReady(false);
    setRoomId('');
    setSelectModeFriend(false);
  };

  return (
    <>
      {isShowModal && (
        <>
          <section css={style.modal('show')}>
            <button
              type="button"
              css={style.closeBtn}
              onClick={handleModal}></button>
            <h3 css={style.header}>🎮 {gamesName[selectGame]}</h3>
            <div css={style.game}>
              {isGameFinish ? (
                <GameResult
                  setIsGameFinish={setIsGameFinish}
                  winnerGame={winnerGame}
                />
              ) : (
                <>
                  <div css={style.gameInfo}>{games[selectGame]}</div>
                  <div css={style.selectModes}>
                    {roomId ? (
                      <>
                        <GameCode roomId={roomId} />
                        <GameWait
                          selectModeFriend={selectModeFriend}
                          initGame={initGame}
                          gameName={selectGame}
                          roomId={roomId}
                        />
                      </>
                    ) : isReady ? (
                      <>
                        {selectModeFriend && <GameCode roomId={roomId} />}
                        <GameWait
                          selectModeFriend={selectModeFriend}
                          initGame={initGame}
                          gameName={selectGame}
                          roomId={roomId}
                        />
                      </>
                    ) : !selectModeFriend ? (
                      <ModeBox
                        setSelectModeFriend={setSelectModeFriend}
                        setIsReady={setIsReady}
                      />
                    ) : (
                      <FriendMode
                        setRoomId={setRoomId}
                        setIsReady={setIsReady}
                        initGame={initGame}
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default MiniGame;
