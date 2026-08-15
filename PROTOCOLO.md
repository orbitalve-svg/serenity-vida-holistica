# Protocolo de Blindaje y Optimización de Proyectos Web

> **Documento operativo para asistentes de código.** Define cómo clasificar un proyecto, qué capas aplicar en cada nivel, cómo detectar que el proyecto cambió de naturaleza a mitad de camino, y qué hacer en ese momento.

---

## 0. Cómo usar este documento

**Para el humano:** pega este archivo en la raíz del proyecto como `PROTOCOLO.md` y referencia su contenido en `CLAUDE.md`, `.cursorrules`, `AGENTS.md` o el equivalente de tu asistente. Una línea basta:

```
Antes de escribir código, lee PROTOCOLO.md y ejecuta la Sección 1 (Entrevista de Clasificación).
Mantén PROJECT-LEVEL.md actualizado según la Sección 6.
```

**Para el asistente:** este documento tiene prioridad sobre la velocidad de entrega. Las reglas de la Sección 5 (Protocolo de Escalada) no son negociables ni posponibles a petición del usuario; si el usuario pide saltárselas, adviértelo una vez, deja constancia en `PROJECT-LEVEL.md` y continúa bajo su decisión.

---

## 1. Entrevista de Clasificación

**Ejecutar SIEMPRE al inicio de un proyecto nuevo, antes de la primera línea de código.** Tres preguntas. No asumir respuestas.

> **P1.** ¿El sitio va a guardar en algún lado datos que escriba una persona? (formulario, comentario, reserva, pedido, archivo subido)
>
> **P2.** ¿Va a haber login, cuentas o contenido que cambie según quién entra?
>
> **P3.** ¿Va a mover dinero, o a manejar datos sensibles? (pagos, suscripciones, datos médicos, documentos de identidad, datos de menores)

### Tabla de decisión

| P1 | P2 | P3 | Nivel | Nombre |
|----|----|----|-------|--------|
| No | No | No | **N0** | Estático |
| Sí (solo email/mensaje, sin base) | No | No | **N1** | Estático con formulario |
| Sí (con base de datos) | Cualquiera | No | **N2** | Aplicación |
| Cualquiera | Cualquiera | Sí | **N3** | Aplicación crítica |

**Regla de desempate:** ante la duda entre dos niveles, se aplica el más alto. Bajar de nivel después es trivial; subirlo tarde es una brecha.

**Regla de anticipación:** si el usuario dice "por ahora no, pero luego sí" respecto a P2 o P3, se clasifica en el nivel actual pero se anota el nivel previsto en `PROJECT-LEVEL.md`, y se eligen tecnologías compatibles con ese destino (no montar auth casera si en tres semanas va a haber pagos).

### Salida obligatoria de esta sección

El asistente anuncia explícitamente el resultado antes de continuar:

```
Clasificación: N2 — Aplicación.
Motivo: hay base de datos (P1) y login de usuarios (P2).
Capas activas: las 8 de N2. Ver PROJECT-LEVEL.md.
```

---

## 2. Tabla Maestra de Capas

