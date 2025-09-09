import type { APIRoute } from "astro";
import { Resend } from "resend";
import { z } from "zod";

// Obtenemos la clave de API desde las variables de entorno
const resend = new Resend(import.meta.env.RESEND_API_KEY);

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
      from: "onboarding@resend.dev", // DEBE ser un dominio verificado en Resend
      to: "kennysk81@gmail.com",
      subject: `Nuevo mensaje de contacto de ${name}`,
      html: `<p>Has recibido un nuevo mensaje de tu formulario de contacto:</p>
             <p><strong>Nombre:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Mensaje:</strong> ${message}</p>`,
    });

    // 4. Manejo de errores de Resend
    if (error) {
      console.error({ error }); // Log del error para depuración
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
    console.error(error); // Log del error para depuración
    return new Response(JSON.stringify({ message: "Error interno del servidor." }), { status: 500 });
  }
};