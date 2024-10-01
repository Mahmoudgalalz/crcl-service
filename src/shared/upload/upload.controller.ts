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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { Public, Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from '../interface/roles';
import { UploadService } from './upload.service';

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

  @Roles(Role.Admin)
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
      const url = `https://${req.get('Host')}/`;
      const imgUrl = await this.uploadService.uploadAny(file, url);
      if (!imgUrl) {
        throw new BadRequestException('Image upload failed, no URL returned.');
      }

      res.status(HttpStatus.CREATED).json({ message: 'Success', imgUrl });
    } catch (err) {
      throw new BadRequestException('Failed to upload File', {
        cause: err,
        description: err,
      });
    }
  }

  @Public()
  @Get(':imgpath')
  async seeUploadedFile(@Param('imgpath') image: string, @Res() res: Response) {
    return res.sendFile(image, { root: './data' });
  }
}