| # | Capa | N0 | N1 | N2 | N3 | Momento |
|---|------|----|----|----|----|---------|
| 1 | Control de versiones + backup del código | ✅ | ✅ | ✅ | ✅ | Día 1 |
| 2 | Backups de base de datos + restauración probada | — | — | ✅ | ✅ | Antes del primer dato real |
| 3 | Secretos fuera del cliente | — | ✅ | ✅ | ✅ | Día 1 |
| 4 | Autorización en cada endpoint | — | — | ✅ | ✅ | Con el primer endpoint |
| 5 | Validación de inputs (servidor) | — | ✅ | ✅ | ✅ | Con el primer formulario |
| 6 | Rate limiting | — | ✅ | ✅ | ✅ | Con el primer endpoint público |
| 7 | Logs y monitoreo de errores | Ligero | Ligero | ✅ | ✅ | Antes de optimizar nada |
| 8 | Índices en la base | — | — | ✅ | ✅ | Con cada query nueva |
| 9 | Eliminación de consultas N+1 | — | — | ✅ | ✅ | Al revisar listados |
| 10 | Prueba de carga | — | — | Recomendada | ✅ | Pre-lanzamiento |
| 11 | Connection pooling | — | — | ✅ si serverless | ✅ | Al conectar la base |
| 12 | CDN + optimización de imágenes | ✅ | ✅ | ✅ | ✅ | Pre-lanzamiento |
| 13 | Capa de caché | — | — | Solo si medida | Solo si medida | Último recurso |
| 14 | Cabeceras de seguridad + HTTPS | ✅ | ✅ | ✅ | ✅ | Pre-lanzamiento |
| 15 | Política de datos y borrado de cuenta | — | — | ✅ | ✅ | Pre-lanzamiento |
| 16 | Auditoría de dependencias | Ligera | Ligera | ✅ | ✅ | Pre-lanzamiento y mensual |
| 17 | Registro de auditoría (audit log) | — | — | — | ✅ | Con el panel de admin |
| 18 | Idempotencia y webhooks firmados | — | — | — | ✅ | Con la integración de pagos |
| 19 | Entorno de staging separado | — | — | Recomendado | ✅ | Antes del primer deploy |
| 20 | 2FA en cuentas de infraestructura | — | — | ✅ | ✅ | Día 1 |

---

## 3. Detalle de cada capa

Formato: **qué es** → **por qué importa** → **cómo se verifica** → **señal de que está mal**.

---

### 3.1 · Control de versiones y backup del código
**Qué:** Git con remoto en GitHub/GitLab. Commits pequeños y frecuentes.
**Por qué:** en desarrollo asistido por IA, un refactor puede destrozar código que funcionaba. Git es el botón de deshacer real. En N0 y N1, el repo remoto *es* tu backup completo.
**Verificación:** `git remote -v` devuelve un remoto; `git status` está limpio antes de cada sesión grande de cambios.
**Señal de alarma:** llevas dos horas de cambios sin un solo commit.

---

### 3.2 · Backups de base de datos y restauración probada
**Qué:** copias automáticas diarias con retención de al menos 7 días, más una restauración de prueba ejecutada al menos una vez.
**Por qué:** es el único fallo del que no hay recuperación. Un índice mal puesto se arregla; una tabla borrada sin backup, no. Y un backup nunca restaurado es una hipótesis, no un backup.
**Verificación:** restaura el backup más reciente en una base vacía y cuenta las filas de tu tabla principal. Anota la fecha de esa prueba en `PROJECT-LEVEL.md`.
**Señal de alarma:** "el hosting seguro los hace". Confírmalo en el panel; en varios planes gratuitos no los hace, o los borra a los 24 horas.

---

### 3.3 · Secretos fuera del cliente
**Qué:** ninguna API key, token de servicio ni string de conexión en código que llegue al navegador. Todo en variables de entorno del servidor, con `.env` en `.gitignore`.
**Por qué:** es el fallo número uno en código generado por IA. El asistente pone la clave donde el código funciona, no donde es seguro. Una clave de servicio expuesta es acceso total a tu base, sin importar el resto de tus defensas.
**Verificación concreta:**
```bash
# 1. Compila y busca tus claves en el bundle que se sirve al navegador
npm run build && grep -r "sk_\|service_role\|eyJhbGciOi" .next/static/ dist/ 2>/dev/null

# 2. Revisa el historial de Git (una clave borrada sigue en los commits viejos)
git log -p --all -S "SUPABASE_SERVICE_ROLE" | head -50
```
**Reglas específicas por stack:**
- **Next.js:** todo lo que empiece con `NEXT_PUBLIC_` es público. La `service_role` de Supabase **nunca** lleva ese prefijo.
- **Vite:** igual con `VITE_`.
- **Supabase:** la `anon key` sí es pública por diseño — pero solo es segura si RLS está activo (ver 3.4).

**Señal de alarma:** la clave apareció en el grep, o está en un commit antiguo. Si estuvo en un repo público aunque fuera cinco minutos: **rótala**, no la borres y ya.

---

