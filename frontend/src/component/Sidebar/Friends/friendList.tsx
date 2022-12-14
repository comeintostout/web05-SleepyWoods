import { MouseEvent, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import Content from '../Content';
import FriendItem from './friendItem';
import { friendType } from './friends';
import { friendListWrapper } from './friends.styled';
import { friendsState } from '../../../store/atom/friends';
import Search from './search';
import { socketState } from '../../../store/atom/socket';

const FriendList = () => {
  const [friends, setFriends] = useRecoilState(friendsState);
  const friendList = Object.values(friends).filter(value => true);
  const socket = useRecoilValue(socketState);

  useEffect(() => {
    const userCreated = (data: any) => {
      const { id, userState } = data;

      if (!friends[id]) return;

      setFriends(friends => ({
        ...friends,
        [id]: {
          ...friends[id],
          status: userState,
        },
      }));
    };

    const userLeaved = (data: any) => {
      const { id } = data;

      if (!friends[id]) return;

      setFriends(friends => ({
        ...friends,
        [id]: {
          ...friends[id],
          status: 'off',
        },
      }));
    };

    const userDataChanged = (data: any) => {
      const { id, nickname } = data;

      if (!friends[id]) return;

      setFriends(friends => ({
        ...friends,
        [id]: {
          ...friends[id],
          nickname: nickname,
        },
      }));
    };

    const userStateChanged = (data: any) => {
      const { userIdList, userState } = data;

      console.log('상태변화::::', userIdList, userState);
      userIdList.forEach((userId: any) => {
        if (!friends[userId]) return;

        console.log(friends[userId].nickname);
        setFriends(friends => ({
          ...friends,
          [userId]: {
            ...friends[userId],
            status: userState,
          },
        }));
      });
    };

    socket.on('userCreated', userCreated);
    socket.on('userLeaved', userLeaved);
    socket.on('userDataChanged', userDataChanged);
    socket.on('userStateChanged', userStateChanged);

    return () => {
      socket.removeListener('userCreated', userCreated);
      socket.removeListener('userLeaved', userLeaved);
      socket.removeListener('userDataChanged', userDataChanged);
      socket.removeListener('userStateChanged', userStateChanged);
    };
  }, [friends]);

  const handleDrag = (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    target.classList.toggle('dragging');
  };

  return (
    <Content>
      <h2 className="srOnly">친구 목록</h2>
      <ul
        css={friendListWrapper}
        onDragStart={handleDrag}
        onDragEnd={handleDrag}>
        {friendList.length ? (
          friendList.map((friend: friendType) => (
            <FriendItem friend={friend} key={friend.id} />
          ))
        ) : (
          <div>
            친구를 추가하고 <br />
            함께 플레이 해보세요:)
          </div>
        )}
      </ul>
      <Search />
    </Content>
  );
};

export default FriendList;
