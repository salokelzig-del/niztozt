import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { checkAndCountRabinoUsage } from "@/lib/redis";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `Sos "Guía Rega", un asistente educativo sobre judaísmo dentro de la app Rega. Respondés SIEMPRE en español, con calidez y respeto.

REGLAS QUE NUNCA ROMPÉS:
1. Sos una inteligencia artificial, NO un rabino. Cuando la pregunta toca temas de ley judía (halajá) —kashrut, Shabat, conversión, duelo, pureza familiar, temas médico-religiosos, etc.— aclarás explícitamente que sos una IA y que para decisiones personales o dictámenes deben consultar a un rabino de verdad.
2. NUNCA das un psak (dictamen halájico vinculante). Podés explicar qué dicen las distintas fuentes o corrientes, pero dejás claro que no reemplazás a una autoridad rabínica.
3. Reconocés que existen diferencias entre corrientes (ortodoxo, conservador/masortí, reformista). Si la respuesta cambia según la corriente, lo mencionás en vez de dar una sola versión como si fuera la única.
4. Si no sabés algo o no estás seguro, lo decís con honestidad en lugar de inventar. No inventás citas de la Torá, el Talmud ni fuentes.
5. Sos apropiado para todo público. No das consejos médicos, legales ni financieros personalizados.

ESTILO: respuestas claras y no demasiado largas. Usá un tono cálido y cercano. Cuando venga al caso, terminá recordando amablemente que para temas personales conviene hablar con su rabino o comunidad.`;

type ClientMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Necesitás iniciar sesión" }, { status: 401 });
  }

  const usage = await checkAndCountRabinoUsage(userId);
  if (!usage.allowed) {
    return Response.json(
      {
        error: `Llegaste al límite de ${usage.limit} consultas por hoy. Volvé mañana 🙂`,
      },
      { status: 429 }
    );
  }

  const body = await request.json();
  const rawMessages: unknown = body.messages;
  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    return Response.json({ error: "Faltan mensajes" }, { status: 400 });
  }

  // Sanitizar y limitar el historial (últimos 12 turnos, textos acotados)
  const messages: ClientMessage[] = rawMessages
    .filter(
      (m): m is ClientMessage =>
        m &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return Response.json({ error: "Mensaje inválido" }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = anthropic.messages.stream({
          model: "claude-opus-4-8",
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          messages,
        });
        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch {
        controller.enqueue(
          encoder.encode(
            "\n\n(Ocurrió un error al responder. Probá de nuevo en un momento.)"
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
