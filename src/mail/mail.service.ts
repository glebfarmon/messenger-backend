import {PrismaService} from '@/prisma/prisma.service'
import {HttpException, HttpStatus, Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import * as fs from 'fs'
import {ResendService} from 'nestjs-resend'
import * as path from 'path'

@Injectable()
export class MailService {
	constructor(
		private prismaService: PrismaService,
		private resendService: ResendService,
		private configService: ConfigService
	) {}

	async sendVerificationEmail(user: {name: string; email?: string}, token: string) {
		const isVerified = await this.prismaService.user.findUnique({
			where: {
				email: user.email
			}
		})

		if (!isVerified || isVerified.emailVerified) {
			throw new HttpException(
				{message: 'Email already sent. Try later', code: 'EMAIL_ABUSE_24H'},
				HttpStatus.TOO_MANY_REQUESTS
			)
		}

		await this.killAbuse(user.email)

		const url = new URL('/auth/email-verification', this.configService.get('CLIENT_URL'))
		url.searchParams.set('token', token)

		// Read HTML template
		const templatePath = path.join(process.cwd(), 'emails', 'email-verification.html')
		let htmlTemplate = fs.readFileSync(templatePath, 'utf-8')

		// Replace placeholders with actual data
		htmlTemplate = htmlTemplate
			.replace(/{{userName}}/g, user.name || user.email)
			.replace(/{{verificationUrl}}/g, url.toString())

		this.sendMail(user.email, 'Verify your email', htmlTemplate)
	}

	private async killAbuse(email: string) {
		const record = await this.prismaService.mailAbuse.findUnique({
			where: {
				email
			}
		})

		if (record) {
			if (record.count >= 3) {
				throw new HttpException(
					{message: 'Email already sent. Try later', code: 'EMAIL_ABUSE_24H'},
					HttpStatus.TOO_MANY_REQUESTS
				)
			}

			const now = new Date()

			const diffSec = (now.getTime() - record.lastSent.getTime()) / 1000
			if (diffSec < 60) {
				throw new HttpException(
					{message: 'Email already sent. Try again in 1 minute', code: 'EMAIL_ABUSE_1M'},
					HttpStatus.TOO_MANY_REQUESTS
				)
			}

			return this.prismaService.mailAbuse.update({
				data: {
					count: record.count + 1
				},
				where: {
					email
				}
			})
		} else {
			return this.prismaService.mailAbuse.create({
				data: {
					email
				}
			})
		}
	}

	private async sendMail(email: string, subject: string, html: string) {
		this.resendService.emails.send({
			from: `${this.configService.get('RESEND_TITLE')} <${this.configService.get('RESEND_MAIL')}>`,
			to: email,
			subject,
			html
		})
	}
}
