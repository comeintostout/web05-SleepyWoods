import { useEffect, useState } from 'react';
import * as style from './sleepyboard.styled';

import axios from 'axios';
import { formattingWalk } from './util';

const RankContainer = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const dateList = [
    { year: month - 2 > 0 ? year : year - 1, month: month - 2 },
    { year: month - 1 > 0 ? year : year - 1, month: month - 1 },
    { year: year, month: month },
  ];

  const [monthIdx, setMonthIdx] = useState(2);
  const [filter, setFilter] = useState('all');
  const [rank, setRank] = useState<any>([]);
  const medals = ['🥇', '🥈', '🥉'];

  useEffect(() => {
    const getRank = async (key: string) => {
      try {
        const { data, status } = await axios(
          `/api/achievement/walk?year=${dateList[monthIdx].year}&month=${dateList[monthIdx].month}&range=${filter}`
        );

        if (status === 200) setRank(data);
      } catch (e) {}
    };

    getRank(filter);
  }, [filter, monthIdx]);

  return (
    <>
      <nav css={style.filterBtnBox}>
        <button
          type="button"
          onClick={() => setFilter('all')}
          css={style.filterBtn(filter === 'all', '')}>
          All
        </button>
        <button
          type="button"
          onClick={() => setFilter('friend')}
          css={style.filterBtn(filter === 'friend', '')}>
          Friend
        </button>
      </nav>

      <div css={style.contentWrapper}>
        <div css={style.selectMonthBox}>
          {dateList.map((date: any, idx: number) => (
            <button
              key={date.month}
              css={style.selectMonth(monthIdx === idx)}
              onClick={() => setMonthIdx(idx)}>
              {`${date.year}년 ${date.month}월`}
            </button>
          ))}
        </div>
        <ul css={style.topRankContainer}>
          {rank.map((user: any, idx: number) => {
            if (idx >= 3) return;
            return (
              <li key={idx}>
                <span>
                  {medals[idx]} {user.nickname}
                </span>
                <span>{formattingWalk(user.walkcount) + ' 보'}</span>
              </li>
            );
          })}
        </ul>
        <ul css={style.rankContainer}>
          {rank.map((user: any, idx: number) => {
            if (idx < 3) return;
            return (
              <li key={idx}>
                <span>
                  {idx + 1 + '.'} {user.nickname}
                </span>
                <span>{formattingWalk(user.walkcount) + ' 보'}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
};

export default RankContainer;
