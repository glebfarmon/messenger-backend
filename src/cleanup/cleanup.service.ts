import {PrismaService} from '@/prisma/prisma.service'
import {Injectable, Logger} from '@nestjs/common'
import {Cron, CronExpression} from '@nestjs/schedule'

/**
 * Service for cleaning up old records from the database
 */
@Injectable()
export class CleanupService {
	private readonly logger = new Logger(CleanupService.name)

	constructor(private readonly prisma: PrismaService) {}

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
				}
			})

			if (result.count > 0) {
				this.logger.log(`Cleanup completed: deleted ${result.count} records`)
			}
		} catch (error) {
			this.logger.error('Failed to cleanup mail_abuse records', error.stack ?? error)
		}
	}
}
