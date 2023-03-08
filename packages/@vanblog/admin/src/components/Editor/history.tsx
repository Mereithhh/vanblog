import { BytemdPlugin } from 'bytemd';
export function historyIcon(): BytemdPlugin {
  return {
    actions: [
      {
        position: 'left',
        title: '撤销',
        icon: undoIcon, // 16x16 SVG icon

        handler: {
          type: 'action',
          click(ctx) {
            ctx.editor.undo();
          },
        },
      },
      {
        position: 'left',
        title: '重做',
        icon: redoIcon, // 16x16 SVG icon
        handler: {
          type: 'action',
          click(ctx) {
            ctx.editor.redo();
          },
        },
      },
    ],
  };
}
const undoIcon = `<svg t="1675480373045" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1778" width="200" height="200"><path d="M289.6384 256H614.4a307.2 307.2 0 1 1 0 614.4H204.8a51.2 51.2 0 0 1 0-102.4h409.6a204.8 204.8 0 1 0 0-409.6H286.0032l59.2384 59.2384A51.2 51.2 0 1 1 272.7936 489.984L128 345.2416a51.2 51.2 0 0 1 0-72.448L272.7936 128a51.2 51.2 0 0 1 72.448 72.3968L289.6384 256z" fill="currentColor" p-id="1779"></path></svg>`;
const redoIcon = `<svg t="1675480340266" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3860" width="200" height="200"><path d="M737.9968 256l-55.6032-55.6032A51.2 51.2 0 1 1 754.8416 128l144.7936 144.7936a51.2 51.2 0 0 1 0 72.448L754.8416 489.984a51.2 51.2 0 0 1-72.448-72.3968L741.632 358.4H409.6a204.8 204.8 0 1 0 0 409.6h409.6a51.2 51.2 0 0 1 0 102.4H409.6A307.2 307.2 0 1 1 409.6 256h328.3968z" fill="currentColor" p-id="3861"></path></svg>`;
