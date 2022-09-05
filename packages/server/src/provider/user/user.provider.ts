import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateUserDto } from 'src/types/user.dto';
import { UserDocument } from 'src/scheme/user.schema';
import { Collaborator } from 'src/types/collaborator';

@Injectable()
export class UserProvider {
  constructor(@InjectModel('User') private userModel: Model<UserDocument>) {}
  async getUser(isList?: boolean) {
    if (isList) {
      return await this.userModel.findOne(
        { id: 0 },
        { id: 1, name: 1, nickname: 1 },
      );
    }
    return await this.userModel.findOne({ id: 0 }).exec();
  }
  async validateUser(name: string, password: string) {
    return await this.userModel.findOne({ name, password }).exec();
  }
  async updateUser(updateUserDto: UpdateUserDto) {
    const currUser = await this.getUser();

    if (!currUser) {
      throw new NotFoundException();
    } else {
      return this.userModel
        .updateOne({ id: currUser.id }, updateUserDto)
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
        { id: 1, name: 1, nickname: 1 },
      );
    }
    return await this.userModel.find({ type: 'collaborator' });
  }

  async createCollaborator(collaboratorDto: Collaborator) {
    const { name } = collaboratorDto;
    const oldData = await this.getCollaboratorByName(name);
    if (oldData) {
      throw new ForbiddenException('已有为该用户名的协作者，不可重复创建！');
    }

    return await this.userModel.create({
      id: await this.getNewId(),
      type: 'collaborator',
      ...collaboratorDto,
    });
  }
  async updateCollaborator(collaboratorDto: Collaborator) {
    const { name } = collaboratorDto;
    const oldData = await this.getCollaboratorByName(name);
    if (!oldData) {
      throw new ForbiddenException('没有此协作者！无法更新！');
    }

    return await this.userModel.updateOne(
      {
        id: oldData.id,
        type: 'collaborator',
      },
      {
        ...collaboratorDto,
      },
    );
  }
  async deleteCollaborator(id: number) {
    await this.userModel.deleteOne({ id: id, type: 'collaborator' });
  }
}
