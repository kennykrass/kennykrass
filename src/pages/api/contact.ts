import type { APIRoute } from "astro";
export const prerender = false;
import { z } from "zod";
import { Resend } from 'resend';

// Leer variables de entorno a nivel de módulo es seguro, pero NO lanzar errores aquí.
// Si faltan, devolvemos un JSON consistente desde el handler.
const apiKey = import.meta.env.RESEND_API_KEY;
const sendToEmail = import.meta.env.SEND_TO_EMAIL;
const fromEmail = import.meta.env.RESEND_FROM_EMAIL;

// 1. Definimos un esquema de validación con Zod
const contactSchema = z.object({
  name: z.string({ required_error: "El nombre es obligatorio." }).min(1, { message: "El nombre no puede estar vacío." }),
  email: z.string({ required_error: "El email es obligatorio." }).email({ message: "El formato del correo no es válido." }),
  message: z.string({ required_error: "El mensaje es obligatorio." }).min(1, { message: "El mensaje no puede estar vacío." }),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    // Validación temprana de variables de entorno, siempre devolviendo JSON
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        message: "Configuración faltante: RESEND_API_KEY no está definida en el servidor.",
      }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    const resend = new Resend(apiKey);
    // Log para depuración en Netlify: confirma si las variables de entorno se están leyendo.
    // En los logs de la función de Netlify, busca este mensaje.
    console.log("Iniciando API de contacto. SEND_TO_EMAIL:", sendToEmail ? "cargado" : "NO cargado");
    console.log("FROM_EMAIL:", fromEmail ? "cargado" : "NO cargado");


    const body = await request.json();
    // 2. Validamos el cuerpo de la petición con el esquema de Zod
    const validation = contactSchema.safeParse(body);

    if (!validation.success) {
      // Si la validación falla, devolvemos los errores específicos
      return new Response(JSON.stringify({ errors: validation.error.flatten().fieldErrors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { name, email, message } = validation.data;

    // 3. Enviar el correo usando Resend
    const fromAddress = fromEmail || "Portfolio Contact <onboarding@resend.dev>";
    const toAddress = sendToEmail || "kennysk81@gmail.com";

    // Advertencia en logs si se usan los valores por defecto
    if (!fromEmail) console.warn("ADVERTENCIA: La variable RESEND_FROM_EMAIL no está configurada. Usando valor por defecto.");
    if (!sendToEmail) console.warn("ADVERTENCIA: La variable SEND_TO_EMAIL no está configurada. Usando valor por defecto.");

    const { data } = await resend.emails.send({
      from: fromAddress,
      to: toAddress,
      replyTo: email, // ¡Corregido! Facilita responder directamente al usuario.
      subject: `Nuevo mensaje de contacto de ${name}`,
      html: `<p>Has recibido un nuevo mensaje de tu formulario de contacto:</p>
             <p><strong>Nombre:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Mensaje:</strong> ${message}</p>`,
    });
    
    // 4. Si resend.emails.send() no lanzó un error, el envío fue exitoso.
    // Devolvemos la respuesta de éxito.
    return new Response(JSON.stringify({ message: "Mensaje enviado con éxito." }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Este catch ahora manejará errores de `request.json()` (si el body no es JSON válido)
    // o si resend.emails.send() lanza una excepción.
    console.error("API Route error:", error);
    const isJsonParse = error instanceof Error && /JSON|Unexpected end of JSON/i.test(error.message);
    const message = isJsonParse
      ? "El cuerpo de la petición está vacío o no es un JSON válido."
      : "Error interno del servidor.";
    return new Response(JSON.stringify({ message }), {
      status: isJsonParse ? 400 : 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
