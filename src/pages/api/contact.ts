import type { APIRoute } from "astro";
import { z } from "zod";
import { Resend } from 'resend';

// Se comprueba la API Key y se inicializa Resend UNA SOLA VEZ fuera de la petición.
// Esto es más eficiente y permite que la aplicación falle rápido si la clave no está configurada.
const apiKey = import.meta.env.RESEND_API_KEY;
if (!apiKey) {
  throw new Error("La variable de entorno RESEND_API_KEY no está configurada en el servidor.");
}
const resend = new Resend(apiKey);
const sendToEmail = import.meta.env.SEND_TO_EMAIL;

// 1. Definimos un esquema de validación con Zod
const contactSchema = z.object({
  name: z.string({ required_error: "El nombre es obligatorio." }).min(1, { message: "El nombre no puede estar vacío." }),
  email: z.string({ required_error: "El email es obligatorio." }).email({ message: "El formato del correo no es válido." }),
  message: z.string({ required_error: "El mensaje es obligatorio." }).min(1, { message: "El mensaje no puede estar vacío." }),
});

export const POST: APIRoute = async ({ request }) => {
  try {
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
    const { data, error } = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>", // DEBE ser un dominio verificado en Resend
      to: sendToEmail || "kennysk81@gmail.com", // Usamos la variable de entorno o un valor por defecto
      subject: `Nuevo mensaje de contacto de ${name}`,
      html: `<p>Has recibido un nuevo mensaje de tu formulario de contacto:</p>
             <p><strong>Nombre:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Mensaje:</strong> ${message}</p>`,
    });

    // 4. Manejo de errores de Resend
    if (error) {
      console.error("Resend error:", { error }); // Log del error para depuración
      return new Response(JSON.stringify({ message: "Error al enviar el correo." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 5. Respuesta de éxito
    return new Response(JSON.stringify({ message: "Mensaje enviado con éxito." }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Este catch ahora manejará errores de `request.json()` (si el body no es JSON válido)
    // o cualquier otro error inesperado.
    console.error("API Route error:", error);
    const errorMessage = (error instanceof Error && error.message.includes("JSON"))
      ? "El cuerpo de la petición no es un JSON válido."
      : "Error interno del servidor.";
    return new Response(JSON.stringify({ message: errorMessage }), { 
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
