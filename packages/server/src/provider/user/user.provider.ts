import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateUserDto } from 'src/dto/user.dto';
import { UserDocument } from 'src/scheme/user.schema';

@Injectable()
export class UserProvider {
  constructor(@InjectModel('User') private userModel: Model<UserDocument>) {}
  async getUser() {
    return await this.userModel.findOne().exec();
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
}
