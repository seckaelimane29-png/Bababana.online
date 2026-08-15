import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/prewarm")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (request.headers.get("x-prewarm-key") !== process.env.PREWARM_KEY) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { bookId, lang } = (await request.json()) as { bookId: string; lang: string };
        const { translateBook, translateWisdom } = await import("@/lib/translate.server");
        const out = bookId === "__wisdom" ? await translateWisdom(lang) : await translateBook(bookId, lang);
        return Response.json({ ok: Boolean(out) });
      },
    },
  },
});