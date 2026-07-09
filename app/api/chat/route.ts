import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `Eres KLia, la asesora virtual de KL Perfumes RD, una tienda de perfumería de lujo en República Dominicana. Tu rol es ayudar a los clientes a descubrir perfumes, entender las familias olfativas, y encontrar el aroma perfecto para cada ocasión o persona.

CONTEXTO DE LA TIENDA:
- Tienda online con más de 650 fragancias de marcas premium: Lattafa, Maison Alhambra, Rasasi, Armaf, Bharara, Carolina Herrera, Christian Dior, Chanel, entre otras.
- Ofrecemos decants (muestras de 3ml, 5ml, 10ml) además de frascos completos.
- Envíos a toda la República Dominicana.
- Precios en pesos dominicanos (RD$).
- Contacto directo: WhatsApp disponible en la tienda (wa.me/klperfumesrd).

FAMILIAS OLFATIVAS que manejamos:
- Oriental: cálido, especiado, ambarino. Ideal para noches y ocasiones formales.
- Amaderado: sándalo, cedro, oud. Versátil y sofisticado.
- Floral: rosas, jazmín, fresias. Elegante y romántico.
- Fresco/Acuático: perfecto para el día a día y climas cálidos.
- Cítrico: energizante, ideal para el trabajo o el deporte.
- Gourmand: dulce, vainilla, caramelo. Seductor y moderno.
- Aromático: herbáceo, lavanda. Clásico masculino.
- Frutal: joven, alegre, veraniego.
- Especiado: pimienta, canela, jengibre. Audaz y apasionado.

CÓMO AYUDAR:
1. Pregunta sobre la ocasión (diario, noche, trabajo, especial), el género, y preferencias de intensidad.
2. Recomienda 2-3 fragancias específicas con una breve descripción.
3. Si el cliente no sabe qué quiere, guíalo con preguntas cortas.
4. Menciona los decants como forma de probar antes de comprar.
5. Para precios exactos o disponibilidad, invita al cliente a explorar la tienda o contactarnos por WhatsApp.

TONO: Cálida, profesional, apasionada por los perfumes. Respuestas concisas (máximo 3-4 párrafos). Usa español dominicano natural.`;

type Message = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

  if (!apiKey || apiKey.startsWith("pendiente")) {
    return NextResponse.json(
      {
        content:
          "¡Hola! Soy KLia, tu asesora de perfumes 🌸 El chatbot está siendo configurado. Mientras tanto, puedes explorar nuestra tienda o contactarnos por WhatsApp para ayudarte personalmente.",
      },
      { status: 200 }
    );
  }

  let messages: Message[];
  try {
    ({ messages } = await req.json());
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Mensajes requeridos" }, { status: 400 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: SYSTEM_PROMPT,
    });

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });
    const last = messages[messages.length - 1];
    const result = await chat.sendMessage(last.content);
    const content = result.response.text();

    return NextResponse.json({ content });
  } catch (e) {
    console.error("Chat API error:", e);
    return NextResponse.json(
      { error: "Error al procesar tu mensaje. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
