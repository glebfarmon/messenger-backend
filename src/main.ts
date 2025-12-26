import {ValidationPipe} from '@nestjs/common'
import {NestFactory} from '@nestjs/core'
import * as cookieParser from 'cookie-parser'
import {AppModule} from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		bodyParser: false
	})

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
			forbidNonWhitelisted: true,
			stopAtFirstError: true
		})
	)

	app.setGlobalPrefix('api')
	app.enableCors({credentials: true, origin: [process.env.CLIENT_URL]})
	app.enableShutdownHooks()
	app.use(cookieParser())

	await app.listen(process.env.PORT || 3001, process.env.HOST || 'localhost')
}

bootstrap()
