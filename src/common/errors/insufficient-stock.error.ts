/**
 * Domain error thrown by the data layer when a stock decrement cannot be
 * satisfied. Service layer maps it to the appropriate HTTP exception.
 */
export class InsufficientStockError extends Error {
  constructor(public readonly productId: number) {
    super(`Not enough quantity for productId: ${productId}`);
    this.name = 'InsufficientStockError';
  }
}
