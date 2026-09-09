# Transfer DigiHR

Public source: https://github.com/thietkewebdev/digihr

Do **not** concatenate `transfer/p*.b64`. Those chunks drifted during upload and will not decode to a valid tar.gz.

## Get the app

```bash
git clone https://github.com/thietkewebdev/digihr.git
cd digihr
npm install
npm run build
npm start
```

Railway: connect this GitHub repo. Nixpacks, Node 22, `npm run build` / `npm start`. Binds `0.0.0.0` and `$PORT`.

## Optional: make your own deploy tarball

```bash
tar -czf digihr-railway.tar.gz \
  --exclude=node_modules --exclude=.next --exclude=.git \
  --exclude=transfer --exclude=digihr-railway.tar.gz \
  .
```

Original in-session archive (not reconstructable from chat or `transfer/`):

- SIZE: 131142
- SHA256: d8eea606be747f9df548d1b7f150fcec0085cf2944754fb4ab376696123401ba
