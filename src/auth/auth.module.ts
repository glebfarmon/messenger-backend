import {SignUpHook} from '@/auth/sign-up.hook'
import {HashModule} from '@/hash/hash.module'
import {MailModule} from '@/mail/mail.module'
import {MailService} from '@/mail/mail.service'
import {PrismaService} from '@/prisma/prisma.service'
import {Module} from '@nestjs/common'
import {ConfigModule, ConfigService} from '@nestjs/config'
import {AuthModule as BetterAuthModule} from '@thallesp/nestjs-better-auth'
import {betterAuth} from 'better-auth'
import {prismaAdapter} from 'better-auth/adapters/prisma'

@Module({
	imports: [
		BetterAuthModule.forRootAsync({
			imports: [ConfigModule, MailModule],
			inject: [PrismaService, ConfigService, MailService],
			useFactory: (
				prismaService: PrismaService,
				configService: ConfigService,
				mailService: MailService
			) => {
				return {
					auth: betterAuth({
						database: prismaAdapter(prismaService, {
							provider: 'postgresql'
						}),
						hooks: {},
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
								await mailService.sendVerificationEmail(user, token)
							}
						},
						//TODO FIX ABUSE IN PROD
						//CRON
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
		}),
		HashModule
	],
	providers: [PrismaService, SignUpHook]
})
export class AuthModule {}
