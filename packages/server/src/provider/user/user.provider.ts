import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateUserDto } from 'src/types/user.dto';
import { User, UserDocument } from 'src/scheme/user.schema';
import { Collaborator } from 'src/types/collaborator';
import { encryptPassword, makeSalt, washPassword } from 'src/utils/crypto';

@Injectable()
export class UserProvider {
  logger = new Logger(UserProvider.name);
  constructor(@InjectModel('User') private userModel: Model<UserDocument>) {}
  async getUser(isList?: boolean) {
    if (isList) {
      return await this.userModel.findOne({ id: 0 }, { id: 1, name: 1, nickname: 1 });
    }
    return await this.userModel.findOne({ id: 0 }).exec();
  }
  async washUserWithSalt() {
    // 如果没加盐的老版本，给改成带加盐的。
    const users = await this.userModel.find({
      $or: [
        {
          salt: '',
        },
        {
          salt: { $exists: false },
        },
      ],
    });
    if (users && users.length > 0) {
      this.logger.log(`老版本清洗密码未加盐用户 ${users.length} 人`);
      for (const user of users) {
        const salt = makeSalt();
        const newPassword = washPassword(user.name, user.password, salt);
        await this.userModel.updateOne({ id: user.id }, { password: newPassword, salt });
      }
    }
  }

  async validateUser(name: string, password: string) {
    const user = await this.userModel.findOne({ name });
    if (!user) {
      return null;
    } else {
      const result = await this.userModel
        .findOne({ name, password: encryptPassword(name, password, user.salt) })
        .exec();
      if (result) {
        this.updateSalt(result, password);
      }
      return result;
    }
  }

  async updateSalt(user: User, passwordInput: string) {
    const newSalt = makeSalt();
    await this.userModel.updateOne(
      { id: user.id },
      {
        salt: newSalt,
        password: encryptPassword(user.name, passwordInput, newSalt),
      },
    );
  }

  async updateUser(updateUserDto: UpdateUserDto) {
    const currUser = await this.getUser();

    if (!currUser) {
      throw new NotFoundException();
    } else {
      return this.userModel
        .updateOne(
          { id: currUser.id },
          {
            ...updateUserDto,
            password: encryptPassword(updateUserDto.name, updateUserDto.password, currUser.salt),
          },
        )
        .exec();
    }
  }
  async getNewId() {
    const [lastUser] = await this.userModel.find({}).sort({ id: -1 }).limit(1);
    if (!lastUser) {
      return 1;
    } else {
      return lastUser.id + 1;
    }
  }
  async getCollaboratorByName(name: string) {
    return await this.userModel.findOne({ name: name, type: 'collaborator' });
  }
  async getCollaboratorById(id: number) {
    return await this.userModel.findOne({ id, type: 'collaborator' });
  }
  async getAllCollaborators(isList?: boolean) {
    if (isList) {
      return await this.userModel.find(
        { type: 'collaborator' },
        { id: 1, name: 1, nickname: 1, _id: 0 },
      );
    }
    return await this.userModel.find({ type: 'collaborator' }, { salt: 0, password: 0, _id: 0 });
  }

  async createCollaborator(collaboratorDto: Collaborator) {
    const { name } = collaboratorDto;
    const oldData = await this.getCollaboratorByName(name);
    if (oldData) {
      throw new ForbiddenException('已有为该用户名的协作者，不可重复创建！');
    }
    const salt = makeSalt();
    return await this.userModel.create({
      id: await this.getNewId(),
      type: 'collaborator',
      ...collaboratorDto,
      password: encryptPassword(collaboratorDto.name, collaboratorDto.password, salt),
      salt,
    });
  }
  async updateCollaborator(collaboratorDto: Collaborator) {
    const { name } = collaboratorDto;
    const oldData = await this.getCollaboratorByName(name);
    if (!oldData) {
      throw new ForbiddenException('没有此协作者！无法更新！');
    }
    const salt = makeSalt();
    return await this.userModel.updateOne(
      {
        id: oldData.id,
        type: 'collaborator',
      },
      {
        ...collaboratorDto,
        password: encryptPassword(collaboratorDto.name, collaboratorDto.password, salt),
        salt,
      },
    );
  }
  async deleteCollaborator(id: number) {
    await this.userModel.deleteOne({ id: id, type: 'collaborator' });
  }
}
