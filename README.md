# Pre-arrival · MÍA Bacalar

Webapp del huésped para preparar la llegada. Next.js y JavaScript, con UX de app móvil.

La portada vive en `/` y en `/prearrival`. El código de reservación no va en la URL: se envía en `POST /api/public/prearrival/lookup`. El token queda en `sessionStorage`.

## Arranque

```bash
npm install
npm run dev
```

Sin `NEXT_PUBLIC_API_URL`, en desarrollo las llamadas usan un simulador local. Cualquier nombre y código abren una ficha de prueba. El código se envía tal como se escribe: un folio del PMS (`I  138949     1`) o un código corto (`MIA-1002369`). `CANCEL…` responde como reserva no disponible.

Con la API publicada, reservas de prueba: Luis Drain / `MIA-1002369`, Harrison Kairalla / `MIA-1002368`, Alejandra Zarate Nieto / `I1389491`.

## API real

En `.env`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5005
NEXT_PUBLIC_API_KEY=
```

`NEXT_PUBLIC_API_URL` puede ser el host o el host con `/api`. Las rutas del huésped son `/api/public/prearrival`. El hotel sale de la reserva: esta webapp no envía `hotel_id`.