### 3.4 · Autorización en cada endpoint
**Qué:** cada ruta del servidor verifica dos cosas por separado: *quién eres* (autenticación) y *si puedes tocar este recurso concreto* (autorización).
**Por qué:** ocultar un botón en la interfaz no protege nada. El endpoint sigue ahí y responde a cualquiera que lo llame con `curl`. El fallo típico no es "no hay login", es "hay login pero no compruebo que el pedido #4012 sea tuyo".
**Verificación — la prueba del ID ajeno:**
```bash
# Con la sesión del usuario A, pide un recurso del usuario B.
curl -H "Cookie: <sesión de A>" https://tuapp.com/api/pedidos/<id-de-B>
# Debe responder 403 o 404. Si responde 200 con los datos, tienes una brecha.
```
Recorre tu lista de rutas una por una con esta prueba. Es tediosa y es la que más brechas encuentra.

**Supabase:** activa Row Level Security en **todas** las tablas y escribe políticas explícitas. Sin RLS, la anon key lee la tabla entera desde el navegador de cualquiera.
```sql
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dueño lee lo suyo" ON pedidos
  FOR SELECT USING (auth.uid() = user_id);
```
**Señal de alarma:** una tabla con datos de usuarios y RLS desactivado. O un `await` olvidado delante de la comprobación de sesión — la promesa nunca se resuelve, la condición es truthy, y todo pasa.

---

### 3.5 · Validación de inputs en el servidor
**Qué:** validar tipo, formato, longitud y rango de todo lo que llega del cliente, en el servidor. Zod, Valibot o similar.
**Por qué:** la validación del formulario en el navegador es comodidad para el usuario, no seguridad — se salta con una petición directa. Sin validación en servidor entran datos corruptos, se caen procesos y se abren vectores de inyección.
**Extra crítico:** los campos que el cliente **no** debe poder mandar. Si tu endpoint hace `update(req.body)` a ciegas, alguien te manda `{"rol": "admin"}` y se asciende solo. Define un esquema con lista blanca de campos.
**Verificación:** manda a cada endpoint un string donde espera número, un campo extra que no existe, y un texto de 10.000 caracteres. Ninguna de las tres debe crashear ni escribirse en la base.
**Señal de alarma:** cualquier `req.body` pasado directo a una query o a un `update`.

---

### 3.6 · Rate limiting
**Qué:** límite de peticiones por IP o por usuario y ventana de tiempo.
**Por qué:** tres razones distintas. Bots que llenan tu base de basura; fuerza bruta contra el login; y —el más caro— si tu endpoint llama a una API de pago, alguien en bucle te genera una factura de cuatro cifras en una noche.
**Dónde va sí o sí:** login, registro, recuperación de contraseña, formularios públicos, cualquier endpoint que llame a una API externa de pago.
**Verificación:** lanza 100 peticiones seguidas al login y confirma que a partir de cierto punto responde 429.
**Señal de alarma:** un endpoint que llama a un LLM o a un servicio de email sin límite alguno.

---

### 3.7 · Logs y monitoreo
**Qué:** captura de errores en producción, tiempos de respuesta y alertas.
**Por qué:** es tu instrumento de medición. Todas las capas de rendimiento que siguen dependen de tener datos reales; sin esto, optimizar es adivinar. Y un error que nadie ve no se arregla nunca.
**Por nivel:**
- **N0/N1:** basta con monitor de uptime (UptimeRobot, Better Stack) y analítica ligera (Plausible, Vercel Analytics).
- **N2/N3:** añade captura de errores (Sentry) y logs consultables (Axiom, Better Stack, Logtail).

**Configuración mínima:** alerta por email o Slack cuando aparezca un error nuevo o cuando el sitio caiga. Sin alerta configurada, el panel no lo mira nadie.
**Cuidado con qué logueas:** nunca contraseñas, tokens, ni tarjetas. Ni siquiera "temporalmente para depurar" — los logs se guardan meses.
**Señal de alarma:** te enteras de las caídas porque te escribe un usuario.

---

