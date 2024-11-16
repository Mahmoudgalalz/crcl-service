import { IsArray } from 'class-validator';

export class addUsersNotifiaction {
  @IsArray()
  usersIds: string[];
}
