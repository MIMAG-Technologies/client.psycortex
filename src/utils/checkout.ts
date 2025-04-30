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
  if (!baseUrl || !merchant_id) {
    throw new Error(
      "Missing required environment variables: NEXT_PUBLIC_BACKEND_URL or NEXT_PUBLIC_MERCHANT_ID"
    );
  }

  try {
    const amountToPay = Number(
      (data.amount + (data.amount * data.tax) / 100).toFixed(2)
    );
    const orderId = `order_${Date.now()}`;
    const tid = Date.now().toString();

    const payload = {
      tid,
      merchant_id,
      order_id: orderId,
      amount: amountToPay.toString(),
      currency: "INR",
      redirect_url: `${baseUrl}/payment/process_payment.php`,
      cancel_url: `${baseUrl}/payment/process_payment.php`,
      language: "EN",
      billing_name: data.name,
      billing_email: data.email,
      billing_tel: data.phone,
      billing_country: "India",
      billing_address: "Default Address",
      billing_city: "Default City",
      billing_state: "Default State",
      billing_zip: "000000",
      delivery_name: data.name,
      delivery_tel: data.phone,
      delivery_country: "India",
      merchant_param1: "test_pay",
      merchant_param2: data.uuid,
      merchant_param3: data.test_slug,
      merchant_param4: data.test_id || "",
    };

    const response = await axios.post(
      `${baseUrl}/ccavenue/ccavRequestHandler.php`,
      payload
    );
    const formHtml = response.data;

    if (!formHtml.includes("encRequest") || !formHtml.includes("access_code")) {
      throw new Error(
        "Invalid response from ccavRequestHandler.php: Missing encRequest or access_code"
      );
    }

    const div = document.createElement("div");
    div.innerHTML = formHtml;
    document.body.appendChild(div);
    const form = div.querySelector("form");
    if (form) {
      form.submit();
    } else {
      throw new Error("No form found in ccavRequestHandler.php response");
    }
  } catch (error: any) {
    console.error("Error in initiating payment:", error.message);
    throw error;
  }
};
