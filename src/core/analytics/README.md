# Analytics Module

Dual-provider analytics tracking (Google Analytics 4 + Facebook Pixel) for ecommerce events.

## Files

- **`eventModels.js`** - Event class definitions (PurchaseEvent, AddToCartEvent, etc.)
- **`facebookPixel.js`** - Facebook Pixel integration utilities
- **`eventModels.test.js`** - Unit tests for event models (21 tests)
- **`facebookPixel.test.js`** - Unit tests for Facebook Pixel (18 tests)
- **`dualProvider.test.js`** - Integration tests for dual-provider flow (12 tests)

## Usage

```javascript
import { gtmPurchaseEvent } from '../utils/gtm';

// Events automatically sent to both GA4 and Facebook
gtmPurchaseEvent('purchase', orderData);
```

## Testing

```bash
# Run all analytics tests
npx vitest run src/core/analytics

# Run with coverage
npx vitest run src/core/analytics --coverage

# Watch mode
npx vitest src/core/analytics
```

## Documentation

See `FACEBOOK_EVENTS_IMPLEMENTATION.md` in project root for complete documentation.
