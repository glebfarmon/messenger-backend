import {MailModule} from '@/mail/mail.module'
import {Module} from '@nestjs/common'
import {ConfigModule, ConfigService} from '@nestjs/config'
import {AuthModule as BetterAuthModule} from '@thallesp/nestjs-better-auth'
import {betterAuth} from 'better-auth'
import {prismaAdapter} from 'better-auth/adapters/prisma'
import * as fs from 'fs'
import {ResendService} from 'nestjs-resend'
import * as path from 'path'
import {PrismaService} from '../prisma/prisma.service'

@Module({
	imports: [
		BetterAuthModule.forRootAsync({
			imports: [ConfigModule, MailModule],
			inject: [PrismaService, ConfigService, ResendService],
			useFactory: (
				prismaService: PrismaService,
				configService: ConfigService,
				resendService: ResendService
			) => {
				return {
					auth: betterAuth({
						database: prismaAdapter(prismaService, {
							provider: 'postgresql'
						}),
						baseURL: configService.get('API_URL'),
						basePath: '/api/auth',
						secret: configService.get('BETTER_AUTH_SECRET'),
						emailAndPassword: {
							enabled: true,
							minPasswordLength: 8,
							maxPasswordLength: 24,
							requireEmailVerification: true
						},
						emailVerification: {
							sendOnSignUp: true,
							sendVerificationEmail: async ({user, token}) => {
								// Read HTML template
								const templatePath = path.join(process.cwd(), 'emails', 'email-verification.html')
								let htmlTemplate = fs.readFileSync(templatePath, 'utf-8')
								const url = `${configService.get('CLIENT_URL')}/auth/email-verification?token=${token}`

								// Replace placeholders with actual data
								htmlTemplate = htmlTemplate
									.replace(/{{userName}}/g, user.name || user.email)
									.replace(/{{verificationUrl}}/g, url)

								resendService.emails.send({
									from: `${configService.get('RESEND_TITLE')} <${configService.get('RESEND_MAIL')}>`,
									to: user.email,
									subject: 'Verify your email',
									html: htmlTemplate
								})
							}
						},
						//TODO FIX ABUSE IN PROD
						rateLimit: {
							enabled: true,
							max: 70,
							window: 60
						}
					}),
					middleware: (req, _res, next) => {
						req.url = req.originalUrl
						req.baseUrl = ''
						next()
					}
				}
			}
		})
	],
	providers: [PrismaService]
})
export class AuthModule {}
