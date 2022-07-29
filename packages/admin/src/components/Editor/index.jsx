import { useEffect, useRef } from 'react';
import Vditor from 'vditor';
import 'vditor/dist/index.css';
export default function Editor(props) {
  const { current } = useRef({ editor: null });
  useEffect(() => {
    if (!current.editor) {
      current.editor = new Vditor('vditor', {
        mode: 'wysiwyg',
        fullscreen: {
          index: 9999,
        },
        preview: {
          delay: 200,
        },
        after: () => {
          props?.setVd(current.editor);
        },
      });
    }

    return () => {
      if (current.editor && current.editor.destroy) {
        current.editor.destroy();
      }
    };
  }, [current]);
  return <div id="vditor" className="vditor" style={{ minHeight: 400 }} />;
}
