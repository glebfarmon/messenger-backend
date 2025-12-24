import {AuthModule} from '@/auth/auth.module'
import {Module} from '@nestjs/common'
import {ConfigModule} from '@nestjs/config'
import {MailModule} from './mail/mail.module'
import {PrismaModule} from './prisma/prisma.module'
import {HashModule} from './hash/hash.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true
		}),
		PrismaModule,
		AuthModule,
		MailModule,
		HashModule
	],
	controllers: []
})
export class AppModule {}