### 3.8 · Índices en la base de datos
**Qué:** estructura auxiliar que evita que la base recorra la tabla entera para encontrar filas.
**Por qué:** el mayor retorno por esfuerzo que existe en rendimiento. Una query de 2 segundos baja a 5 milisegundos con una línea de SQL.
**Regla práctica:** índice en toda columna usada en `WHERE`, `ORDER BY` o `JOIN`. Especialmente **foreign keys** — Postgres crea el índice de la primary key automáticamente, pero **no** el de las foreign keys.
**Verificación:**
```sql
EXPLAIN ANALYZE SELECT * FROM pedidos WHERE user_id = 'abc';
-- "Seq Scan" sobre tabla grande = falta índice
-- "Index Scan" = correcto
CREATE INDEX idx_pedidos_user_id ON pedidos(user_id);
```
**No te pases:** cada índice ralentiza las escrituras y ocupa espacio. Indexa lo que consultas, no todo.
**Señal de alarma:** una pantalla que iba instantánea en desarrollo tarda tres segundos en producción con datos reales.

---

### 3.9 · Consultas N+1
**Qué:** un query dentro de un bucle. Traes 50 pedidos y luego lanzas 50 queries más, una por el cliente de cada pedido.
**Por qué:** en local con 10 filas de prueba es invisible. En producción con 5.000, la app se arrodilla. Es el segundo problema de rendimiento más común en código generado por IA, porque escribir el bucle es la solución más obvia y legible.
**Cómo se arregla:** un `JOIN`, o el `include`/`with` de tu ORM.
```javascript
// Mal: 1 + N queries
const pedidos = await db.pedido.findMany();
for (const p of pedidos) {
  p.cliente = await db.cliente.findUnique({ where: { id: p.clienteId } });
}

// Bien: 1 query
const pedidos = await db.pedido.findMany({ include: { cliente: true } });
```
**Verificación:** activa el log de queries de tu ORM, carga una página de listado y cuenta. Si el número de queries crece con el número de filas, es N+1.

---

### 3.10 · Prueba de carga
**Qué:** simular usuarios concurrentes con k6 o Artillery para ver qué se rompe primero y a partir de cuántos.
**Por qué:** es lo que convierte "creo que aguanta" en un número. Y define qué optimizar después — sin ella, la capa de caché es superstición.
**Cuándo:** después de índices y N+1 (si no, solo confirmas problemas que ya conocías) y antes del lanzamiento.
**Cómo empezar:**
```javascript
// carga.js — k6
import http from 'k6/http';
export const options = { vus: 50, duration: '30s' };
export default function () {
  http.get('https://tuapp.com/api/productos');
}
// ejecutar: k6 run carga.js
```
**Qué mirar:** el p95 de latencia (no el promedio, que esconde los picos), la tasa de errores, y el punto exacto donde la latencia se dispara.
**Regla:** ejecútala contra staging, nunca contra producción con usuarios reales dentro.

---

### 3.11 · Connection pooling
**Qué:** reutilizar conexiones a la base en lugar de abrir una nueva por cada petición.
**Por qué:** abrir una conexión a Postgres es caro y el límite es bajo (~100 en planes pequeños). **En serverless no es opcional:** cada invocación de función abre su propia conexión y agotas el límite con muy poco tráfico. El síntoma es un `too many connections` intermitente que no puedes reproducir en local.
**Qué hacer según el caso:**
- **Vercel / Lambda / Netlify Functions + Postgres:** obligatorio. Usa el pooler de Supabase o Neon (el string de conexión en modo *transaction*, puerto 6543 en Supabase), o PgBouncer.
- **Servidor tradicional (VPS, Railway, Render) con Prisma o Drizzle:** ya viene incluido. No toques nada.
- **Prisma en serverless:** además del pooler, usa una instancia global del cliente para no crear una nueva por invocación.

**Señal de alarma:** errores de conexión que aparecen solo cuando hay algo de tráfico y desaparecen solos.

---

### 3.12 · CDN y optimización de imágenes
**Qué:** servir assets estáticos desde nodos cercanos al usuario, y servir imágenes en el formato y tamaño correctos.
**Por qué:** el CDN probablemente ya lo tienes — Vercel, Netlify y Cloudflare lo activan por defecto. **Verifícalo antes de "implementarlo".** El trabajo real casi siempre está en las imágenes: un hero de 4 MB sin comprimir arruina el tiempo de carga por mucho CDN que haya.
**Verificación:**
```bash
curl -I https://tuapp.com/logo.png | grep -i "cache-control\|cf-cache\|x-vercel-cache"
```
**Las imágenes:** convierte a WebP o AVIF, sirve el tamaño que realmente se muestra (no un 3000px escalado por CSS), y usa `loading="lazy"` en lo que está bajo el pliegue. En Next.js, el componente `<Image>` hace las tres cosas.
**Medición:** PageSpeed Insights sobre la URL en producción, no en local.

