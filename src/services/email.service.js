import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;

export const emailService = {
  /**
   * Envía email con credenciales de usuario nuevo
   * @param {Object} params
   * @param {string} params.toEmail - Email del destinatario
   * @param {string} params.userName - Nombre completo del usuario
   * @param {string} params.tempPassword - Contraseña temporal
   * @param {string} params.creatorName - Nombre del admin que creó la cuenta
   * @returns {Promise<void>}
   */
  async sendUserCredentials({ toEmail, userName, tempPassword, creatorName }) {
    console.log('📧 Intentando enviar email con EmailJS...');
    console.log('🔑 Configuración:', {
      SERVICE_ID,
      TEMPLATE_ID,
      PUBLIC_KEY: PUBLIC_KEY ? '***' + PUBLIC_KEY.slice(-4) : 'undefined',
      APP_URL
    });

    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      throw new Error('EmailJS no está configurado. Verifica las variables de entorno.');
    }

    const templateParams = {
      to_email: toEmail,
      to_name: userName,
      user_name: userName,
      temp_password: tempPassword,
      login_url: APP_URL,
      creator_name: creatorName,
      from_name: 'centerThink'
    };

    console.log('📦 Parámetros del template:', templateParams);

    try {
      console.log('📤 Enviando email...');
      const response = await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        templateParams,
        PUBLIC_KEY
      );

      console.log('✅ Email enviado exitosamente:', response.status, response.text);
      return response;
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      console.error('Detalles del error:', {
        status: error.status,
        text: error.text,
        message: error.message
      });
      throw new Error(`Error al enviar email: ${error.text || error.message}`);
    }
  },

  /**
   * Inicializa EmailJS (llamar una vez al inicio de la app)
   */
  init() {
    if (PUBLIC_KEY) {
      emailjs.init(PUBLIC_KEY);
      console.log('EmailJS inicializado correctamente');
    } else {
      console.warn('EmailJS no configurado - las variables de entorno no están definidas');
    }
  }
};
