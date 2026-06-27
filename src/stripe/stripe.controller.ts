import { BadRequestException, Controller, Headers, HttpCode, Post, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { StripeService } from './stripe.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Public()
  @Post('webhook')
  @HttpCode(200)
  handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    //TODO: this condition should be part of stripeService. Controllers just calling handler functions but don't have any logic inside
    if (!signature) {
      throw new BadRequestException('Stripe signature is missing');
    }

    return this.stripeService.handleWebhook(req.rawBody, signature);
  }
}
