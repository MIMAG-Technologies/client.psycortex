import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
const merchant_id = process.env.NEXT_PUBLIC_MERCHANT_ID;
const access_code = process.env.NEXT_PUBLIC_ACCESS_CODE;

export const initiatePayment = async (data: {
  amount: number;
  tax: number;
  name: string;
  email: string;
  phone: string;
  uuid: string;
  test_slug: string;
  test_id?: string;
}) => {
  try {
    const amountToPay = Number((data.amount + (data.amount * data.tax / 100)).toFixed(2));
    const orderId = `order_${Date.now()}`;

    const response = await axios.post(`${baseUrl}/ccavenue/ccavRequestHandler.php`, {
      merchant_id,
      order_id: orderId,
      amount: amountToPay.toString(),
      currency: 'INR',
      redirect_url: `${baseUrl}/payment/process_payment.php`,
      cancel_url: `${baseUrl}/payment/process_payment.php`,
      billing_name: data.name,
      billing_email: data.email,
      billing_tel: data.phone,
      delivery_name: data.name,
      delivery_tel: data.phone,
      billing_country: 'India',
      delivery_country: 'India',
      merchant_param1: 'test_pay',
      merchant_param2: data.uuid,
      merchant_param3: data.test_slug,
      merchant_param4: data.test_id || '',
    });

    const encRequestMatch = response.data.match(/name="encRequest" value="([^"]+)"/);
    
    if (encRequestMatch) {
      const htmlContent = `
        <form method="post" name="redirect" action="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction"> 
          <input type="hidden" name="encRequest" value="${encRequestMatch[1]}">
          <input type="hidden" name="access_code" value="${access_code}">
        </form>
        <script>
          document.redirect.submit();
          
          document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('a').forEach(function(link) {
              link.addEventListener('click', function(e) {
                if (link.textContent.includes('Generate QR') || 
                    link.href.includes('initiateTransaction#')) {
                  e.preventDefault();
                  window.location.href = link.href;
                }
              });
            });

            document.addEventListener('click', function(e) {
              if (e.target && (
                  e.target.textContent.includes('UPI') || 
                  (e.target.href && e.target.href.includes('void(0)'))
                )) {
                e.preventDefault();
                if (e.target.onclick) {
                  e.target.onclick.call(e.target);
                }
              }
            }, true);
          });
        </script>
      `;

      const div = document.createElement('div');
      div.innerHTML = htmlContent;
      document.body.appendChild(div);
    }
  } catch (error) {
    console.error("Error in initiating payment:", error);
  }
};
