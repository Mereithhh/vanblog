import React, { useEffect, useState } from 'react';
import { Button, Divider, Form, message, Modal, Progress, Result, Switch } from 'antd';
import request from '@/utils/request';
import { useNavigate, useLocation } from 'react-router-dom';
//@ts-ignore
import './index.less';

import { ProFormText, StepsForm } from '@ant-design/pro-components';

import Footer from '@/components/Footer';
import { fetchInit, fetchAllMeta } from '@/services/van-blog/api';
import ProCard from '@ant-design/pro-card';
import { ProFormInstance } from '@ant-design/pro-form';
import { Alert } from 'antd';
import SiteInfoForm from '@/components/SiteInfoForm';
import { encryptPwd } from '@/services/van-blog/encryptPwd';
import { useRef } from 'react';
import { resetRedirectCycle } from '@/utils/auth';
import { useHistory } from '@/utils/umiCompat';

// 定义错误类型
interface ApiError {
  response?: {
    status?: number;
  };
  data?: {
    statusCode?: number;
    message?: string;
  };
  message?: string;
}

const InitPage = () => {
  const history = useHistory();
  const navigate = useNavigate();
  const location = useLocation();
  const formMapRef = useRef<React.MutableRefObject<ProFormInstance<any> | undefined>[]>([]);
  const formRef1 = useRef<ProFormInstance>();
  const formRef2 = useRef<ProFormInstance>();
  const formRef3 = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  
  // 页面加载时清除重定向循环状态和任何残留令牌
  useEffect(() => {
    console.log('[DEBUG] InitPage loaded, resetting any redirect cycles');
    resetRedirectCycle();
    
    // 检查系统是否需要初始化
    const checkSystemInitStatus = async () => {
      try {
        console.log('[DEBUG] Checking if system needs initialization');
        // 使用 fetchAllMeta 替代 fetchInit 来检查初始化状态
        const response = await fetchAllMeta();
        console.log('[DEBUG] Init check response:', response?.statusCode);
        
        // 如果状态码是 200，说明已经初始化
        if (response?.statusCode === 200) {
          console.log('[DEBUG] System already initialized, redirecting to login');
          message.info('系统已初始化，正在跳转到登录页...');
          
          setTimeout(() => {
            if (history && history.push) {
              history.push('/user/login');
            } else if (navigate) {
              navigate('/user/login', { replace: true });
            } else {
              window.location.href = '/admin/user/login';
            }
          }, 1500);
        }
      } catch (error) {
        const apiError = error as ApiError;
        console.error('[DEBUG] Error checking init status:', apiError);
        // 如果返回 233，说明需要初始化，不做任何操作
        if (apiError.response?.status === 233 || apiError.data?.statusCode === 233) {
          console.log('[DEBUG] System needs initialization, staying on init page');
        } else {
          console.warn('[DEBUG] Error occurred while checking status, but continuing to show form');
        }
      }
    };
    
    checkSystemInitStatus();
  }, []);
  
  // 处理初始化表单提交
  const handleInitSubmit = async (values: any) => {
    console.log('[DEBUG] Processing init form submission with values:', { ...values, password: '***' });
    setLoading(true);
    
    try {
      // 解构获取用户名和密码
      const { name, password } = values;

      // 根据site.dto.ts构建正确的SiteInfo对象
      // 注意SiteInfo中字段名和表单字段名的对应关系
      const siteInfo = {
        // 必填字段
        author: values.author || '',
        authorLogo: values.authorLogo || '',
        authorLogoDark: values.authorLogoDark || '',
        authDesc: values.authorDesc || '', // 注意：后端是authDesc而不是authorDesc
        siteLogo: values.siteLogo || '',
        siteLogoDark: values.siteLogoDark || '',
        favicon: values.favicon || '',
        siteName: values.siteName || '', // 直接匹配，无需转换
        siteDesc: values.siteDesc || '', // 直接匹配，无需转换
        baseUrl: values.baseUrl || '',
        
        // 其他可选字段
        beianNumber: values.beianNumber || '',
        beianUrl: values.beianUrl || '',
        since: new Date(), // 使用Date对象，不是字符串
        
        // 默认值
        payAliPay: '',
        payWechat: '',
        payAliPayDark: '',
        payWechatDark: '',
        gaBeianNumber: '',
        gaBeianUrl: '',
        gaBeianLogoUrl: '',
        gaAnalysisId: '',
        baiduAnalysisId: '',
        copyrightAggreement: '',
        
        // 布局设置默认值
        showAdminButton: 'true',
        showDonateInfo: 'true',
        showCopyRight: 'true',
        showDonateButton: 'true',
        showDonateInAbout: 'false',
        enableComment: 'true',
        subMenuOffset: 0,
        defaultTheme: 'auto',
        enableCustomizing: 'true',
        showRSS: 'true',
        
        // 合并表单中可能存在的其他字段
        ...Object.keys(values)
          .filter(key => key !== 'name' && key !== 'password')
          .reduce((obj, key) => {
            if (values[key] !== undefined && values[key] !== null) {
              // @ts-ignore
              obj[key] = values[key];
            }
            return obj;
          }, {})
      };
      
      // 准备符合init.dto.ts的请求数据结构
      const completeRequestData = {
        user: {
          username: name,
          password: encryptPwd(name, password),
          nickname: name, // 使用username作为nickname
        },
        siteInfo: siteInfo
      };
      
      console.log('[DEBUG] Complete request data structure:', {
        user: { ...completeRequestData.user, password: '***' },
        siteInfo: {
          ...completeRequestData.siteInfo,
          since: completeRequestData.siteInfo.since.toString() // 转为字符串以便于日志显示
        }
      });
      
      // 使用直接的fetch请求，绕过可能有问题的request工具函数
      console.log('[DEBUG] Sending init request directly');
      const response = await fetch('/api/admin/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeRequestData)
      });
      
      const data = await response.json();
      console.log('[DEBUG] Init response status:', response.status);
      console.log('[DEBUG] Init response data:', data);
      
      if (response.ok && data?.statusCode === 200) {
        console.log('[DEBUG] Initialization successful');
        
        // 显示成功信息
        Modal.success({
          title: '初始化成功!',
          content:
            '首次使用请记得去后台 "站点管理/评论管理" 中注册一下评论系统的管理员账号哦！评论通知等设置可在 "系统设置/评论设置" 中找到。',
          onOk: () => {
            console.log('[DEBUG] Redirecting to login after successful init');
            resetRedirectCycle(); // 确保重定向状态被重置
            
            // 使用可用的导航方法
            if (history && history.push) {
              history.push('/user/login');
            } else if (navigate) {
              navigate('/user/login', { replace: true });
            } else {
              window.location.href = '/admin/user/login';
            }
          },
          onCancel: () => {
            console.log('[DEBUG] Cancelled modal, redirecting to login');
            resetRedirectCycle(); // 确保重定向状态被重置
            
            // 使用可用的导航方法
            if (history && history.push) {
              history.push('/user/login');
            } else if (navigate) {
              navigate('/user/login', { replace: true });
            } else {
              window.location.href = '/admin/user/login';
            }
          },
        });
        
        return true;
      } else {
        // 初始化失败
        console.error('[DEBUG] Initialization failed:', data?.message || '未知错误');
        message.error(`初始化失败: ${data?.message || '服务器错误，请稍后再试'}`);
        return false;
      }
    } catch (error: any) {
      console.error('[DEBUG] Error during initialization:', error);
      
      // 详细记录错误信息以便调试
      message.error(`初始化失败: ${error.message || '请检查网络连接并稍后再试'}`);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container">
      <div className="content">
        <ProCard
          title={
            <div>
              <p style={{ fontSize: 20, marginBottom: 0 }}>欢迎使用 VanBlog 个人博客系统</p>
              <a
                target={'_blank'}
                rel="noreferrer"
                href="https://vanblog.mereith.com/feature/basic/setting.html"
              >
                帮助文档
              </a>
            </div>
          }
        >
          <StepsForm
            formMapRef={formMapRef}
            onFinish={handleInitSubmit}
            submitter={{
              submitButtonProps: {
                loading,
                disabled: loading,
              },
            }}
          >
            <StepsForm.StepForm name="step1" title="配置用户">
              <Alert
                type="info"
                message="初始化页面所有配置都可在初始化后进入后台修改。"
                style={{ marginBottom: 8 }}
              ></Alert>
              <ProFormText
                name="name"
                required={true}
                rules={[{ required: true, message: '这是必填项' }]}
                label="登录用户名"
                placeholder={'请输入登录用户名'}
              ></ProFormText>
              {/* <ProFormText
                name="nickname"
                required={true}
                rules={[{ required: true, message: '这是必填项' }]}
                label="昵称"
                placeholder={'请输入昵称（显示的名字）'}
              ></ProFormText> */}
              <ProFormText.Password
                name="password"
                required={true}
                rules={[{ required: true, message: '这是必填项' }]}
                label="登录密码"
                placeholder={'请输入登录密码'}
              ></ProFormText.Password>
            </StepsForm.StepForm>
            <StepsForm.StepForm
              name="step2"
              title={'基本配置'}
              formRef={formRef1}
              onFinish={async (values) => {
                console.log('[DEBUG] Validating base URL:', values.baseUrl);
                let ok = true;
                try {
                  new URL(values.baseUrl);
                } catch (err) {
                  ok = false;
                  console.error('[DEBUG] Invalid URL format:', err);
                }
                if (!ok) {
                  Modal.warn({
                    title: '网站 URL 不合法！',
                    content: (
                      <div>
                        <p>请输入包含完整协议的 URL</p>
                        <p>例: https://blog-demo.mereith.com</p>
                      </div>
                    ),
                  });
                  return false;
                }
                return true;
              }}
            >
              <Alert
                type="info"
                message="默认的上传图片会到内置图床，如需配置 oss 图床，可在初始化后去设置页更改。初始化页面所有配置都可在初始化后进入后台修改。"
                style={{ marginBottom: 8 }}
              ></Alert>
              <SiteInfoForm
                showRequire={true}
                showOption={false}
                showLayout={false}
                form={formRef1}
                isInit={true}
              />
            </StepsForm.StepForm>
            <StepsForm.StepForm name="step3" title={'高级配置'} formRef={formRef2}>
              <Alert
                type="info"
                message="默认的上传图片会到内置图床，如需配置 oss 图床，可在初始化后去设置页更改。初始化页面所有配置都可在初始化后进入后台修改。"
                style={{ marginBottom: 8 }}
              ></Alert>
              <SiteInfoForm
                showRequire={false}
                showOption={true}
                showLayout={false}
                form={formRef2}
                isInit={true}
              />
            </StepsForm.StepForm>
            <StepsForm.StepForm name="step4" title={'布局配置'} formRef={formRef3}>
              <Alert
                type="info"
                message="初始化页面所有配置都可在初始化后进入后台修改。"
                style={{ marginBottom: 8 }}
              ></Alert>
              <SiteInfoForm
                isInit={true}
                showRequire={false}
                showOption={false}
                showLayout={true}
                form={formRef3}
              />
            </StepsForm.StepForm>
          </StepsForm>
        </ProCard>
      </div>
      <Footer />
    </div>
  );
};

export default InitPage;
