import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { writeFile } from 'node:fs/promises';
import { join } from 'path';

@Injectable()
export class UploadService {
  private dirPath = (hash: string) => {
    return join(__dirname, '../../..', '../data', hash);
  };

  constructor() {}

  // async uploadAvatar(file: Express.Multer.File, user: User, url: string) {
  //   const { originalname } = file;
  //   const ext = originalname.split('.')[1];
  //   const hash = `${String(crypto.randomUUID().slice(0, 12) + '.' + ext)}`;
  //   const fileUrl = `${url}/upload/${hash}`;
  //   writeFileSync(join(__dirname, '..', '../data', hash), file.buffer);

  //   const update = await this.userSerivce.updateUser({
  //     where: { id: user.id },
  //     data: {
  //       avatar: fileUrl,
  //     },
  //   });
  //   return update;
  // }

  async uploadAny(file: Express.Multer.File, url: string): Promise<string> {
    const { originalname } = file;
    const ext = originalname.split('.').pop();
    const hash = `${crypto.randomUUID().slice(0, 12)}.${ext}`;
    const fileUrl = `${url}/upload/${hash}`;

    try {
      await writeFile(this.dirPath(hash), file.buffer);
    } catch (err) {
      Logger.log(err);
      throw new BadRequestException('Failed to upload file. Please try again.');
    }

    return fileUrl;
  }
}
