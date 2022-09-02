import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AboutDto } from 'src/types/about.dto';
import { LinkItem } from 'src/types/link.dto';
import { MenuItem } from 'src/types/menu.dto';
import { RewardItem } from 'src/types/reward.dto';
import { SiteInfo } from 'src/types/site.dto';
import { SocialItem } from 'src/types/social.dto';

export type MetaDocument = Meta & Document;

@Schema()
export class Meta extends Document {
  @Prop({ default: [] })
  links: LinkItem[];

  @Prop({ default: [] })
  socials: SocialItem[];

  @Prop({ default: [] })
  menus: MenuItem[];

  @Prop({ default: [] })
  rewards: RewardItem[];

  @Prop({
    default: { updatedAt: new Date(), content: '' },
  })
  about: AboutDto;

  @Prop()
  siteInfo: SiteInfo;

  @Prop({ default: 0 })
  viewer: number;

  @Prop({ default: 0 })
  visited: number;

  @Prop({ default: [] })
  categories: string[];

  @Prop({ default: 0 })
  totalWordCount: number;
}

export const MetaSchema = SchemaFactory.createForClass(Meta);
