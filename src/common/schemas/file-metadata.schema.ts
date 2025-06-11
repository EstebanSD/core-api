import { Prop, Schema } from '@nestjs/mongoose';
import { FileMetadata } from 'src/types/interfaces';

@Schema({ _id: false })
export class FileMetadataSchema implements FileMetadata {
  @Prop({ required: true })
  publicId: string;

  @Prop({ required: true })
  url: string;
}
