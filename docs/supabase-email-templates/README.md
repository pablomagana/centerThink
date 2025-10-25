# Configuración de Templates de Email en Supabase

Esta guía te muestra cómo personalizar los emails que Supabase envía automáticamente durante el proceso de registro y confirmación de cuenta.

## =ç Templates Disponibles

### 1. Confirmation Email (Email de Confirmación)
**Archivo:** `confirmation-email.html`

Este es el email que los usuarios reciben cuando se registran en la aplicación. Incluye:
-  Diseño moderno con gradiente azul/verde
-  Botón destacado "Confirmar mi cuenta"
-  Link alternativo si el botón no funciona
-  Lista de beneficios de la plataforma
-  Información de contacto y soporte
-  Aviso de expiración (24 horas)
-  Responsive design

## =' Cómo Configurar en Supabase

### Paso 1: Acceder al Dashboard de Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com/)
2. Selecciona tu proyecto
3. En el menú lateral, ve a **Authentication**
4. Haz clic en **Email Templates**

### Paso 2: Editar el Template de Confirmación

1. En la lista de templates, busca **"Confirm signup"** (Confirmación de registro)
2. Haz clic en el template para editarlo
3. Verás dos secciones:
   - **Subject line** (Asunto del email)
   - **Message body** (Cuerpo del email en HTML)

### Paso 3: Configurar el Asunto

En el campo **Subject line**, puedes usar:

```
Confirma tu cuenta en centerThink <‰
```

O una versión más simple:
```
Confirma tu cuenta - centerThink
```

### Paso 4: Configurar el Cuerpo del Email

1. Abre el archivo `confirmation-email.html` en tu editor de código
2. Copia **todo** el contenido HTML
3. Pega el contenido en el campo **Message body** de Supabase
4. Haz clic en **Save** (Guardar)

### Paso 5: Variables de Supabase

El template usa estas variables que Supabase reemplaza automáticamente:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{ .ConfirmationURL }}` | Link único de confirmación | https://xxx.supabase.co/auth/v1/verify?token=... |
| `{{ .SiteURL }}` | URL de tu aplicación | https://centerthink.pages.dev |
| `{{ .Email }}` | Email del usuario | usuario@example.com |

**IMPORTANTE:** No modifiques estas variables, Supabase las reemplaza automáticamente.

### Paso 6: Configurar Site URL

Para que el `{{ .SiteURL }}` funcione correctamente:

1. Ve a **Authentication** ’ **URL Configuration**
2. En **Site URL**, configura tu dominio:
   ```
   https://centerthink.pages.dev
   ```
3. En **Redirect URLs**, agrega también:
   ```
   https://centerthink.pages.dev/login
   https://centerthink.pages.dev/**
   ```

Para desarrollo local, también agrega:
```
http://localhost:3000/login
http://localhost:3000/**
```

## >ê Probar el Template

### Método 1: Registro Real

1. Ve a tu app en `/register`
2. Registra un usuario con tu email
3. Revisa tu bandeja de entrada (y spam)
4. Verifica que el email se vea bonito

### Método 2: Test Email (Preview)

Supabase no tiene preview nativo, pero puedes:

1. Crear un archivo HTML local con el template
2. Reemplazar manualmente las variables:
   - `{{ .ConfirmationURL }}` ’ un link de prueba
   - `{{ .SiteURL }}` ’ tu URL
3. Abrir el archivo en el navegador para ver cómo se ve

## <¨ Personalización

### Cambiar Colores

El template usa estos colores principales:
- **Azul primario:** `#3b82f6`
- **Verde secundario:** `#10b981`
- **Texto oscuro:** `#1f2937`
- **Texto gris:** `#6b7280`

Para cambiar los colores, busca y reemplaza en el HTML.

### Cambiar el Logo

El template usa un ícono SVG. Para agregar tu logo:

1. Busca la sección del logo (línea ~26-33)
2. Reemplaza el SVG por:
```html
<img src="https://tu-dominio.com/logo.png"
     alt="centerThink"
     style="width: 80px; height: 80px; border-radius: 50%;">
```

### Cambiar Email de Soporte

Busca `info@pablomagana.es` y reemplázalo con tu email de soporte.

### Agregar/Quitar Secciones

El template está dividido en secciones (`<tr>` dentro de la tabla principal):
1. Header con logo
2. Mensaje principal y botón CTA
3. Sección de beneficios
4. Footer

Puedes comentar o eliminar cualquier sección completa (`<tr>...</tr>`).

## =ñ Compatibilidad

El template está probado y funciona en:
-  Gmail (web y móvil)
-  Outlook (web y desktop)
-  Apple Mail (iOS y macOS)
-  Yahoo Mail
-  ProtonMail
-  Thunderbird

**Nota:** Los clientes de email tienen soporte limitado de CSS. Por eso usamos:
- Tablas en lugar de divs
- Estilos inline
- Colores sólidos y gradientes CSS simples

## = Troubleshooting

### El email se ve roto en Outlook

**Problema:** Outlook tiene soporte limitado de CSS

**Solución:**
- Usa solo estilos inline
- Evita `display: flex` o `grid`
- Usa tablas anidadas para layout
- El template ya está optimizado para esto

### Las imágenes no cargan

**Problema:** Algunos clientes bloquean imágenes por defecto

**Solución:**
- Usa colores de fondo en lugar de imágenes cuando sea posible
- El template usa SVG inline (no requiere carga externa)
- Si usas logo externo, asegúrate de usar HTTPS

### El botón no funciona

**Problema:** El link `{{ .ConfirmationURL }}` no funciona

**Solución:**
1. Verifica que la variable esté escrita exactamente como `{{ .ConfirmationURL }}`
2. No agregues espacios: L `{{ .ConfirmationURL }}`  `{{.ConfirmationURL}}`
3. Verifica que Site URL esté configurado en Supabase

### El gradiente no se ve

**Problema:** Algunos clientes no soportan gradientes CSS

**Solución:**
- El template ya incluye colores de fallback
- Los gradientes son un "nice to have", el email se ve bien sin ellos

## =Ê Otros Templates de Supabase

Supabase tiene otros templates que puedes personalizar:

### Magic Link Email
Email que se envía cuando se usa login sin contraseña

### Reset Password Email
Email para recuperación de contraseña

### Email Change Email
Email cuando el usuario cambia su email

**Puedes aplicar el mismo diseño a todos estos templates** copiando la estructura HTML y ajustando el contenido del mensaje.

## = Recursos Adicionales

- [Supabase Email Templates Docs](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Email on Acid - Testing Tool](https://www.emailonacid.com/)
- [Can I Email - CSS Support](https://www.caniemail.com/)
- [HTML Email Guide](https://htmlemail.io/)

##  Checklist Final

Antes de poner en producción:

- [ ] Template configurado en Supabase Dashboard
- [ ] Site URL configurado correctamente
- [ ] Redirect URLs configuradas
- [ ] Probado con registro real
- [ ] Email revisado en Gmail y Outlook
- [ ] Email de soporte personalizado
- [ ] Colores ajustados a tu marca (opcional)
- [ ] Logo agregado (opcional)

## =¡ Tips Adicionales

1. **Mantén el código simple:** Los clientes de email son impredecibles
2. **Prueba en múltiples clientes:** Gmail, Outlook, Apple Mail
3. **Móvil primero:** La mayoría de emails se leen en móvil
4. **CTA claro:** El botón debe destacar y ser obvio
5. **Texto alternativo:** Siempre incluye el link en texto plano

---

¿Tienes problemas configurando el template? [Contacta soporte](mailto:info@pablomagana.es)
