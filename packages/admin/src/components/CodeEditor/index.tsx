import MonacoEditor from 'react-monaco-editor';
import { useModel } from 'umi';
export default function (props: {
  value;
  onChange;
  language: string;
  height?: any;
  width?: any;
  style?: any;
}) {
  const { initialState } = useModel('@@initialState');
  return (
    <div style={props.style || undefined}>
      <MonacoEditor
        width={props?.width || undefined}
        height={props?.height || undefined}
        language={props.language}
        theme={initialState?.settings?.navTheme == 'light' ? 'vs-light' : 'vs-dark'}
        value={props.value}
        // options={options}
        onChange={(v) => {
          props.onChange(v);
        }}
        // editorDidMount={::this.editorDidMount}
      />
    </div>
  );
}