---

### 3.13 · Capa de caché
**Qué:** guardar resultados costosos (en Redis, normalmente) para no recalcularlos.
**Por qué va la última, a propósito:** la invalidación de caché produce los bugs más difíciles de reproducir que vas a encontrar. Datos que no se actualizan sin razón aparente, y en el peor caso —caché mal segmentada por usuario— una persona viendo los datos de otra. Ese bug se descubre tarde y duele.
**Cuándo añadirla:** solo contra un cuello de botella concreto que la prueba de carga señaló y que un índice no resolvió. Nunca "por si acaso".
**Antes de Redis, prueba lo barato:** el caché de datos de tu framework (`revalidate` en Next.js), o cabeceras HTTP correctas. Resuelven la mayoría de los casos sin infraestructura nueva.
**Regla de oro:** define el TTL y la estrategia de invalidación *antes* de escribir la primera línea. Si no sabes cuándo se invalida, no la añadas todavía.

---

### 3.14 · Cabeceras de seguridad y HTTPS
**Qué:** HTTPS forzado, y cabeceras `Content-Security-Policy`, `X-Frame-Options`, `Strict-Transport-Security`, `X-Content-Type-Options`.
**Por qué:** protegen contra clickjacking, inyección de scripts y downgrade de protocolo. Son unas pocas líneas de configuración con retorno inmediato.
**Aplica a todos los niveles**, incluido un landing estático — cuesta cinco minutos.
**Verificación:** pega tu URL en `securityheaders.com`. Apunta a B o mejor.

---

### 3.15 · Política de datos y borrado de cuenta
**Qué:** política de privacidad real, banner de cookies solo si usas cookies no esenciales, y una vía para que el usuario exporte y borre sus datos.
**Por qué:** obligación legal en la mayoría de jurisdicciones desde el momento en que guardas datos personales, y no depende del tamaño de tu proyecto.
**Mínimo funcional:** qué datos guardas, para qué, con quién los compartes (proveedores incluidos), y un email de contacto. Que el borrado de cuenta funcione de verdad y no solo marque una casilla.

---

### 3.16 · Auditoría de dependencias
**Qué:** revisar vulnerabilidades conocidas en tus paquetes.
**Por qué:** heredas los fallos de todo lo que instalas, y un proyecto vibe-coded acumula dependencias rápido.
**Verificación:** `npm audit --production` antes de cada deploy importante. Activa Dependabot en el repo. Revisa mensualmente.
**Regla adicional:** antes de instalar un paquete que sugirió la IA, comprueba que existe de verdad y que tiene tráfico real en npm. Hay paquetes maliciosos registrados con nombres que los modelos tienden a inventar.

---

### 3.17 · Registro de auditoría · *solo N3*
**Qué:** log inmutable de acciones sensibles: quién, qué, cuándo, desde dónde. Cambios de rol, reembolsos, borrados, accesos de administración.
**Por qué:** cuando algo va mal con dinero o datos sensibles, necesitas poder reconstruir qué pasó. También es requisito de cumplimiento en muchos casos.
**Regla:** el audit log solo se escribe, nunca se edita ni se borra desde la aplicación.

---

### 3.18 · Idempotencia y webhooks firmados · *solo N3*
**Qué:** que una operación repetida no se ejecute dos veces (clave de idempotencia), y que verifiques la firma criptográfica de cada webhook entrante.
**Por qué:** un doble clic o un reintento de red no puede cobrar dos veces. Y un endpoint de webhook sin verificación de firma es una API abierta: cualquiera puede simular un "pago completado".
**Verificación:** manda un POST falso a tu endpoint de webhook sin firma válida. Debe rechazarlo con 400.
**Regla dura:** el estado del pedido lo decide tu servidor tras consultar al proveedor de pagos. Nunca lo decide un parámetro que llegó del navegador.

---

