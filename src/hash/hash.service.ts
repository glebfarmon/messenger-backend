import {HttpException, HttpStatus, Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import * as Cryptr from 'cryptr'

@Injectable()
export class HashService {
	private cryptr: Cryptr

	constructor(private configService: ConfigService) {
		const secretKey = this.configService.get<string>('CRYPTR_SECRET')
		if (!secretKey)
			throw new HttpException(
				'Cryptr module cannot be initialized',
				HttpStatus.INTERNAL_SERVER_ERROR
			)
		this.cryptr = new Cryptr(secretKey)
	}

	async encrypt(data: string): Promise<string> {
		return this.cryptr.encrypt(data)
	}

	async decrypt(data: string): Promise<string> {
		try {
			return this.cryptr.decrypt(data)
		} catch (e) {
			return null
		}
	}
}
