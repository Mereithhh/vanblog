import MonacoEditor from 'react-monaco-editor';
export default function (props: { value; onChange; language: string; height; width; style }) {
  return (
    <div style={props.style || undefined}>
      <MonacoEditor
        width={props?.width || undefined}
        height={props?.height || undefined}
        language={props.language}
        theme="vs-light"
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
