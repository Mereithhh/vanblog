import moment from 'moment';
import copy from 'copy-to-clipboard';
export async function getClipboardContents() {
  try {
    const clipboardItems = await navigator.clipboard.read();
    for (const clipboardItem of clipboardItems) {
      for (const type of clipboardItem.types) {
        if (type.includes('image')) {
          const blob = await clipboardItem.getType(type);
          return new File(
            [blob],
            `clipboard-${moment().format('YYYY-MM-DD')}.${type.replace('image/', '')}`,
          );
        }
      }
    }
  } catch (err) {
    console.error(err.name, err.message);
    return null;
  }
}
export async function writeClipBoardText(str) {
  try {
    copy(str);
    return true;
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
}
