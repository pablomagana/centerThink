# Configuraci�n de Templates de Email en Supabase

Esta gu�a te muestra c�mo personalizar los emails que Supabase env�a autom�ticamente durante el proceso de registro y confirmaci�n de cuenta.

## =� Templates Disponibles

### 1. Confirmation Email (Email de Confirmaci�n)
**Archivo:** `confirmation-email.html`

Este es el email que los usuarios reciben cuando se registran en la aplicaci�n. Incluye:
-  Dise�o moderno con gradiente azul/verde
-  Bot�n destacado "Confirmar mi cuenta"
-  Link alternativo si el bot�n no funciona
-  Lista de beneficios de la plataforma
-  Informaci�n de contacto y soporte
-  Aviso de expiraci�n (24 horas)
-  Responsive design

## =' C�mo Configurar en Supabase

### Paso 1: Acceder al Dashboard de Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com/)
2. Selecciona tu proyecto
3. En el men� lateral, ve a **Authentication**
4. Haz clic en **Email Templates**

### Paso 2: Editar el Template de Confirmaci�n

1. En la lista de templates, busca **"Confirm signup"** (Confirmaci�n de registro)
2. Haz clic en el template para editarlo
3. Ver�s dos secciones:
   - **Subject line** (Asunto del email)
   - **Message body** (Cuerpo del email en HTML)

### Paso 3: Configurar el Asunto

En el campo **Subject line**, puedes usar:

```
Confirma tu cuenta en centerThink <�
```

O una versi�n m�s simple:
```
Confirma tu cuenta - centerThink
```

### Paso 4: Configurar el Cuerpo del Email

1. Abre el archivo `confirmation-email.html` en tu editor de c�digo
2. Copia **todo** el contenido HTML
3. Pega el contenido en el campo **Message body** de Supabase
4. Haz clic en **Save** (Guardar)

### Paso 5: Variables de Supabase

El template usa estas variables que Supabase reemplaza autom�ticamente:

| Variable | Descripci�n | Ejemplo |
|----------|-------------|---------|
| `{{ .ConfirmationURL }}` | Link �nico de confirmaci�n | https://xxx.supabase.co/auth/v1/verify?token=... |
| `{{ .SiteURL }}` | URL de tu aplicaci�n | https://centerthink.pages.dev |
| `{{ .Email }}` | Email del usuario | usuario@example.com |

**IMPORTANTE:** No modifiques estas variables, Supabase las reemplaza autom�ticamente.

### Paso 6: Configurar Site URL

Para que el `{{ .SiteURL }}` funcione correctamente:

1. Ve a **Authentication** � **URL Configuration**
2. En **Site URL**, configura tu dominio:
   ```
   https://centerthink.pages.dev
   ```
3. En **Redirect URLs**, agrega tambi�n:
   ```
   https://centerthink.pages.dev/login
   https://centerthink.pages.dev/**
   ```

Para desarrollo local, tambi�n agrega:
```
http://localhost:3000/login
http://localhost:3000/**
```

## >� Probar el Template

### M�todo 1: Registro Real

1. Ve a tu app en `/register`
2. Registra un usuario con tu email
3. Revisa tu bandeja de entrada (y spam)
4. Verifica que el email se vea bonito

### M�todo 2: Test Email (Preview)

Supabase no tiene preview nativo, pero puedes:

1. Crear un archivo HTML local con el template
2. Reemplazar manualmente las variables:
   - `{{ .ConfirmationURL }}` � un link de prueba
   - `{{ .SiteURL }}` � tu URL
3. Abrir el archivo en el navegador para ver c�mo se ve

## <� Personalizaci�n

### Cambiar Colores

El template usa estos colores principales:
- **Azul primario:** `#3b82f6`
- **Verde secundario:** `#10b981`
- **Texto oscuro:** `#1f2937`
- **Texto gris:** `#6b7280`

Para cambiar los colores, busca y reemplaza en el HTML.

### Cambiar el Logo

El template usa un �cono SVG. Para agregar tu logo:

