import { HttpException, HttpStatus, Injectable, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SearchStaticOption, StaticType, StorageType } from 'src/types/setting.dto';
import { Static, StaticDocument } from 'src/scheme/static.schema';
import { encryptFileMD5 } from 'src/utils/crypto';
import { ArticleProvider } from '../article/article.provider';
import { SettingProvider } from '../setting/setting.provider';
import { LocalProvider } from './local.provider';
import { PicgoProvider } from './picgo.provider';
import { imageSize } from 'image-size';
import { ImgMeta } from 'src/types/img';
import { formatBytes } from 'src/utils/size';
import { sanitizePagination } from 'src/utils/pagination';
import axios from 'axios';
import { UploadConfig } from 'src/types/upload';
import { addWaterMarkToIMG } from 'src/utils/watermark';
import { checkTrue } from 'src/utils/checkTrue';
import { compressExt, compressImg, resolveCompressFormat } from 'src/utils/imgCompress';
import { normalizeCustomPageRel } from 'src/utils/customPagePath';
import {
  applyImageUrlMap,
  classifyImageUrl,
  collectSiteHosts,
  emptyTransferResult,
  extractImageRefs,
  filenameFromRemote,
  looksLikeImage,
  TransferRemoteResult,
} from 'src/utils/transferRemoteImages';
@Injectable()
export class StaticProvider {
  constructor(
    @InjectModel('Static')
    private staticModel: Model<StaticDocument>,
    private readonly settingProvider: SettingProvider,
    private readonly localProvider: LocalProvider,
    private readonly picgoProvider: PicgoProvider,
    private readonly articleProvder: ArticleProvider,
  ) {}
  publicView = {
    _id: 0,
  };
  adminView = undefined;
  getView(view: 'admin' | 'public') {
    if (view == 'admin') {
      return this.adminView;
    }
    return this.publicView;
  }
  async upload(
    file: any,
    type: StaticType,
    isFavicon?: boolean,
    customPathname?: string,
    updateConfig?: UploadConfig,
  ) {
    const { buffer } = file;
    const arr = file.originalname.split('.');
    const fileType = arr[arr.length - 1];
    let buf = buffer;
    let currentSign = encryptFileMD5(buf);
    const staticConfigInDB = await this.settingProvider.getStaticSetting();
    let compressSuccess = true;
    const compressFormat = resolveCompressFormat(staticConfigInDB?.compressFormat);
    if (type == 'img') {
      try {
        // 用加过水印的 buf 做计算，看看是不是有文件的。
        if (updateConfig && updateConfig.withWaterMark && fileType != 'gif') {
          // 双保险，只有这里开启水印并且设置中也开启了才有效。
          const waterMarkConfigInDB = staticConfigInDB;
          if (waterMarkConfigInDB && checkTrue(waterMarkConfigInDB?.enableWaterMark)) {
            const waterMarkText = updateConfig.waterMarkText || waterMarkConfigInDB.waterMarkText;
            if (waterMarkText && waterMarkText.trim() !== '') {
              buf = await addWaterMarkToIMG(buffer, waterMarkText);
              currentSign = encryptFileMD5(buf);
            }
          }
        }
      } catch (err) {
        // console.log(err);
      }

      if (checkTrue(staticConfigInDB.enableWebp)) {
        try {
          buf = await compressImg(buf, compressFormat);
          currentSign = encryptFileMD5(buf);
        } catch (err) {
          // console.log(err);
          compressSuccess = false;
        }
      }

      const hasFile = await this.getOneBySign(currentSign);

      if (hasFile) {
        return {
          src: hasFile.realPath,
          isNew: false,
        };
      }
    }

    const pureFileName = arr.slice(0, arr.length - 1).join('.');
    let fileName = currentSign + '.' + file.originalname;
    if (type == 'customPage') {
      fileName = normalizeCustomPageRel(customPathname, file.originalname);
    }
    if (type == 'img' && checkTrue(staticConfigInDB.enableWebp) && compressSuccess) {
      fileName = currentSign + '.' + pureFileName + '.' + compressExt(compressFormat);
    }
    const storedType =
      type == 'img' && checkTrue(staticConfigInDB.enableWebp) && compressSuccess
        ? compressExt(compressFormat)
        : fileType;
    const realPath = await this.saveFile(
      storedType,
      isFavicon ? `favicon.${storedType}` : fileName,
      buf,
      type,
      currentSign,
      isFavicon,
    );
    if (!realPath) {
      throw new HttpException('上传失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return {
      src: realPath,
      isNew: true,
    };
  }
  async importItems(items: Static[]) {
    for (const each of items) {
      const oldItem = await this.getOneBySign(each.sign);
      if (!oldItem) {
        await this.createInDB(each);
      } else {
        this.staticModel.updateOne({ _id: oldItem._id }, { each });
      }
    }
  }
  async fetchImg(link: string): Promise<Buffer | null> {
    const fetched = await this.fetchRemoteImage(link);
    return fetched?.buffer || null;
  }

  async fetchRemoteImage(
    link: string,
  ): Promise<{ buffer: Buffer; contentType?: string } | null> {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (compatible; VanBlog/1.0; +https://vanblog.mereith.com)',
      Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
    };
    const tryGet = async (url: string) => {
      const res = await axios({
        method: 'GET',
        url,
        responseType: 'arraybuffer',
        timeout: 15000,
        maxRedirects: 5,
        headers,
      });
      const contentType = String(res.headers?.['content-type'] || '');
      return {
        buffer: Buffer.isBuffer(res.data) ? res.data : Buffer.from(res.data),
        contentType,
      };
    };
    try {
      return await tryGet(link);
    } catch (err) {
      try {
        return await tryGet(encodeURI(link));
      } catch (retryErr) {
        console.log(retryErr);
        return null;
      }
    }
  }

  async transferRemoteImages(
    content: string,
    opts: { siteHosts?: string[]; siteBaseUrl?: string } = {},
  ): Promise<TransferRemoteResult> {
    const source = content || '';
    if (!source.trim()) {
      return emptyTransferResult(source);
    }
    const stored = await this.getAll('img', 'public');
    const knownRealPaths = (stored || []).map((item) => item.realPath).filter(Boolean);
    const siteHosts = collectSiteHosts(opts.siteBaseUrl, opts.siteHosts);
    const refs = extractImageRefs(source);
    const uniqueUrls = [...new Set(refs.map((ref) => ref.url).filter(Boolean))];
    const transferred: TransferRemoteResult['transferred'] = [];
    const skipped: TransferRemoteResult['skipped'] = [];
    const failed: TransferRemoteResult['failed'] = [];
    const urlMap = new Map<string, string>();

    for (const url of uniqueUrls) {
      const classified = classifyImageUrl(url, { siteHosts, knownRealPaths });
      if (classified.kind === 'skip') {
        skipped.push({ url, reason: classified.reason || 'skip' });
        continue;
      }
      try {
        const fetched = await this.fetchRemoteImage(url);
        if (!fetched || !looksLikeImage(fetched.buffer, fetched.contentType)) {
          failed.push({ url, reason: 'download-failed' });
          continue;
        }
        const originalname = filenameFromRemote(url, fetched.contentType);
        const uploaded = await this.upload(
          { originalname, buffer: fetched.buffer },
          'img',
          false,
          undefined,
          { withWaterMark: true },
        );
        if (!uploaded?.src) {
          failed.push({ url, reason: 'upload-failed' });
          continue;
        }
        urlMap.set(url, uploaded.src);
        transferred.push({ from: url, to: uploaded.src });
      } catch (err) {
        failed.push({ url, reason: 'error' });
      }
    }

    return {
      content: applyImageUrlMap(source, urlMap),
      transferred,
      skipped,
      failed,
    };
  }
  async getImgInfoByLink(link: string) {
    const buffer = await this.fetchImg(link);
    if (!buffer) {
      return null;
    }
    const result = imageSize(buffer);
    const meta: ImgMeta = { ...result, size: formatBytes(buffer.byteLength) };
    const filename = link.split('/').pop();
    const fileType = filename?.split('.')?.pop() || '';
    const currentSign = encryptFileMD5(buffer);
    return {
      meta,
      staticType: 'img' as StaticType,
      storageType: 'picgo' as StorageType,
      fileType: result?.type || fileType,
      realPath: link,
      name: filename,
      sign: currentSign,
    };
  }
  async scanLinksOfArticles() {
    const linkObjs = await this.articleProvder.getAllImageLinks();
    const errorLinks = [];
    let total = 0;
    for (const linkObj of linkObjs) {
      const links = linkObj.links;
      for (const link of links) {
        total = total + 1;
        const dto = await this.getImgInfoByLink(link);
        if (!dto) {
          errorLinks.push({
            artcileId: linkObj.articleId,
            title: linkObj.title,
            link,
          });
        } else {
          const hasPicture = await this.getOneBySign(dto?.sign || '');
          console.log(link, dto);
          if (!hasPicture) {
            await this.createInDB(dto);
          }
        }
      }
    }
    return { total: total, errorLinks };
  }

  async exportAllImg() {
    const storageSetting = await this.settingProvider.getStaticSetting();
    const storageType = storageSetting?.storageType || 'local';
    if (storageType == 'local') {
      const { success, path } = await this.localProvider.exportAllImg();
      if (success && path) {
        return path;
      } else {
        throw new HttpException({ statusCode: 500, message: '打包错误！' }, 500);
      }
    } else {
      throw new NotImplementedException('其他图床暂不支持打包导出！');
    }
  }
  async saveFile(
    fileType: string,
    fileName: string,
    buffer: Buffer,
    type: StaticType,
    sign: string,
    toRootPath?: boolean,
  ) {
    const storageSetting = await this.settingProvider.getStaticSetting();
    let storageType = storageSetting?.storageType || 'local';
    if (type == 'customPage') {
      storageType = 'local';
    }
    switch (storageType) {
      case 'local':
        const { realPath, meta } = await this.localProvider.saveFile(
          fileName,
          buffer,
          type,
          toRootPath,
        );
        if (type != 'customPage') {
          await this.createInDB({
            fileType: (meta as any)?.type || fileType,
            staticType: type,
            storageType: storageType,
            sign,
            name: fileName,
            realPath,
            meta,
          });
        }
        return realPath;
      case 'picgo':
        const picgoRes = await this.picgoProvider.saveFile(fileName, buffer, type);
        await this.createInDB({
          fileType: picgoRes.meta?.type || fileType,
          staticType: type,
          storageType: storageType,
          sign,
          name: fileName,
          realPath: picgoRes.realPath,
          meta: picgoRes.meta,
        });
        return picgoRes.realPath;
    }
  }
  async createInDB(dto: Partial<Static>) {
    const newModal = new this.staticModel(dto);
    return await newModal.save();
  }
  async getOneBySign(sign: string) {
    return await this.staticModel.findOne({ sign }).exec();
  }
  async getAll(type: StaticType, view: 'admin' | 'public') {
    return await this.staticModel.find({ staticType: type }, this.getView(view)).exec();
  }
  async exportAll() {
    return await this.staticModel.find({}, this.getView('public')).exec();
  }
  async getByOption(option: SearchStaticOption) {
    const query: any = {};
    if (option.staticType) {
      query.staticType = option.staticType;
    }
    const paging = sanitizePagination(option.page, option.pageSize);
    const total = await this.staticModel.count(query);
    const items = await this.staticModel
      .find(query, this.getView(option.view))
      .sort({ updatedAt: -1 })
      .limit(paging.pageSize)
      .skip(paging.skip);
    return {
      total,
      data: items,
    };
  }
  async deleteCustomPage(path: string) {
    const folderName = path.replace('/', '');
    // 直接删除文件夹
    await this.localProvider.deleteCustomPageFolder(folderName);
  }

  async getFolderFiles(path: string) {
    return this.localProvider.getFolderFiles(path);
  }
  async getFileContent(path: string, subPath: string) {
    return this.localProvider.getFileContent(path, subPath);
  }
  async createFile(path: string, subPath: string) {
    return this.localProvider.createFile(path, subPath);
  }
  async createFolder(path: string, subPath: string) {
    return this.localProvider.createFolder(path, subPath);
  }
  async updateCustomPageFileContent(pathname: string, filePath: string, content: string) {
    return this.localProvider.updateCustomPageFileContent(pathname, filePath, content);
  }
  async deleteCustomPageFile(pathname: string, filePath: string) {
    return this.localProvider.deleteCustomPageFile(pathname, filePath);
  }

  async deleteOneBySign(sign: string) {
    // 先删除实际上的。
    const toDeleteData = await this.staticModel.findOne({ sign }).exec();
    const storageType = toDeleteData.storageType;
    switch (storageType) {
      case 'local':
        await this.localProvider.deleteFile(toDeleteData.name, toDeleteData.staticType);
        break;
      case 'picgo':
        console.log('实际上只删了数据库，网盘上还有的。');
    }
    return await this.staticModel.deleteOne({ sign }).exec();
  }
  async deleteAllIMG() {
    // 调试用的
    const all = await this.getAll('img', 'admin');
    for (const each of all) {
      await this.deleteOneBySign(each.sign);
    }
  }
}
