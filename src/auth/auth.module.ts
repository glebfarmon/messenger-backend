import {SignUpHook} from '@/auth/sign-up.hook'
import {HashModule} from '@/hash/hash.module'
import {MailModule} from '@/mail/mail.module'
import {MailService} from '@/mail/mail.service'
import {PrismaService} from '@/prisma/prisma.service'
import {Module} from '@nestjs/common'
import {ConfigModule, ConfigService} from '@nestjs/config'
import {AuthModule as BetterAuthModule} from '@thallesp/nestjs-better-auth'
import {prismaAdapter} from 'better-auth/adapters/prisma'
import {betterAuth} from 'better-auth/minimal'
import {haveIBeenPwned} from 'better-auth/plugins'

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
						plugins: [haveIBeenPwned()],
						baseURL: configService.get('API_URL'),
						basePath: '/api/auth',
						secret: configService.get('BETTER_AUTH_SECRET'),
						trustedOrigins: [configService.get('CLIENT_URL')],
						emailAndPassword: {
							enabled: true,
							minPasswordLength: 8,
							maxPasswordLength: 24,
							requireEmailVerification: true
						},
						session: {
							cookieCache: {
								enabled: true,
								maxAge: 5 * 60,
								strategy: 'jwt',
								refreshCache: true
							}
						},
						plugins: [],
						disabledPaths: [
							//'/sign-in/social',
							//'/get-session',
							'/sign-out',
							//'/sign-up/email',
							//'/sign-in/email',
							'/reset-password',
							//'/verify-email',
							//'/send-verification-email',
							'/change-email',
							//'/change-password',
							'/update-user',
							'/delete-user',
							'/request-password-reset',
							'/reset-password',
							'/list-sessions',
							'/revoke-session',
							'/revoke-sessions',
							'/revoke-other-sessions',
							'/link-social',
							'/list-accounts',
							'/delete-user/callback',
							'/unlink-account',
							'/refresh-to'
						],
						emailVerification: {
							sendOnSignUp: true,
							sendVerificationEmail: async ({user, token}) => {
								await mailService.sendVerificationEmail(user, token)
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
		}),
		HashModule
	],
	providers: [PrismaService, SignUpHook]
})
export class AuthModule {}
