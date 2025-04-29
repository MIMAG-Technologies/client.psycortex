import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
const merchant_id = process.env.NEXT_PUBLIC_MERCHANT_ID;

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

    console.log(response.data);
    


      const div = document.createElement('div');
      div.innerHTML = response.data;
      document.body.appendChild(div);
      const form = div.querySelector('form');
      if (form) {
        form.submit();
      }
  } catch (error) {
    console.error("Error in initiating payment:", error);
  }
};
// <html>

// <head>
// 	<script>
// 		window.onload = function () {
// 			var d = new Date().getTime();
// 			document.getElementById("tid").value = d;
// 		};
// 	</script>
// </head>

// <body>
// 	<form method="post" name="customerData" action="https://backend.psycortex.in/ccavenue/webCCAVRequestHandler.php">
// 		<table width="40%" height="100" border='1' align="center">
// 			<caption>
// 				<font size="4" color="blue"><b>Integration Kit</b></font>

// 			</caption>
// 		</table>
// 		<table width="40%" height="100" border='1' align="center">
// 			<tr>
// 				<td>Parameter Name:</td>
// 				<td>Parameter Value:</td>
// 			</tr>
// 			<tr>
// 				<td colspan="2"> Compulsory information</td>
// 			</tr>
// 			<tr>
// 				<td>TID :</td>
// 				<td><input type="text" name="tid" id="tid" readonly /></td>
// 			</tr>
// 			<tr>
// 				<td>Merchant Id :</td>
// 				<td><input type="text" name="merchant_id" value="4048261" /></td>
// 			</tr>
// 			<tr>
// 				<td>Order Id :</td>
// 				<td><input type="text" name="order_id" value="123654789" /></td>
// 			</tr>
// 			<tr>
// 				<td>Amount :</td>
// 				<td><input type="text" name="amount" value="1.00" /></td>
// 			</tr>
// 			<tr>
// 				<td>Currency :</td>
// 				<td><input type="text" name="currency" value="INR" /></td>
// 			</tr>
// 			<tr>
// 				<td>Redirect URL :</td>
// 				<td><input type="text" name="redirect_url"
// 						value="https://backend.psycortex.in/payment/process_payment.php" /></td>
// 			</tr>
// 			<tr>
// 				<td>Cancel URL :</td>
// 				<td><input type="text" name="cancel_url"
// 						value="https://backend.psycortex.in/payment/process_payment.php" /></td>
// 			</tr>
// 			<tr>
// 			<tr>
// 				<td>Language :</td>
// 				<td><input type="text" name="language" value="EN" /></td>
// 			</tr>
// 			<tr>
// 				<td colspan="2">Billing information(optional):</td>
// 			</tr>
// 			<tr>
// 				<td>Billing Name :</td>
// 				<td><input type="text" name="billing_name" value="Charli" /></td>
// 			</tr>
// 			<tr>
// 				<td>Billing Address :</td>
// 				<td><input type="text" name="billing_address" value="Room no 1101, near Railway station Ambad" /></td>
// 			</tr>
// 			<tr>
// 				<td>Billing City :</td>
// 				<td><input type="text" name="billing_city" value="Indore" /></td>
// 			</tr>
// 			<tr>
// 				<td>Billing State :</td>
// 				<td><input type="text" name="billing_state" value="MP" /></td>
// 			</tr>
// 			<tr>
// 				<td>Billing Zip :</td>
// 				<td><input type="text" name="billing_zip" value="425001" /></td>
// 			</tr>
// 			<tr>
// 				<td>Billing Country :</td>
// 				<td><input type="text" name="billing_country" value="India" /></td>
// 			</tr>
// 			<tr>
// 				<td>Billing Tel :</td>
// 				<td><input type="text" name="billing_tel" value="9876543210" /></td>
// 			</tr>
// 			<tr>
// 				<td>Billing Email :</td>
// 				<td><input type="text" name="billing_email" value="test@test.com" /></td>
// 			</tr>

// 			<tr>
// 				<td>Merchant Param1 :</td>
// 				<td><input type="text" name="merchant_param1" value="Appointment ID: 001" /></td>
// 			</tr>


// 			<tr>
// 				<td></td>
// 				<td><INPUT TYPE="submit" value="CheckOut"></td>
// 			</tr>
// 		</table>
// 	</form>
// </body>

// </html>