import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { LinkItem } from 'src/dto/link.dto';
import { RewardItem } from 'src/dto/reward.dto';
import { SiteInfo } from 'src/dto/site.dto';
import { SocialItem } from 'src/dto/social.dto';

export type MetaDocument = Meta & Document;

@Schema()
export class Meta extends Document {
  @Prop()
  id: number;

  @Prop()
  links: LinkItem[];

  @Prop()
  socials: SocialItem[];

  @Prop()
  rewards: RewardItem[];

  @Prop()
  about: {
    createdAt: Date;
    updatedAt: Date;
    content: string;
  };

  @Prop()
  siteInfo: SiteInfo;

  @Prop()
  categories: string[];
}

export const MetaSchema = SchemaFactory.createForClass(Meta);
