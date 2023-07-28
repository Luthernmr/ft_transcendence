import {
	IsEmail,
	IsNotEmpty,
	IsString,
	Length,
	Matches,
	MaxLength,
	Min,
	MinLength,
	IsAlpha,
	IsNumberString
} from 'class-validator';

export class LoginDto {
	@IsEmail()
	email: string;

	@IsString()
	@IsNotEmpty()
	@Length(1, 20)
	password: string;
}

export class TwoFaCodeDto {
	@IsNotEmpty()
	@MinLength(6)
	@MaxLength(6)
	@IsString()
	@IsNumberString()
	twoFaCode: string;
}

export class NicknameDto {
	@IsString()
	@IsNotEmpty()
	@Length(4,20)
	@Matches(RegExp('^[A-Za-zıöüçğşİÖÜÇĞŞñÑáéíóúÁÉÍÓÚ ]+$'))
	nickname: string;
}
export class RegisterDto {
	@IsString()
	@IsNotEmpty()
	@Length(4,20)
	@Matches(RegExp('^[A-Za-zıöüçğşİÖÜÇĞŞñÑáéíóúÁÉÍÓÚ ]+$'))
	nickname: string;

	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(2)
	@MaxLength(50)
	@Matches(
		/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: 'The password must have a Uppercase, lowercase letter and a number'
	})
	password: string;
}
