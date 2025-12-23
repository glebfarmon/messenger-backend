import {AuthModule} from '@/auth/auth.module'
import {Module} from '@nestjs/common'
import {ConfigModule} from '@nestjs/config'
import {MailModule} from './mail/mail.module'
import {PrismaModule} from './prisma/prisma.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true
		}),
		PrismaModule,
		AuthModule,
		MailModule
	],
	controllers: []
})
export class AppModule {}
