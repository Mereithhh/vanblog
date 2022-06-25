import { useEffect } from 'react';
import Vditor from 'vditor';
import 'vditor/dist/index.css';
export default function Editor(props) {
  useEffect(() => {
    const vditor = new Vditor('vditor', {
      after: () => {
        vditor.setValue('`Vditor` 最小代码示例');
        props?.setVd(vditor);
      },
      minHeight: 500,
    });
  }, []);
  return <div id="vditor" className="vditor" />;
}
