import {HashService} from '@/hash/hash.service'
import {Injectable} from '@nestjs/common'
import {AfterHook, AuthHookContext, Hook} from '@thallesp/nestjs-better-auth'

/**
 * Handles post sign-up hooks for email registrations.
 */
@Hook()
@Injectable()
export class SignUpHook {
	constructor(private hashService: HashService) {}
	/**
	 * Executes after successful email sign-up and adds a test message to the response.
	 */
	@AfterHook('/sign-up/email')
	async handle(ctx: AuthHookContext) {
		const response = ctx.context.returned

		// Check if sign-up was successful by verifying response contains user
		if (
			response &&
			typeof response === 'object' &&
			!('error' in response) &&
			'user' in response &&
			response.user &&
			typeof response.user === 'object' &&
			'email' in response.user &&
			typeof response.user.email === 'string'
		) {
			// Modify the response directly
			const modifiedResponse = {
				...response,
				hashedEmail: await this.hashService.encrypt(response.user.email)
			}

			// Update context.returned directly
			ctx.context.returned = modifiedResponse

			// Return the modified response
			return {response: modifiedResponse}
		}
	}
}
