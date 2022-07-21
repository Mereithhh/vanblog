import { useEffect } from 'react';
import Vditor from 'vditor';
import 'vditor/dist/index.css';
export default function Editor(props) {
  useEffect(() => {
    const vditor = new Vditor('vditor', {
      mode: 'sv',
      fullscreen: {
        index: 9999,
      },
      after: () => {
        vditor.setValue('`Vditor` 最小代码示例');
        props?.setVd(vditor);
      },
      minHeight: 500,
    });
    return () => {
      vditor.destroy();
    };
  }, []);
  return <div id="vditor" className="vditor" />;
}
