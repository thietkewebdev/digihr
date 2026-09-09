# DigiHR Railway archive

Public download of `digihr-railway.tar.gz` (131142 bytes).

SHA256: `d8eea606be747f9df548d1b7f150fcec0085cf2944754fb4ab376696123401ba`

## Reconstruct from parts

```bash
curl -fsSL https://raw.githubusercontent.com/thietkewebdev/digihr/main/transfer/part0.b64 \
     https://raw.githubusercontent.com/thietkewebdev/digihr/main/transfer/part1.b64 \
     https://raw.githubusercontent.com/thietkewebdev/digihr/main/transfer/part2.b64 \
     https://raw.githubusercontent.com/thietkewebdev/digihr/main/transfer/part3.b64 \
     https://raw.githubusercontent.com/thietkewebdev/digihr/main/transfer/part4.b64 \
  | tr -d '\n' | base64 -d > digihr-railway.tar.gz

sha256sum digihr-railway.tar.gz
# must be d8eea606be747f9df548d1b7f150fcec0085cf2944754fb4ab376696123401ba
```

## Deploy on Railway

```bash
tar -xzf digihr-railway.tar.gz
cd digihr-railway   # or the extracted root
npm install
npm run build
npm start
```