### 3.19 · Entorno de staging
**Qué:** una copia del entorno de producción con base de datos separada, donde probar antes de desplegar.
**Por qué:** las pruebas de carga y las migraciones destructivas necesitan un sitio donde fallar sin consecuencias.
**Regla dura:** staging **nunca** apunta a la base de producción. Es un error de una línea en un `.env` y borra datos reales.

---

### 3.20 · 2FA en cuentas de infraestructura
**Qué:** segundo factor en GitHub, el hosting, el proveedor de base de datos, el dominio y la pasarela de pagos.
**Por qué:** toda tu seguridad de aplicación es irrelevante si alguien entra a tu panel de Vercel con una contraseña reutilizada. Cinco minutos, una vez.

---

## 4. Disparadores de Escalada (trip-wires)

**El asistente vigila estos disparadores en cada turno.** Si aparece uno, el proyecto cambió de naturaleza aunque el usuario no lo haya dicho.

### 4.1 · Disparadores por petición del usuario

| Frase o intención | Nuevo nivel |
|---|---|
| "agrega login" / "que los usuarios se registren" | **N2** |
| "guárdalo en la base" / "que persista" | **N2** |
| "un panel para ver los mensajes" | **N2** |
| "que puedan subir fotos / archivos" | **N2** (subida de archivos = superficie propia) |
| "manda un email cuando…" | **N1** mínimo (rate limiting obligatorio) |
| "conéctalo con la API de OpenAI/Claude/…" | **N1** mínimo (rate limiting obligatorio, hay coste por llamada) |
| "que se pueda pagar" / "suscripciones" / "Stripe" | **N3** |
| "un panel de administrador" | **N3** |
| "guarda su DNI / historia clínica / datos del menor" | **N3** |
| "que sea multi-empresa / multi-tenant" | **N3** (aislamiento entre tenants es crítico) |

### 4.2 · Disparadores por cambio en el código

Escalar automáticamente al detectar:

- Instalación de `@supabase/*`, `prisma`, `drizzle-orm`, `mongoose`, `pg`, `mysql2` → **N2**
- Instalación de `next-auth`, `@clerk/*`, `lucia`, `@auth/*` → **N2**
- Instalación de `stripe`, `@stripe/*`, `mercadopago`, `paypal-*` → **N3**
- Creación del primer archivo en `app/api/`, `pages/api/`, `server/`, `functions/` → **N2**
- Creación o modificación de `.env` con algo que no sea una URL pública → revisar capa 3.3
- Primer `CREATE TABLE` o primera migración → **N2**
- Aparición de un campo `role`, `is_admin`, `permissions` en un esquema → **N3**

### 4.3 · Regla del cambio silencioso

Si el usuario pide una funcionalidad que **implica** una capa nueva sin nombrarla, el asistente la nombra en voz alta antes de implementarla.

> Ejemplo. Usuario: *"ponle un formulario de contacto que guarde los mensajes para verlos después"*.
> "Guardar" implica base de datos, y "verlos después" implica un panel con acceso restringido. Eso convierte un N1 en un N2. El asistente lo dice antes de escribir el código, no después.

---

## 5. Protocolo de Escalada

Cuando se dispara una escalada, el asistente ejecuta estos cinco pasos **en orden**, sin saltarse ninguno.

### Paso 1 — Detener y anunciar
Antes de escribir la funcionalidad pedida:

```
⚠️ Cambio de nivel detectado: N1 → N2
Disparador: "que los usuarios puedan guardar sus favoritos"
Motivo: requiere base de datos y cuentas de usuario.

Capas que se activan y no estaban:
  • Backups de base de datos (3.2)
  • Autorización en cada endpoint (3.4)
  • Índices (3.8)
  • Connection pooling — este deploy es serverless (3.11)

Voy a aplicar los mínimos irrenunciables antes de seguir con la funcionalidad.
```

### Paso 2 — Aplicar los mínimos irrenunciables

Estas capas se implementan **en el mismo momento de la escalada**, no en una tarea futura:

| Escalada | Mínimos antes de continuar |
|---|---|
| → **N1** | Validación en servidor (3.5) + rate limiting (3.6) |
| → **N2** | Secretos verificados (3.3) + autorización o RLS en las tablas nuevas (3.4) + backups configurados (3.2) |
| → **N3** | Todo lo de N2 + webhooks firmados (3.18) + audit log en las acciones sensibles (3.17) + staging separado (3.19) |

