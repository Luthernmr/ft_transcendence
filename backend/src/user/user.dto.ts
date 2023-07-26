import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  password: string;
}

export class twoFaCodeDto {
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(6)
  @IsString()
  twoFaCode: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  nickname: string;
  //@Length(4,20)

  @IsEmail()
  @IsNotEmpty()
  email: string;

  // @IsString()
  // @IsNotEmpty()
  // @MinLength(2)
  // @MaxLength(50)
  // @Matches(
  // 	/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
  // 	message: 'The password must have a Uppercase, lowercase letter and a number'
  // })
  password: string;
}
