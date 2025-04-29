import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
const merchant_id = process.env.NEXT_PUBLIC_MERCHANT_ID;

export const initiatePayment = async (data: {
  amount: number;
  name: string;
  email: string;
  phone: string;
  country: string;
  user_id: string;
  test_slug: string;
}) => {
  try {
    const res = await axios.post(`${baseUrl}/ccavenue/ccavRequestHandler.php`, {
      merchant_id,
      order_id: Math.floor(100000000 + Math.random() * 900000000).toString(),
      amount: data.amount,
      currency: "INR",
      redirect_url: `${baseUrl}/payment/process_payment.php`,
      cancel_url: `${baseUrl}/payment/process_payment.php`,
      billing_name: data.name,
      billing_email: data.email,
      billing_tel: data.phone,
      delivery_name: data.name,
      delivery_tel: data.phone,
      billing_country: data.country,
      delivery_country: data.country,
      merchant_param1: "test_pay",
      merchant_param2: data.user_id,
      merchant_param3: data.test_slug,
    });
    const { data: response } = res;
    console.log("Response from payment:", response);

    // Create a temporary div to hold the form
    const div = document.createElement("div");
    // Remove the auto-submit script to avoid conflicts
    const cleanResponse = response.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ""
    );
    div.innerHTML = cleanResponse;

    // Get the form from the response
    const form = div.querySelector("form");
    if (form) {
      console.log("Form action:", form.action);
      // Append the form to the DOM
      document.body.appendChild(form);
      // Add a submit button for user interaction
      const submitButton = document.createElement("button");
      submitButton.type = "submit";
      form.appendChild(submitButton);
      submitButton.click();
    } else {
      console.error("No form found in response");
    }
  } catch (error) {
    console.error("Error in initiating payment:", error);
  }
};