El resto de capas del nivel nuevo se anotan como pendientes con fecha objetivo en `PROJECT-LEVEL.md`.

### Paso 3 — Auditar lo ya construido bajo el nivel viejo

Lo escrito antes de la escalada se hizo con reglas más laxas. Revisar:
- ¿Hay endpoints creados antes que ahora manejan datos de usuario y no verifican permisos?
- ¿Alguna clave nueva quedó con prefijo público?
- ¿Las tablas creadas antes tienen RLS activo?

### Paso 4 — Actualizar la ficha
Registrar la escalada en `PROJECT-LEVEL.md` con fecha y motivo (plantilla en la Sección 6).

### Paso 5 — Continuar con la funcionalidad pedida
Ahora sí, implementar lo que el usuario pidió.

### Si el usuario dice "eso lo hacemos después"

Es su proyecto y su decisión. El asistente:
1. Advierte una sola vez, concreto y sin dramatismo: *"Sin RLS, cualquiera con la anon key —que está en el bundle del navegador— puede leer la tabla completa de usuarios."*
2. Lo anota en `PROJECT-LEVEL.md` bajo **Deuda de seguridad aceptada**, con fecha.
3. Continúa con lo pedido.
4. Lo vuelve a plantear en la auditoría pre-lanzamiento (Sección 7), no antes.

**Excepción sin negociación:** una clave de servicio expuesta en el cliente o una tabla de datos personales legible por cualquiera se arregla en el momento. No es una preferencia de calidad, es una brecha activa.

---

## 6. Ficha de estado del proyecto

Crear `PROJECT-LEVEL.md` en la raíz del repo. El asistente lo lee al inicio de cada sesión y lo actualiza en cada escalada.

```markdown
# Estado del Proyecto

**Nivel actual:** N2 — Aplicación
**Nivel previsto:** N3 (pagos previstos para octubre)
**Última revisión:** 2026-08-15

## Stack
- Framework: Next.js 15 (App Router)
- Hosting: Vercel (serverless → pooling obligatorio)
- Base: Supabase Postgres
- Auth: Supabase Auth

## Historial de escaladas
| Fecha | De → A | Disparador |
|---|---|---|
| 2026-07-02 | N0 → N1 | Formulario de contacto |
| 2026-08-10 | N1 → N2 | Login de usuarios y tabla `favoritos` |

## Capas aplicadas
- [x] 3.1 Git + remoto
- [x] 3.2 Backups — restauración probada: 2026-08-11
- [x] 3.3 Secretos verificados (grep en bundle: limpio)
- [x] 3.4 RLS activo en: usuarios, favoritos
- [x] 3.5 Validación con Zod en todos los endpoints
- [x] 3.6 Rate limiting en /api/auth/*
- [x] 3.7 Sentry + alertas por email
- [ ] 3.8 Índices — pendiente revisar `favoritos.user_id`
- [ ] 3.9 N+1 — sin revisar
- [ ] 3.10 Prueba de carga — pendiente, pre-lanzamiento
- [x] 3.11 Pooling (Supabase, puerto 6543)
- [ ] 3.12 CDN activo; imágenes sin optimizar
- [ ] 3.14 Cabeceras de seguridad
- [ ] 3.15 Política de privacidad
- [x] 3.20 2FA en GitHub, Vercel, Supabase

## Deuda de seguridad aceptada
| Fecha | Qué | Riesgo | Revisar en |
|---|---|---|---|
| 2026-08-12 | Sin rate limit en /api/buscar | Abuso, coste de queries | Pre-lanzamiento |

## Notas
- La tabla `logs_antiguos` se creó antes de activar RLS — auditada 2026-08-11, no contiene datos personales.
```

---

## 7. Auditoría pre-lanzamiento

Ejecutar antes del primer deploy público, y de nuevo tras cualquier escalada de nivel.

