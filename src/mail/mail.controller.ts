import {HashService} from '@/hash/hash.service'
import {MailService} from '@/mail/mail.service'
import {Controller, HttpCode, HttpException, HttpStatus, Param, Post} from '@nestjs/common'
import {AllowAnonymous, AuthService} from '@thallesp/nestjs-better-auth'

@Controller('mail/resend')
export class MailController {
	constructor(
		private authService: AuthService,
		private mailService: MailService,
		private hashService: HashService
	) {}

	@HttpCode(HttpStatus.OK)
	@AllowAnonymous()
	@Post('verify-email/:hashEmail')
	async verificationEmail(@Param('hashEmail') hashEmail: string) {
		const email = await this.hashService.decrypt(hashEmail)
		if (!email)
			throw new HttpException(
				{message: 'Invalid email', code: 'INVALID_EMAIL'},
				HttpStatus.BAD_REQUEST
			)
		return this.authService.api.sendVerificationEmail({body: {email}})
	}
}
