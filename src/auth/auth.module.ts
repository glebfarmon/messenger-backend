import {Module} from '@nestjs/common'
import {ConfigModule, ConfigService} from '@nestjs/config'
import {AuthModule as BetterAuthModule} from '@thallesp/nestjs-better-auth'
import {betterAuth} from 'better-auth'
import {prismaAdapter} from 'better-auth/adapters/prisma'
import {PrismaService} from '../prisma/prisma.service'

@Module({
	imports: [
		BetterAuthModule.forRootAsync({
			imports: [ConfigModule],
			inject: [PrismaService, ConfigService],
			useFactory: (prismaService: PrismaService, configService: ConfigService) => {
				return {
					auth: betterAuth({
						database: prismaAdapter(prismaService, {
							provider: 'postgresql'
						}),
						baseURL: configService.get('API_URL'),
						basePath: '/api/auth',
						secret: configService.get('BETTER_AUTH_SECRET'),
						emailAndPassword: {enabled: true},
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
