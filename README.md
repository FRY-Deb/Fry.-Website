# FRY. — Web

Web estática de FRY. (Nashville Hot Chicken, Villaverde, Madrid). Sin build, sin npm, sin frameworks — HTML + CSS + JS puro, lista para subir tal cual a GitHub.

## Antes de publicar

1. **Cambia el número de WhatsApp.** Ahora mismo está puesto un número de ejemplo (`34600000000`) en `lib/manifest.js` y repetido en los enlaces `data-whatsapp-link` de `index.html`, `carta.html` y `contacto.html`. Búscalo y sustitúyelo por tu número real en todos esos sitios (formato: `34` + tu número, sin espacios ni `+`).
2. **Añade tus redes sociales.** En `lib/manifest.js`, dentro de `social`, sustituye los `"#"` por los enlaces reales de Instagram y TikTok (y en los `data-instagram-link` / `data-tiktok-link` del HTML si quieres que funcionen también sin JavaScript).
3. **Revisa los precios de la carta** en `carta.html` y `lib/manifest.js` — están puestos según lo hablado hasta ahora, pero conviene que los repases antes de publicar.

## Subir a GitHub

```bash
cd fry-website
git init
git add .
git commit -m "Primera versión de la web de FRY."
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

## Publicar gratis con GitHub Pages

1. En GitHub, entra al repositorio → **Settings** → **Pages**.
2. En "Source", elige la rama `main` y la carpeta `/ (root)`.
3. Guarda. En 1-2 minutos tu web estará en `https://TU-USUARIO.github.io/TU-REPO/`.

## Si en vez de GitHub Pages usas Hostinger u otro hosting con Apache

El archivo `.htaccess` ya está incluido y configurado para que el sitio no se quede con versiones viejas en caché tras cada actualización. Cada vez que cambies `styles.css` o `main.js`, actualiza el número de versión (`?v=20260827`) en los `<link>` y `<script>` de cada página HTML — así el navegador descarga la versión nueva en vez de la guardada en caché.

## Estructura

```
index.html          → Inicio
carta.html           → Carta completa con precios
contacto.html        → WhatsApp, zona de entrega, redes
styles.css            → Todos los estilos
main.js               → Comportamiento (menú móvil, animaciones, WhatsApp)
lib/manifest.js       → Datos de la marca (nombre, precios, WhatsApp, redes) — edítalo aquí primero
lib/gsap.min.js        → Librería de animación (solo para el efecto de marquesina)
assets/fonts/          → Anton (títulos) e Inter (texto), autoalojadas
assets/favicon.svg     → Icono de pestaña
```

No hay `node_modules`, no hace falta instalar nada. Abre `index.html` en el navegador para verla en local, o usa cualquier servidor estático.
