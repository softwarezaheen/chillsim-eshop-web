// Enhanced Stripe Payment Component with Apple Pay Diagnostics
// Add this code to StripePayment.jsx for debugging

import { useEffect } from 'react';

// Add this to the InjectedCheckout component
const InjectedCheckout = ({ orderDetail }) => {
  const { t } = useTranslation();
  const { iccid } = useParams();
  const elements = useElements({ locale: localStorage.getItem("i18nextLng") });
  const stripe = useStripe();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ... your existing code ...

  // ⚠️ ADD THIS: Comprehensive Apple Pay diagnostics
  useEffect(() => {
    const runDiagnostics = async () => {
      console.group('🍎 Apple Pay Diagnostic Report');
      console.log('Timestamp:', new Date().toISOString());
      
      // 1. Environment Check
      console.group('📍 Environment');
      console.log('Protocol:', window.location.protocol);
      console.log('Hostname:', window.location.hostname);
      console.log('Full URL:', window.location.href);
      console.log('User Agent:', navigator.userAgent);
      console.groupEnd();
      
      // 2. HTTPS Check
      console.group('🔒 Security');
      const isHTTPS = window.location.protocol === 'https:';
      console.log('HTTPS Enabled:', isHTTPS ? '✅' : '❌');
      if (!isHTTPS && !window.location.hostname.includes('localhost')) {
        console.warn('⚠️ Apple Pay requires HTTPS in production!');
      }
      console.groupEnd();
      
      // 3. Stripe SDK Check
      console.group('💳 Stripe SDK');
      console.log('Stripe loaded:', stripe ? '✅' : '❌');
      console.log('Elements loaded:', elements ? '✅' : '❌');
      if (stripe) {
        console.log('Stripe instance:', stripe);
      }
      console.groupEnd();
      
      // 4. Apple Pay API Check
      console.group('🍎 Apple Pay API');
      if (window.ApplePaySession) {
        console.log('API Available:', '✅');
        
        try {
          const canMakePayments = ApplePaySession.canMakePayments();
          console.log('Can Make Payments:', canMakePayments ? '✅' : '❌');
          
          const supportsVersion3 = ApplePaySession.supportsVersion(3);
          console.log('Supports Version 3:', supportsVersion3 ? '✅' : '❌');
          
          if (!canMakePayments) {
            console.warn('⚠️ User has no cards in Apple Wallet or device doesn\'t support Apple Pay');
          }
        } catch (error) {
          console.error('Error checking Apple Pay:', error);
        }
      } else {
        console.log('API Available:', '❌');
        console.warn('⚠️ Apple Pay API not available');
        console.log('Possible reasons:');
        console.log('  • Not using Safari browser');
        console.log('  • Device doesn\'t support Apple Pay');
        console.log('  • iOS version too old (need iOS 10.1+)');
      }
      console.groupEnd();
      
      // 5. Payment Element Check
      console.group('📝 Payment Element');
      if (elements) {
        try {
          const paymentElement = elements.getElement('payment');
          console.log('Payment Element mounted:', paymentElement ? '✅' : '❌');
        } catch (error) {
          console.log('Payment Element error:', error.message);
        }
      } else {
        console.log('Elements not yet initialized');
      }
      console.groupEnd();
      
      // 6. Browser Compatibility Check
      console.group('🌐 Browser Compatibility');
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isMac = /Macintosh/.test(navigator.userAgent);
      
      console.log('Safari:', isSafari ? '✅' : '❌');
      console.log('iOS:', isIOS ? '✅' : '❌');
      console.log('macOS:', isMac ? '✅' : '❌');
      
      if (!isSafari && !isIOS) {
        console.warn('⚠️ Apple Pay works best on Safari or iOS browsers');
      }
      console.groupEnd();
      
      // 7. Summary
      console.group('📊 Summary');
      const allGood = 
        isHTTPS &&
        !!stripe &&
        !!elements &&
        !!window.ApplePaySession &&
        (isSafari || isIOS);
      
      if (allGood) {
        console.log('%c✅ All checks passed! Apple Pay should be available.', 'color: green; font-weight: bold');
      } else {
        console.log('%c⚠️ Some checks failed. Apple Pay may not be available.', 'color: orange; font-weight: bold');
        console.log('Review the diagnostic report above for details.');
      }
      console.groupEnd();
      
      console.groupEnd(); // End main diagnostic group
    };
    
    if (stripe && elements) {
      runDiagnostics();
    }
  }, [stripe, elements]);

  // ... rest of your existing code ...
};

// Example of what you'll see in console:
/*
🍎 Apple Pay Diagnostic Report
  📍 Environment
    Protocol: https:
    Hostname: chillsim.net
    Full URL: https://chillsim.net/checkout
    User Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)...
  
  🔒 Security
    HTTPS Enabled: ✅
  
  💳 Stripe SDK
    Stripe loaded: ✅
    Elements loaded: ✅
  
  🍎 Apple Pay API
    API Available: ✅
    Can Make Payments: ✅
    Supports Version 3: ✅
  
  📝 Payment Element
    Payment Element mounted: ✅
  
  🌐 Browser Compatibility
    Safari: ✅
    iOS: ✅
    macOS: ❌
  
  📊 Summary
    ✅ All checks passed! Apple Pay should be available.
*/
