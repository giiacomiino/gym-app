# gym-app (ACL → SKI PREP)

Lee **`CONTEXT.md`** primero: es el contexto completo del proyecto (qué es, preferencias de Giacomo, arquitectura, programa, cómo verificar y publicar).

Reglas rápidas:
- HTML/JS estático sin build. Verificar con Playwright de `~/FFMSivaBot/.venv` (ver CONTEXT §8).
- Subir la versión de `CACHE` en `sw.js` en cada cambio visible.
- `git push` lo corre Giacomo (no hay token guardado). Nunca guardar tokens en archivos: el repo es público.
- No tocar JAX.
