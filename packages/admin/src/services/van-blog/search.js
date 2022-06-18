import pinyin from 'pinyin-match';

export const mutiSearch = (s, t) => {
  const source = s.toLowerCase();
  const target = t.toLowerCase();
  const rawInclude = source.includes(target);
  const pinYinInlcude = Boolean(pinyin.match(source, target));
  return rawInclude || pinYinInlcude;
};
