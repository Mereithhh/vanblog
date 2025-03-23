// import MonacoEditor from 'react-monaco-editor';
import { useModel } from '@/utils/umiCompat';
import { Input } from 'antd';

const { TextArea } = Input;

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}

export default function ({ style, width, height, language, onChange, value }: CodeEditorProps) {
  const { initialState } = useModel();

  return (
    <div style={style}>
      <TextArea
        style={{ width: width || '100%', height: height || 300 }}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      />
    </div>
  );
}
