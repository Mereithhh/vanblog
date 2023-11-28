import { checkJsonString } from '@/services/van-blog/checkJson';
import { ModalForm, ProFormTextArea } from '@ant-design/pro-form';
import { triggerPipelineById } from '@/services/van-blog/api';
import { message, Modal } from 'antd';

export default function ({ pipeline, trigger }: { pipeline: any; trigger: any }) {
  const runCode = async (input?: any) => {
    const dto: any = {};
    if (input) {
      const inputObj = JSON.parse(input);
      dto.input = inputObj;
    }
    const { data } = await triggerPipelineById(pipeline.id, dto);
    Modal.info({
      title: '运行结果',
      width: 800,
      content: (
        <pre
          style={{
            maxHeight: '60vh',
            overflow: 'auto',
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      ),
    });
  };
  return (
    <ModalForm
      title="调试代码（请先保存）"
      onFinish={async (vals) => {
        if (!vals.input) {
          runCode();
          return true;
        } else {
          if (!checkJsonString(vals.input)) {
            message.error('请输入正确的json格式！');
            return false;
          } else {
            runCode(vals.input);
            return true;
          }
        }
      }}
      trigger={trigger}
    >
      <ProFormTextArea
        label="输入（json 格式）"
        name="input"
        tooltip="请输入给脚本传入的参数，JSON 格式，会注入到脚本的 input 中。"
      />
    </ModalForm>
  );
}