### Nivel 0 — Estático
- [ ] Repo en remoto y actualizado
- [ ] HTTPS activo, `http://` redirige
- [ ] Cabeceras de seguridad (nota B+ en securityheaders.com)
- [ ] Imágenes en WebP/AVIF y dimensionadas
- [ ] PageSpeed móvil > 85
- [ ] Monitor de uptime configurado
- [ ] Meta tags, favicon, OG image, `sitemap.xml`, `robots.txt`
- [ ] Enlaces revisados (ninguno a `localhost` o a `#`)

### Nivel 1 — Estático con formulario
Todo lo de N0, más:
- [ ] Validación en servidor de cada campo
- [ ] Rate limiting en el endpoint del formulario
- [ ] Protección anti-bot (honeypot o Turnstile)
- [ ] Claves del servicio de email verificadas fuera del cliente (grep al bundle)
- [ ] Probado el envío con payload malicioso: no rompe, no reenvía HTML crudo

### Nivel 2 — Aplicación
Todo lo de N1, más:
- [ ] Grep de secretos en bundle **y en historial de Git**: limpio
- [ ] RLS activo en todas las tablas con datos de usuario
- [ ] **Prueba del ID ajeno** ejecutada en cada endpoint: todos 403/404
- [ ] Backup restaurado con éxito al menos una vez (fecha anotada)
- [ ] `EXPLAIN ANALYZE` en las 5 queries más usadas: sin Seq Scan sobre tablas grandes
- [ ] Log de queries revisado en las páginas de listado: sin N+1
- [ ] Pooling configurado si el deploy es serverless
- [ ] Sentry capturando y alertando
- [ ] `npm audit --production` sin vulnerabilidades altas o críticas
- [ ] Política de privacidad publicada y borrado de cuenta funcional
- [ ] 2FA en todas las cuentas de infraestructura
- [ ] Prueba de carga básica ejecutada contra staging

### Nivel 3 — Aplicación crítica
Todo lo de N2, más:
- [ ] Webhooks de pago verifican firma (probado con POST sin firma → 400)
- [ ] Claves de idempotencia en toda operación de cobro
- [ ] El estado del pedido lo determina el servidor, nunca un parámetro del cliente
- [ ] Audit log escribiendo en todas las acciones administrativas
- [ ] Staging separado, con base propia, confirmado que no apunta a producción
- [ ] Prueba de carga completa con p95 y tasa de error documentados
- [ ] Escalada de privilegios probada: usuario normal intentando acciones de admin → todas rechazadas
- [ ] Plan de respuesta a incidentes escrito (a quién avisar, cómo revocar claves, cómo restaurar)

---

## 8. Anexo — Fallos recurrentes en desarrollo asistido por IA

Lista de verificación rápida de los errores que más se repiten. No son teóricos.

1. **Clave de servicio con prefijo público.** `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` — el asistente la puso ahí porque así funcionaba desde el cliente. Es acceso total a tu base desde el navegador de cualquiera.
2. **RLS desactivado.** Supabase deja las tablas nuevas sin RLS por defecto. La anon key es pública. Sin RLS, la tabla es pública.
3. **`await` olvidado en la comprobación de sesión.** `if (!getSession())` sobre una promesa siempre es falso. La comprobación no comprueba nada y no lanza error.
4. **Autorización solo en la UI.** El botón "Editar" oculto, el endpoint `PATCH /api/posts/:id` abierto.
5. **Consulta N+1 en el listado.** Invisible con datos de prueba, letal con datos reales.
6. **Foreign key sin índice.** Postgres no la crea sola. Es la causa más común de la query que "de repente" va lenta.
7. **`update(req.body)` sin lista blanca.** Permite que el cliente escriba campos que no debería tocar, como `role`.
8. **Migración destructiva ejecutada contra producción** desde un `.env` mal apuntado.
9. **Paquete inventado.** Los modelos alucinan nombres de paquetes, y hay quien registra esos nombres con código malicioso. Verifica en npm antes de instalar.
10. **Endpoint que llama a un LLM sin rate limit.** El coste no es tuyo hasta que llega la factura.
11. **Datos sensibles en los logs.** El `console.log(user)` de depuración que quedó en producción y ahora hay tokens en un log que se guarda seis meses.
12. **CORS con `*`.** Permitido en desarrollo, copiado a producción, y cualquier web puede llamar a tu API con las cookies del usuario.
