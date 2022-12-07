import { useState } from 'react';
import * as style from './chat.styled';
import ChatMessage from './ChatMessage';
import Input from './Input';
import { calcTimeFromMs } from './util';

const Chat = () => {
  const [isExtend, setIsExtend] = useState(true);
  const [chatDatas, setChatDatas] = useState<any[]>([]);

  // 채팅 없데이트
  const updateChat = (chat: any) => {
    chat.timestamp = calcTimeFromMs(chat.timestamp);

    sessionStorage.setItem('chat', JSON.stringify([...chatDatas, chat]));
    setChatDatas((chatDatas: any) => [...chatDatas, chat]);
  };

  // 채팅창 크기 변경
  const handleExtend = () => {
    setIsExtend(!isExtend);
  };

  return (
    <section css={style.chatContainer(isExtend)}>
      <button
        type="button"
        css={style.extendBtn(isExtend)}
        onClick={handleExtend}></button>

      <ChatMessage
        updateChat={updateChat}
        isExtend={isExtend}
        chatDatas={chatDatas}
        setChatDatas={setChatDatas}
      />

      <div css={style.chatInputContainer}>
        <Input updateChat={updateChat} />
      </div>
    </section>
  );
};

export default Chat;
