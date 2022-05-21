import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { LinkItem } from 'src/dto/link.dto';
import { RewardItem } from 'src/dto/reward.dto';
import { SiteInfo } from 'src/dto/site.dto';
import { SocialItem } from 'src/dto/social.dto';

export type MetaDocument = Meta & Document;

@Schema()
export class Meta extends Document {
  @Prop({ default: [] })
  links: LinkItem[];

  @Prop({ default: [] })
  socials: SocialItem[];

  @Prop({ default: [] })
  rewards: RewardItem[];

  @Prop({
    default: { updatedAt: new Date(), content: '' },
  })
  about: {
    updatedAt: Date;
    content: string;
  };

  @Prop()
  siteInfo: SiteInfo;

  @Prop({ default: [] })
  categories: string[];
}

export const MetaSchema = SchemaFactory.createForClass(Meta);
