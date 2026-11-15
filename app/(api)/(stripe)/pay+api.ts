import { Stripe } from "stripe";

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return Response.json(
      {
        error:
          "Configure STRIPE_SECRET_KEY no arquivo .env para testar pagamentos.",
      },
      { status: 503 },
    );
  }
  const stripe = new Stripe(secretKey);
  try {
    const body = await request.json();
    const { payment_method_id, payment_intent_id, customer_id, client_secret } =
      body;

    if (!payment_method_id || !payment_intent_id || !customer_id) {
      return new Response(
        JSON.stringify({ error: "Preencha todos os campos obrigatórios" }),
        { status: 400 },
      );
    }

    const paymentMethod = await stripe.paymentMethods.attach(
      payment_method_id,
      { customer: customer_id },
    );

    const result = await stripe.paymentIntents.confirm(payment_intent_id, {
      payment_method: paymentMethod.id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Pagamento realizado com sucesso",
        result: result,
      }),
    );
  } catch (error) {
    console.error("Erro ao realizar o pagamento:", error);
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500,
    });
  }
}
