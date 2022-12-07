import Content from '../Content';
import { friendType } from './friends';
import { friendItemWrapper, userName } from './friends.styled';
import message from '../../../assets/icon/messageIcon.svg';
import unfollow from '../../../assets/icon/unfollowIcon.svg';
import axios from 'axios';
import { useRecoilState } from 'recoil';
import { friendsState } from '../../../store/atom/friends';
import { useEffect } from 'react';

const FriendItem = ({ friend }: { friend: friendType }) => {
  const [friends, setFriends] = useRecoilState(friendsState);

  const { id, isOnline, nickname } = friend;

  const sendChatting = () => {
    alert(`${nickname}님과 채팅하기`);
  };

  const unfollowing = async () => {
    const isConfirm = confirm(`${nickname}님을 언팔로우 하시겠습니까?`);

    if (isConfirm) {
      try {
        await axios.delete(`/api/friendship/${nickname}`);

        const newFriend = { ...friends };

        delete newFriend[nickname];
        setFriends(newFriend);

        alert(`${nickname}님을 언팔로우 하였습니다.`);
      } catch {
        alert('언팔로우 실패');
      }
    }
  };

  return (
    <Content draggable={isOnline}>
      <section id={id} css={friendItemWrapper(isOnline)}>
        <div css={userName(isOnline)}>{nickname}</div>
        <div>
          <img src={message} alt="채팅하기" onClick={sendChatting}></img>
          <img src={unfollow} alt="친구 끊기" onClick={unfollowing}></img>
        </div>
      </section>
    </Content>
  );
};

export default FriendItem;
