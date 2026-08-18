# Session Handoff — AKAMBA sur Mercur

## État au 18 août 2026

AKAMBA reste une personnalisation de Mercur/Medusa. Le Storefront reste prévu pour Vercel. Aucun reset de base, suppression de migration, secret, abonnement payant ou changement de version majeure non nécessaire n'a été effectué.

## Réalisé

### Storefront et marque

- Le middleware est stabilisé : locale pays exacte, remplacement des préfixes invalides, repli déterministe sur `cm`, cache des régions tolérant aux erreurs, timeout backend, routes protégées par segments et redirections de connexion sûres.
- La redirection du formulaire de connexion n'est exécutée qu'après une authentification réussie et accepte uniquement un `redirectTo` local.
- La configuration de marque est centralisée dans `apps/storefront/src/config/brand.ts` : AKAMBA, Cameroun, `cm`, `fr-CM`, `XAF`, URL, logo, Open Graph et identifiants mobiles.
- Logo, métadonnées, SEO, hreflang, accueil, en-tête, pied de page, panier, checkout, catégories, collections et vendeurs consomment ce branding.
- Un manifest PWA et les routes `.well-known` Apple/Android sont prêts. Elles renvoient volontairement `503` tant que les identifiants de signature requis ne sont pas configurés.
- La dépendance réseau à Google Fonts a été retirée du build au profit d'une pile système.

### Cameroun, environnement et déploiement

- `apps/storefront/.env.template` et `apps/api/.env.template` documentent les variables requises sans valeur secrète, avec les valeurs AKAMBA/Cameroun/XAF et les options Apacheur, Babana, Capacitor et deep links.
- `apps/api/medusa-config.ts` exige les secrets JWT/cookie en production et n'active Babana que si la configuration complète est présente.
- `vercel.json` cible uniquement `apps/storefront` et utilise l'installation Bun figée.

### Architecture définitive de test

```text
https://akamba.nexorasmartech.store/
https://akamba.nexorasmartech.store/admin
https://akamba.nexorasmartech.store/vendor
https://akamba.nexorasmartech.store/api
```

- Le Storefront Next.js reste à la racine et reverse-proxy les trois préfixes avec `AKAMBA_ADMIN_ORIGIN`, `AKAMBA_VENDOR_ORIGIN` et `AKAMBA_API_ORIGIN`.
- Les préfixes `/admin` et `/vendor` sont conservés vers les applications Vite ; `/api` est retiré avant transmission à Medusa/Mercur.
- L'Admin est construit avec `VITE_APP_BASE=/admin/` et le Vendor avec `VITE_APP_BASE=/vendor/`. En local, les deux conservent `/` par défaut.
- Les quatre origines CORS de l'API utilisent `https://akamba.nexorasmartech.store`.

### Seed idempotent

- Le seed réutilise ou crée la région Cameroun en XAF, la taxe CM, les devises du store, la clé publiable, les vendeurs, membres, emplacements de stock, liens de canal de vente, zones/services de fulfillment, options de livraison, produits et offres.
- Il n'efface ni ne remplace les données déjà présentes. Les produits et offres sont détectés respectivement par handle et SKU.
- Les adresses de démonstration sont camerounaises, les tarifs utilisent XAF et le mot de passe vendeur provient de `SEED_SELLER_PASSWORD`.

### Apacheur et Babana

- `packages/types/src/apacheur` ajoute un contrat de négociation versionné dans `OfferDTO.metadata.akamba_apacheur`, avec gardes et fonctions de fusion. Il réutilise donc le modèle d'offre Mercur sans table ni migration parallèle.
- `packages/types/src/babana` définit les contrats de livraison à partir des DTO Medusa.
- `apps/api/src/providers/babana-fulfillment` fournit un provider Medusa standard/express, CM uniquement, avec tarifs plats. Aucune écriture vers un service externe n'est effectuée avant validation du contrat Babana.

