export interface NavItem {
  index: number;
  level: number;
  listNo: string;
  text: string;
}
export const parseNavStructure = (source: string): NavItem[] => {
  const contentWithoutCode = source
    .replace(/^[^#]+\n/g, "")
    .replace(/(?:[^\n#]+)#+\s([^#\n]+)\n*/g, "") // 匹配行内出现 # 号的情况
    // .replace(/^#\s[^#\n]*\n+/, "")
    .replace(/```[^`\n]*\n+[^```]+```\n+/g, "")
    .replace(/`([^`\n]+)`/g, "$1")
    .replace(/\*\*?([^*\n]+)\*\*?/g, "$1")
    .replace(/__?([^_\n]+)__?/g, "$1")
    .trim();
  const pattOfTitle = /#+\s(.+)\n/g;
  const matchResult = contentWithoutCode.match(pattOfTitle);

  if (!matchResult) {
    return [];
  }

  const navData = matchResult.map((r, i) => {
    return {
      index: i,
      //@ts-ignore
      level: r.match(/^#+/g)[0].length,
      text: r.replace(pattOfTitle, "$1"),
    };
  });

  let maxLevel = 0;
  navData.forEach((t) => {
    if (t.level > maxLevel) {
      maxLevel = t.level;
    }
  });
  let matchStack = [];
  // 此部分重构，原有方法会出现次级标题后再次出现高级标题时，listNo重复的bug
  for (let i = 0; i < navData.length; i++) {
    const t: any = navData[i];
    const { level } = t;
    while (
      matchStack.length &&
      matchStack[matchStack.length - 1].level > level
    ) {
      matchStack.pop();
    }
    if (matchStack.length === 0) {
      const arr = new Array(maxLevel).fill(0);
      arr[level - 1] += 1;
      matchStack.push({
        level,
        arr,
      });
      t.listNo = trimArrZero(arr).join(".");
      continue;
    }
    const { arr } = matchStack[matchStack.length - 1] as any;
    const newArr = arr.slice();
    newArr[level - 1] += 1;
    matchStack.push({
      level,
      arr: newArr,
    });
    t.listNo = trimArrZero(newArr).join(".");
  }
  return navData as NavItem[];
};

const trimArrZero = (arr: any) => {
  let start, end;
  for (start = 0; start < arr.length; start++) {
    if (arr[start]) {
      break;
    }
  }
  for (end = arr.length - 1; end >= 0; end--) {
    if (arr[end]) {
      break;
    }
  }
  return arr.slice(start, end + 1);
};
