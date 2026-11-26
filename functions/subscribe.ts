export const onRequestPost: PagesFunction = async (context) => {
  async function hasMX(domain: string) {
    const url = `https://cloudflare-dns.com/dns-query?name=${domain}&type=MX`;

    const res = await fetch(url, {
      headers: { Accept: "application/dns-json" },
    });

    if (!res.ok) return false;

    const data: any = await res.json();

    return Array.isArray(data.Answer) && data.Answer.length > 0;
  }

  try {
    const form = await context.request.formData();
    const referer = context.request.headers.get("referer") || "";
    const email = form.get("email")?.toString() || "";
    const domain = email.split("@")[1];
    const tag = form.get("tag")?.toString() || "form";
    const honeypot = form.get("website")?.toString();
    const ts = Number(form.get("timestamp"));
    const now = Date.now();

    // referer protection
    if (!referer || !referer.startsWith("https://wqon.link")) {
      return new Response("Forbidden", { status: 403 });
    }

    // honeypot protection
    if (honeypot && honeypot.trim() !== "") {
      return new Response("Bot detected", { status: 400 });
    }

    // timestamp protection
    if (!ts || now - ts < 2000) {
      return new Response("Too fast", { status: 400 });
    }

    // DNS MX protection
    if (!(await hasMX(domain))) {
      return new Response("Invalid email domain", { status: 400 });
    }

    if (!email) {
      return new Response(JSON.stringify({ error: "Missing email" }), {
        status: 400,
      });
    }

    const apiKey = context.env.OCTOPUS_API;
    const listId = context.env.OCTOPUS_ID;

    const eoRes = await fetch(
      `https://api.emailoctopus.com/lists/${listId}/contacts`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          email_address: email,
          status: "subscribed",
          tags: {
            [tag]: true,
          },
        }),
      },
    );

    const data = await eoRes.json();

    if (!eoRes.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: eoRes.status,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
};
