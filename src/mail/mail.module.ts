import {Module} from '@nestjs/common'
import {ConfigModule, ConfigService} from '@nestjs/config'
import {ResendModule} from 'nestjs-resend'

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
		})
	]
})
export class MailModule {}
