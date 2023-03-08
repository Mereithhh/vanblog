export interface NavItem {
  index: number;
  level: number;
  listNo: string;
  text: string;
}

export const washMarkdownContent = (source: string) => {
  if (!source) return "";
  return (
    source
      .replace(/```([\s\S]*?)```[\s]*/g, "")
      .replace(/`#/g, "")
      .replace(/^[^#]+\n/g, "")
      .replace(/(?:[^\n#]+)#+\s([^#\n]+)\n*/g, "") // 匹配行内出现 # 号的情况
      .replace(/```[^`\n]*\n+[^```]+```\n+/g, "")
      .replace(/`([^`\n]+)`/g, "$1")
      .replace(/\*\*?([^*\n]+)\*\*?/g, "$1")
      .replace(/__?([^_\n]+)__?/g, "$1")
      .trim() + "\n"
  );
};

export const parseNavStructure = (source: string): NavItem[] => {
  const contentWithoutCode = washMarkdownContent(source);
  const pattOfTitle = /#+\s(.+)\n/g;
  const matchResult = contentWithoutCode.match(pattOfTitle);

  if (!matchResult) {
    return [];
  }

  const navData = matchResult.map((r, i) => {
    let titleText = r.replace(pattOfTitle, "$1");
    const urlReg = /\[[\s\S]*?\]\([\s\S]*?\)/g;
    const results = titleText.match(urlReg);
    if (results) {
      results.forEach((r) => {
        const srcText = r;
        const dstText = r.split("]")[0].substring(1);
        titleText = titleText.replace(srcText, dstText);
      });
    }
    return {
      index: i,
      //@ts-ignore
      level: r.match(/^#+/g)[0].length,
      text: titleText as string,
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
export const getEl = (item: NavItem, all: NavItem[]) => {
  const tagName = `h${item.level}`;
  const els = document.querySelectorAll(`${tagName}[data-id="${item.text}"]`);
  if (els.length > 1) {
    // 相同的规则找 index
    const index = all
      .filter((j) => {
        return j.level == item.level && j.text == item.text;
      })
      .findIndex((val) => {
        if (val.index == item.index) {
          return true;
        }
        return false;
      });
    return els[index];
  } else {
    return els[0];
  }
};
