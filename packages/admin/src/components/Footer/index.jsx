import { DefaultFooter } from '@ant-design/pro-layout';
import { useIntl } from 'umi';
import { GithubOutlined } from '@ant-design/icons';

const Footer = () => {
  const intl = useIntl();
  const defaultMessage = intl.formatMessage({
    id: 'app.copyright.produced',
    defaultMessage: 'Van Blog',
  });
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
      ]}
    />
  );
};

export default Footer;
