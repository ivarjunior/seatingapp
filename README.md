# Ivarium Seating App

Standalone app waarmee gasten via QR-code hun tafel en stoel kunnen vinden. Kan gekoppeld worden aan de bruiloft-gastenlijst en seating in **Ivarium Labs**.

## Flow voor gasten

1. Scan QR-code → opent de app (`/`)
2. Kies je naam in het dropdown-menu (met zoekveld)
3. Bekijk je plek op de zaalplattegrond en tafelweergave (`/plek/[id]`)

## Koppeling met Ivarium Labs (aanbevolen)

### 1. Ivarium Labs (`frontend/.env.local`)

```env
# Geheim token voor de publieke seating API (kies een lange random string)
PUBLIC_WEDDING_SEATING_TOKEN=jouw-geheime-token

# URL van deze gasten-app (voor link in wedding cockpit)
NEXT_PUBLIC_SEATING_APP_URL=http://localhost:3010
```

Herstart de ivariumlabs dev server na wijzigingen.

### 2. Seating app (`ivarium-seatingapp/.env.local`)

```env
IVARIUM_API_URL=http://127.0.0.1:3001
IVARIUM_SEATING_EVENT_ID=<sanity _id van je bruiloft event>
IVARIUM_SEATING_TOKEN=jouw-geheime-token
NEXT_PUBLIC_APP_URL=http://localhost:3010
IVARIUM_ADMIN_SEATING_URL=http://127.0.0.1:3001/admin/events/weddings?eventId=<eventId>
```

Het **event ID** vind je in de URL van de wedding cockpit:  
`/admin/events/weddings?eventId=...`

### 3. Seating beheren

- Gasten en RSVP: Ivarium Labs → Wedding cockpit → gasten / RSVP
- Tafelindeling: dezelfde cockpit → **Bewerkbare tafelindeling**
- Alleen gasten met status **Aanwezig** en een toegewezen tafel verschijnen in de gasten-app

API endpoint (door de seating app gebruikt):

`GET /api/public/weddings/seating?eventId=...&token=...`

## Lokaal starten (zonder koppeling)

Zonder Ivarium-variabelen gebruikt de app `data/seating.json`.

```bash
cd ivarium-seatingapp
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3010](http://localhost:3010).

## Native iOS app

De native SwiftUI/Xcode-app staat in `IvariumSeating.xcodeproj`.

```bash
open IvariumSeating.xcodeproj
```

Kies in Xcode de scheme `IvariumSeating` en run op een iPhone- of iPad-simulator. De iOS-app gebruikt de gebundelde seating-data in `IvariumSeating/Resources/seating.json`.

## QR op telefoons (zelfde netwerk)

```env
NEXT_PUBLIC_APP_URL=http://192.168.x.x:3010
```

```bash
npx next dev --hostname 0.0.0.0 --port 3010
```

## Pagina's

| Route | Doel |
|-------|------|
| `/` | Naam kiezen |
| `/plek/[id]` | Visuele plek |
| `/admin` | Beheer (lokaal) of status (ivarium) |
| `/admin/qr` | QR-code |
# seatingapp
