import {AuthModule} from '@/auth/auth.module'
import {Module} from '@nestjs/common'
import {ConfigModule} from '@nestjs/config'
import {PrismaModule} from './prisma/prisma.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true
		}),
		PrismaModule,
		AuthModule
	],
	controllers: []
})
export class AppModule {}
