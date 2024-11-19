import {
  BadRequestException,
  Controller,
  Post,
  ParseFilePipeBuilder,
  UploadedFile,
  UseInterceptors,
  Res,
  HttpStatus,
  Req,
  Get,
  Param,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { Public, Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from '../interface/roles';
import { UploadService } from './upload.service';
import { createReadStream } from 'node:fs';
import { join } from 'node:path';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // @Roles(Role.Admin, Role.User)
  // @Post('/avatar')
  // @UseInterceptors(FileInterceptor('image', {}))
  // async uploadFile(
  //   @CurrentUser() user: User,
  //   @Res() res: Response,
  //   @Req() req: Request,
  //   @UploadedFile(
  //     new ParseFilePipeBuilder()
  //       .addFileTypeValidator({
  //         fileType: 'jpg|png|jpeg',
  //       })
  //       .addMaxSizeValidator({
  //         maxSize: 2048 * 1000,
  //       })
  //       .build(),
  //   )
  //   file: Express.Multer.File,
  // ) {
  //   try {
  //     const url = `https://${req.get('Host')}/api/v1`;
  //     const userModified = await this.uploadService.uploadAvatar(
  //       file,
  //       user,
  //       url,
  //     );
  //     res
  //       .status(HttpStatus.CREATED)
  //       .json({ msg: 'Success', data: userModified });
  //   } catch (err) {
  //     throw new BadRequestException('Failed to upload File', {
  //       cause: err,
  //       description: err,
  //     });
  //   }
  // }

  @Roles(Role.Admin, Role.Booth, Role.User)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async uploadImages(
    @Res() res: Response,
    @Req() req: Request,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'jpg|png|jpeg|webp',
        })
        .addMaxSizeValidator({
          maxSize: 2048 * 1000,
        })
        .build(),
    )
    file: Express.Multer.File,
  ) {
    try {
      const url = process.env.UPLOAD_DOMAIN;

      const imgUrl = await this.uploadService.uploadAny(file, url);
      if (!imgUrl) {
        throw new BadRequestException('Image upload failed, no URL returned.');
      }

      res.status(HttpStatus.CREATED).json({ message: 'Success', url: imgUrl });
    } catch (err) {
      throw new BadRequestException('Failed to upload File', {
        cause: err,
        description: err,
      });
    }
  }

  @Public()
  @Get(':imgpath')
  async seeUploadedFile(@Param('imgpath') image: string) {
    const filePath = join(process.cwd(), './data', image);
    const file = createReadStream(filePath);

    const ext = image.split('.').pop()?.toLowerCase();
    const contentType =
      ext === 'png'
        ? 'image/png'
        : ext === 'webp'
          ? 'image/webp'
          : ext === 'jpg' || ext === 'jpeg'
            ? 'image/jpeg'
            : 'application/octet-stream';

    return new StreamableFile(file, {
      type: contentType,
      disposition: 'inline',
    });
  }
}
