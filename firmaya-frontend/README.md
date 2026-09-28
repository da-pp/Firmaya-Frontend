# FirmaYA — Frontend

Frontend de la Plataforma Centralizada de Gestión de Contratos. Implementa los casos de uso CU-01 a CU-21 definidos en `docs/FirmaYA-145-213.pdf`.

Stack: Next.js 16 (App Router), React 19, JavaScript/JSX. No usa TypeScript.

## Ejecutar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Datos de demostración

El proyecto todavía no tiene backend. Los datos viven en `data/seed.js` y se guardan en el `localStorage` del navegador (clave `firmaya-demo-db-v1`). Para volver a los datos iniciales, borrá esa clave.

La capa `lib/services/` es la única que accede a los datos. Es el punto a reemplazar para conectar el backend real.

Usuarios internos (contraseña `Firmaya#2026`):

| Email | Rol | Estado |
|---|---|---|
| daniel@mail.com | Administrador | Activo |
| maria@mail.com | Abogado | Activo |
| martin@mail.com | Agente Inmobiliario | Activo |
| laura@mail.com | Agente Inmobiliario | Inactivo |

Enlaces de parte invitada (CU-04):

| Enlace | Parte | Contrato |
|---|---|---|
| `/acceso/acc-ana-palermo` | Firmante | Boleto de compraventa - Palermo (Listo para firmar) |
| `/acceso/acc-lucia-palermo` | Solo lectura | Boleto de compraventa - Palermo |
| `/acceso/acc-carlos-corrientes` | Revisor | Locación - Av. Corrientes 1240 |
| `/acceso/acc-sofia-belgrano` | Revisor | Locación - Belgrano 2450 (Archivado) |

Enlace de firma (CU-08): `/firmar/fir-ana-palermo`.

Los correos se simulan: el enlace de invitación, el código OTP y el enlace de recuperación de contraseña se escriben en la consola del navegador con el prefijo `[FirmaYA · correo simulado]`.
