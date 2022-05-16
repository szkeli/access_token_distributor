import { IsNotEmpty } from 'class-validator';

export class MainDTO {
  @IsNotEmpty({ message: 'APPID 不能为空' })
  readonly appId: string;
  @IsNotEmpty({ message: 'SECRET 不能为空' })
  readonly secret: string;
}
