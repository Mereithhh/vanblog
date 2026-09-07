import axios from 'axios';
import {
  CADDY_LISTENER_WRAPPERS_URL,
  CaddyProvider,
  HTTP_REDIRECT_WRAPPERS,
} from './caddy.provider';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

function notFoundError() {
  const err = new Error('Request failed with status code 404') as Error & {
    response: { status: number };
  };
  err.response = { status: 404 };
  return err;
}

function createProvider() {
  const settingProvider = {
    getHttpsSetting: jest.fn().mockReturnValue(new Promise(() => undefined)),
  };
  const provider = new CaddyProvider(settingProvider as any);
  jest.spyOn(provider.logger, 'log').mockImplementation(() => undefined);
  jest.spyOn(provider.logger, 'error').mockImplementation(() => undefined);
  return { provider, settingProvider };
}

describe('CaddyProvider.setRedirect', () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
    mockedAxios.put.mockReset();
    mockedAxios.patch.mockReset();
    mockedAxios.post.mockReset();
    mockedAxios.delete.mockReset();
  });

  it('enables redirect by replacing wrappers (PUT when missing) and logs open success', async () => {
    const { provider } = createProvider();
    mockedAxios.patch.mockRejectedValue(notFoundError());
    mockedAxios.put.mockResolvedValue({ status: 200 });
    mockedAxios.get.mockResolvedValue({ data: [{ wrapper: 'http_redirect' }] });

    await expect(provider.setRedirect(true)).resolves.toBe('开启成功！');

    expect(mockedAxios.patch).toHaveBeenCalledWith(
      CADDY_LISTENER_WRAPPERS_URL,
      HTTP_REDIRECT_WRAPPERS,
    );
    expect(mockedAxios.put).toHaveBeenCalledWith(
      CADDY_LISTENER_WRAPPERS_URL,
      HTTP_REDIRECT_WRAPPERS,
    );
    expect(mockedAxios.post).not.toHaveBeenCalled();
    expect(mockedAxios.get).toHaveBeenCalledWith(CADDY_LISTENER_WRAPPERS_URL);
    expect(provider.logger.log).toHaveBeenCalledWith('https 自动重定向已开启');
    expect(provider.logger.error).not.toHaveBeenCalled();
  });

  it('enables redirect by PATCHing existing wrappers instead of appending', async () => {
    const { provider } = createProvider();
    mockedAxios.patch.mockResolvedValue({ status: 200 });
    mockedAxios.get.mockResolvedValue({ data: [{ wrapper: 'http_redirect' }] });

    await expect(provider.setRedirect(true)).resolves.toBe('开启成功！');

    expect(mockedAxios.patch).toHaveBeenCalledWith(
      CADDY_LISTENER_WRAPPERS_URL,
      HTTP_REDIRECT_WRAPPERS,
    );
    expect(mockedAxios.put).not.toHaveBeenCalled();
    expect(mockedAxios.post).not.toHaveBeenCalled();
    expect(provider.logger.log).toHaveBeenCalledWith('https 自动重定向已开启');
  });

  it('returns false when enable write fails', async () => {
    const { provider } = createProvider();
    mockedAxios.patch.mockRejectedValue(new Error('connection refused'));

    await expect(provider.setRedirect(true)).resolves.toBe(false);
    expect(mockedAxios.put).not.toHaveBeenCalled();
    expect(mockedAxios.post).not.toHaveBeenCalled();
    expect(provider.logger.error).toHaveBeenCalledWith('开启 https 自动重定向失败');
    expect(provider.logger.log).not.toHaveBeenCalled();
  });

  it('returns false when enable write succeeds but read-back has no http_redirect', async () => {
    const { provider } = createProvider();
    mockedAxios.patch.mockRejectedValue(notFoundError());
    mockedAxios.put.mockResolvedValue({ status: 200 });
    mockedAxios.get.mockResolvedValue({ data: [] });

    await expect(provider.setRedirect(true)).resolves.toBe(false);
    expect(provider.logger.error).toHaveBeenCalledWith('开启 https 自动重定向失败');
    expect(provider.logger.log).not.toHaveBeenCalled();
  });

  it('disables redirect by deleting wrappers and treats 404 as already off', async () => {
    const { provider } = createProvider();
    mockedAxios.delete.mockResolvedValue({ status: 200 });
    mockedAxios.get.mockRejectedValue(notFoundError());

    await expect(provider.setRedirect(false)).resolves.toBe('关闭成功！');
    expect(mockedAxios.delete).toHaveBeenCalledWith(CADDY_LISTENER_WRAPPERS_URL);
    expect(mockedAxios.get).toHaveBeenCalledWith(CADDY_LISTENER_WRAPPERS_URL);
    expect(provider.logger.log).toHaveBeenCalledWith('https 自动重定向已关闭');
    expect(provider.logger.error).not.toHaveBeenCalled();
  });

  it('disables redirect when DELETE is already 404', async () => {
    const { provider } = createProvider();
    mockedAxios.delete.mockRejectedValue(notFoundError());
    mockedAxios.get.mockRejectedValue(notFoundError());

    await expect(provider.setRedirect(false)).resolves.toBe('关闭成功！');
    expect(mockedAxios.delete).toHaveBeenCalledWith(CADDY_LISTENER_WRAPPERS_URL);
    expect(provider.logger.log).toHaveBeenCalledWith('https 自动重定向已关闭');
  });

  it('returns false when disable DELETE fails', async () => {
    const { provider } = createProvider();
    mockedAxios.delete.mockRejectedValue(new Error('connection refused'));

    await expect(provider.setRedirect(false)).resolves.toBe(false);
    expect(provider.logger.error).toHaveBeenCalledWith('关闭 https 自动重定向失败');
    expect(provider.logger.log).not.toHaveBeenCalled();
  });

  it('returns false when disable DELETE succeeds but read-back still has http_redirect', async () => {
    const { provider } = createProvider();
    mockedAxios.delete.mockResolvedValue({ status: 200 });
    mockedAxios.get.mockResolvedValue({ data: [{ wrapper: 'http_redirect' }] });

    await expect(provider.setRedirect(false)).resolves.toBe(false);
    expect(provider.logger.error).toHaveBeenCalledWith('关闭 https 自动重定向失败');
    expect(provider.logger.log).not.toHaveBeenCalled();
  });
});
