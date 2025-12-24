import {HashModule} from '@/hash/hash.module'
import {Module} from '@nestjs/common'
import {ConfigModule, ConfigService} from '@nestjs/config'
import {ResendModule} from 'nestjs-resend'
import {MailController} from './mail.controller'
import {MailService} from './mail.service'

@Module({
	imports: [
		ResendModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				return {
					apiKey: configService.get('RESEND')
				}
			}
		}),
		HashModule
	],
	providers: [MailService],
	exports: [MailService],
	controllers: [MailController]
})
export class MailModule {}