1. Busca la secci�n del logo (l�nea ~26-33)
2. Reemplaza el SVG por:
```html
<img src="https://tu-dominio.com/logo.png"
     alt="centerThink"
     style="width: 80px; height: 80px; border-radius: 50%;">
```

### Cambiar Email de Soporte

Busca `info@pablomagana.es` y reempl�zalo con tu email de soporte.

### Agregar/Quitar Secciones

El template est� dividido en secciones (`<tr>` dentro de la tabla principal):
1. Header con logo
2. Mensaje principal y bot�n CTA
3. Secci�n de beneficios
4. Footer

Puedes comentar o eliminar cualquier secci�n completa (`<tr>...</tr>`).

## =� Compatibilidad

El template est� probado y funciona en:
-  Gmail (web y m�vil)
-  Outlook (web y desktop)
-  Apple Mail (iOS y macOS)
-  Yahoo Mail
-  ProtonMail
-  Thunderbird

**Nota:** Los clientes de email tienen soporte limitado de CSS. Por eso usamos:
- Tablas en lugar de divs
- Estilos inline
- Colores s�lidos y gradientes CSS simples

## = Troubleshooting

### El email se ve roto en Outlook

**Problema:** Outlook tiene soporte limitado de CSS

**Soluci�n:**
- Usa solo estilos inline
- Evita `display: flex` o `grid`
- Usa tablas anidadas para layout
- El template ya est� optimizado para esto

### Las im�genes no cargan

**Problema:** Algunos clientes bloquean im�genes por defecto

**Soluci�n:**
- Usa colores de fondo en lugar de im�genes cuando sea posible
- El template usa SVG inline (no requiere carga externa)
- Si usas logo externo, aseg�rate de usar HTTPS

### El bot�n no funciona

**Problema:** El link `{{ .ConfirmationURL }}` no funciona

**Soluci�n:**
1. Verifica que la variable est� escrita exactamente como `{{ .ConfirmationURL }}`
2. No agregues espacios: L `{{ .ConfirmationURL }}`  `{{.ConfirmationURL}}`
3. Verifica que Site URL est� configurado en Supabase

### El gradiente no se ve

**Problema:** Algunos clientes no soportan gradientes CSS

**Soluci�n:**
- El template ya incluye colores de fallback
- Los gradientes son un "nice to have", el email se ve bien sin ellos

## =� Otros Templates de Supabase

Supabase tiene otros templates que puedes personalizar:

### Magic Link Email
Email que se env�a cuando se usa login sin contrase�a

### Reset Password Email
Email para recuperaci�n de contrase�a

### Email Change Email
Email cuando el usuario cambia su email

**Puedes aplicar el mismo dise�o a todos estos templates** copiando la estructura HTML y ajustando el contenido del mensaje.

## = Recursos Adicionales

- [Supabase Email Templates Docs](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Email on Acid - Testing Tool](https://www.emailonacid.com/)
- [Can I Email - CSS Support](https://www.caniemail.com/)
- [HTML Email Guide](https://htmlemail.io/)

##  Checklist Final

Antes de poner en producci�n:

- [ ] Template configurado en Supabase Dashboard
- [ ] Site URL configurado correctamente
- [ ] Redirect URLs configuradas
- [ ] Probado con registro real
- [ ] Email revisado en Gmail y Outlook
- [ ] Email de soporte personalizado
- [ ] Colores ajustados a tu marca (opcional)
- [ ] Logo agregado (opcional)

## =� Tips Adicionales

1. **Mant�n el c�digo simple:** Los clientes de email son impredecibles
2. **Prueba en m�ltiples clientes:** Gmail, Outlook, Apple Mail
3. **M�vil primero:** La mayor�a de emails se leen en m�vil
4. **CTA claro:** El bot�n debe destacar y ser obvio
5. **Texto alternativo:** Siempre incluye el link en texto plano

---

�Tienes problemas configurando el template? [Contacta soporte](mailto:info@pablomagana.es)
