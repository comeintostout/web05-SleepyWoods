import { css } from '@emotion/react';
import phoneIcon from '../../../assets/icon/phoneIcon.svg';
import addFriendIcon from '../../../assets/icon/addFriendIcon.svg';
import { backgroundImage } from '../../../styles/mixin.styled';
import theme from '../../../styles/theme';

export const FriendsTabWrapper = css`
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  gap: 20px;
`;

export const friendListWrapper = css`
  display: flex;
  flex-flow: column nowrap;
  gap: 12px;
  height: 350px;

  overflow-y: scroll;
  -ms-overflow-style: none;
  scrollbar-width: none;

  ::-webkit-scrollbar {
    display: none;
  }

  > li {
    cursor: move;
  }
`;

export const callingList = css`
  height: 250px;
  ${backgroundImage(phoneIcon)};
`;

export const friendItemWrapper = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 5px;

  div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }
`;

export const userName = (state: boolean) => css`
  font-weight: 700;

  ::before {
    display: inline-block;
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 5px;
    background-color: ${state ? theme.green : theme.red};
  }
`;

export const findFriend = css`
  display: flex;
  justify-content: space-evenly;
  align-items: center;

  width: 100%;
  height: 40px;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.7);
  margin-top: 10px;

  ::before {
    content: url(${addFriendIcon});
  }

  input {
    width: 70%;
    height: 100%;
    border: none;
    background-color: transparent;
    font-size: 14px;
    font-weight: 700;
  }
`;