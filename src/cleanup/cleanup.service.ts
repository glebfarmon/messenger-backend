import {PrismaService} from '@/prisma/prisma.service'
import {Injectable, Logger} from '@nestjs/common'
import {Cron, CronExpression} from '@nestjs/schedule'

/**
 * Service for cleaning up old records from the database
 */
@Injectable()
export class CleanupService {
	private readonly logger = new Logger(CleanupService.name)

	constructor(private prisma: PrismaService) {}

	/**
	 * Delete mail_abuse records older than 24 hours
	 * Runs every 3 hours
	 */
	@Cron(CronExpression.EVERY_3_HOURS)
	async cleanupExpiredMailAbuseRecords() {
		try {
			const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

			const result = await this.prisma.mailAbuse.deleteMany({
				where: {
					createdAt: {
						lt: twentyFourHoursAgo
					}
				},
				limit: 500
			})

			if (result.count > 0) {
				this.logger.log(`[CRON MAIL ABUSE] Cleanup completed: deleted ${result.count} records`)
			}
		} catch (error) {
			this.logger.error(
				'[CRON MAIL ABUSE] Failed to cleanup mail_abuse records',
				error.stack ?? error
			)
		}
	}

	/**
	 * Delete unverified user accounts older than 24 hours
	 * Runs every 3 hours
	 */
	@Cron(CronExpression.EVERY_3_HOURS)
	async cleanupUnverifiedAccounts() {
		try {
			const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

			const result = await this.prisma.user.deleteMany({
				where: {
					emailVerified: false,
					createdAt: {
						lt: twentyFourHoursAgo
					}
				},
				limit: 500
			})

			if (result.count > 0) {
				this.logger.log(
					`[CRON ACCOUNTS] Cleanup completed: deleted ${result.count} unverified user accounts older than 24 hours`
				)
			}
		} catch (error) {
			this.logger.error(
				'[CRON ACCOUNTS] Failed to cleanup unverified accounts',
				error.stack ?? error
			)
		}
	}
}
