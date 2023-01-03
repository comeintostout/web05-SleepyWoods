import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { callingListState } from '../../store/atom/callingList';
import { friendsState } from '../../store/atom/friends';
import { socketState } from '../../store/atom/socket';
import { callingWrapper } from './call.styled';
import CallingItem from './callingItem';
import Video from './video';

const Call = () => {
  const [friends, setFriends] = useRecoilState(friendsState);
  const [callingList, setCallingList] = useRecoilState(callingListState);
  const socket = useRecoilValue(socketState);
  let friendList = Object.values(friends).filter(value => value.isCalling);

  const [connectVideo, setConnectVideo] = useState(false);

  const [isSend, setSend] = useState({
    id: '',
    nickname: '',
  });

  useEffect(() => {
    // 해당 id의 유저로부터 전화 걸려옴
    socket.on('callRequested', data => {
      const {
        callerUserId: id,
        callerNickname: nickname,
        callingRoom: roomId,
      } = data;

      friends[id] &&
        setFriends(friends => ({
          ...friends,
          [id]: {
            ...friends[id],
            status: 'busy',
            isCalling: false,
          },
        }));

      setSend({
        id: id,
        nickname: nickname,
      });

      setCallingList(callingList => ({
        id: roomId,
        list: callingList.list,
      }));
    });

    socket.on('callCanceled', data => {
      const { callerUserId: id } = data;

      friends[id] &&
        setFriends(friends => ({
          ...friends,
          [id]: {
            ...friends[id],
            isCalling: false,
          },
        }));

      setSend(() => ({
        id: '',
        nickname: '',
      }));

      setCallingList(() => ({
        id: '',
        list: {},
      }));

      socket.emit('callLeaved');
    });

    socket.on('callRejected', data => {
      const { calleeUserId: id } = data;

      friends[id] &&
        setFriends(friends => ({
          ...friends,
          [id]: {
            ...friends[id],
            isCalling: false,
          },
        }));
    });

    socket.on('callEntered', data => {
      const { calleeUserId: id } = data;

      friends[id] &&
        setFriends(friends => ({
          ...friends,
          [id]: {
            ...friends[id],
            status: 'busy',
            isCalling: false,
          },
        }));

      connectVideo || setConnectVideo(() => true);
    });

    return () => {
      socket.removeListener('callRequested');
      socket.removeListener('callCanceled');
      socket.removeListener('callRejected');
      socket.removeListener('callEntered');
    };
  }, [isSend, friends]);

  // 연결 수락이나 끊기 눌렀을 때, 통화 창 안 보이도록 해주기
  return (
    <>
      <Video connectVideo={connectVideo} setConnectVideo={setConnectVideo} />
      <div css={callingWrapper}>
        {friendList.map(friend => (
          <CallingItem
            key={friend.id}
            id={friend.id}
            nickname={friend.nickname}
            isSend={true}
            setConnectVideo={setConnectVideo}
          />
        ))}
        {isSend.id && (
          <CallingItem
            id={isSend.id}
            nickname={isSend.nickname}
            isSend={false}
            setConnectVideo={setConnectVideo}
            setSend={setSend}
          />
        )}
      </div>
    </>
  );
};

export default Call;
