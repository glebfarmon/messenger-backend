import {AuthModule} from '@/auth/auth.module'
import {Module} from '@nestjs/common'
import {ConfigModule} from '@nestjs/config'
import {ScheduleModule} from '@nestjs/schedule'
import {CleanupModule} from './cleanup/cleanup.module'
import {HashModule} from './hash/hash.module'
import {MailModule} from './mail/mail.module'
import {PrismaModule} from './prisma/prisma.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true
		}),
		ScheduleModule.forRoot(),
		PrismaModule,
		AuthModule,
		MailModule,
		HashModule,
		CleanupModule
	],
	controllers: []
})
export class AppModule {}
