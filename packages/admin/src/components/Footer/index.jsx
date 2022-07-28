import { DefaultFooter } from '@ant-design/pro-layout';
import { GithubOutlined } from '@ant-design/icons';

const Footer = () => {
  const defaultMessage = 'Van Blog';
  const currentYear = new Date().getFullYear();
  return (
    <DefaultFooter
      copyright={`${currentYear} ${defaultMessage}`}
      links={[
        {
          key: 'github',
          title: <GithubOutlined />,
          href: 'https://github.com/mereithhh/van-blog',
          blankTarget: true,
        },
        {
          key: 'websitev',
          title: '项目主页',
          href: 'https://vanblog.mereith.com',
          blankTarget: true,
        },
      ]}
    />
  );
};

export default Footer;