### Mobile, deep links et OAuth

- Capacitor 8 est installé et configuré avec `cm.akamba.app`, les projets iOS/Android ont été générés et synchronisés.
- Le shell natif charge l'URL Vercel fournie par `CAPACITOR_SERVER_URL`, ce qui évite de convertir le Storefront Next serveur en export statique.
- Le schéma `akamba://` est déclaré sur iOS et Android.
- Le provider mobile traite les ouvertures à froid/chaud, valide les hôtes autorisés, ferme le navigateur OAuth et route vers le Storefront.
- Les helpers pour ouvrir OAuth dans le navigateur système et construire le callback mobile sont prêts.

## Vérifications

- Les builds Vite Admin (`VITE_APP_BASE=/admin/`) et Vendor (`VITE_APP_BASE=/vendor/`) réussissent ; leurs HTML utilisent les bons chemins d'assets et leurs bundles injectent les bons `basename` React Router.
- Les configurations Vite locales gardent `base=/`, `__BASE__=/` et `allowedHosts: ['.trycloudflare.com']` ; leurs contrôles TypeScript réussissent.
- Le build Storefront avec les trois origines de test réussit et `.next/routes-manifest.json` conserve `/admin` et `/vendor` tout en retirant `/api` des destinations Medusa.
- `bun run --cwd apps/storefront test:unit` : 7 tests middleware et deep links réussis.
- `bun run lint` : réussi.
- `bun run --cwd packages/types build` : réussi.
- `bun run --cwd apps/storefront build` : réussi.
- `bun run --cwd apps/storefront cap:sync` : iOS et Android synchronisés.
- `plutil -lint apps/storefront/ios/App/App/Info.plist` : valide.
- `NODE_OPTIONS=--max-old-space-size=8192 bunx turbo run build --concurrency=1` : 12 tâches sur 12 réussies.
- `git diff --check` : réussi.
- Le `tsc` API global reste rouge uniquement sur des scripts utilitaires préexistants (`seed-seller-order`, `probe-shared-priceset`, réservations et reviews). Aucun diagnostic ne concerne `seed.ts`, le provider Babana ou les nouveaux contrats.

## Configuration externe restante

- Choisir et configurer l'URL Vercel de production dans `NEXT_PUBLIC_BASE_URL`, `CAPACITOR_SERVER_URL` et `NEXT_PUBLIC_DEEP_LINK_HOSTS`.
- Fournir l'Apple Team ID et activer Associated Domains pour signer/valider les Universal Links iOS.
- Fournir l'empreinte SHA-256 du certificat Android pour `assetlinks.json` et ajouter le domaine HTTPS au filtre d'intent lorsque le domaine final est connu.
- Choisir le fournisseur OAuth et enregistrer `akamba://auth/callback` ainsi que le callback HTTPS auprès de ce fournisseur.
- Valider le contrat/API Babana avant d'activer `BABANA_FULFILLMENT_ENABLED=true` et de fournir sa clé.
- Définir `SEED_SELLER_PASSWORD` et exécuter le seed uniquement contre la base cible explicitement choisie.

## Fichiers principaux

- Storefront : `apps/storefront/src/config/brand.ts`, `src/middleware.ts`, `src/lib/middleware-utils.ts`, `src/lib/mobile.ts`, `src/components/providers/MobileDeepLink`, `src/app/manifest.ts`, `src/app/.well-known`, composants et métadonnées de marque.
- Mobile : `apps/storefront/capacitor.config.ts`, `capacitor-shell`, `ios`, `android`.
- API : `apps/api/medusa-config.ts`, `apps/api/src/scripts/seed.ts`, `apps/api/src/providers/babana-fulfillment`.
- Contrats : `packages/types/src/apacheur`, `packages/types/src/babana`, `packages/types/src/index.ts`.
- Déploiement/configuration : `apps/storefront/.env.template`, `apps/api/.env.template`, `vercel.json`, `bun.lock`.
