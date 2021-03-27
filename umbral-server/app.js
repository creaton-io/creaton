const umbral = require('umbral-pre-wasm');
const express = require('express');
const {Base64} = require('js-base64');
const sqlite3 = require('sqlite3');
const {ethers} = require('ethers');

const db = new sqlite3.Database('data/db.sqlite');
db.run(
  'CREATE TABLE IF NOT EXISTS `KFrags` ( `signing_pk` TEXT NOT NULL, `bob_pk` TEXT NOT NULL, `kfrag` TEXT NOT NULL, PRIMARY KEY(`signing_pk`,`bob_pk`) )'
);
const app = express();
var cors = require('cors');
app.use(cors());
var morgan = require('morgan');
app.use(morgan('tiny'));
app.use(express.json());
const port = 3010;

app.get('/', (req, res) => {
  res.send(ursula_memory);
});

const ursula_memory = {};

app.post('/grant', async (req, res) => {
  const signing_pk = req.body.signing_pk;
  const kfrag = req.body.kfrag;
  const bob_pk = req.body.bob_pk;
  const kfrag_digest = ethers.utils.keccak256(Base64.toUint8Array(kfrag));
  const recovered_signing_pk = ethers.utils.computePublicKey(
    ethers.utils.recoverPublicKey(kfrag_digest, req.body.signature),
    true
  );
  const original_signing_pk = ethers.utils.hexlify(Base64.toUint8Array(signing_pk));
  if (original_signing_pk !== recovered_signing_pk) res.status(400).send('Digest mismatch');
  else {
    console.log(original_signing_pk, recovered_signing_pk);
    db.run('INSERT OR IGNORE INTO `KFrags`(`signing_pk`,`bob_pk`,`kfrag`) VALUES (?,?,?)', signing_pk, bob_pk, kfrag);
    res.send('OK');
  }
});

app.post('/reencrypt', async (req, res) => {
  let signing_pk = req.body.signing_pk;
  const original_bob_pk = ethers.utils.hexlify(Base64.toUint8Array(req.body.bob_pk));
  const capsule_digest = ethers.utils.keccak256(Base64.toUint8Array(req.body.capsule));
  const recovered_bob_pk = ethers.utils.computePublicKey(
    ethers.utils.recoverPublicKey(capsule_digest, req.body.signature),
    true
  );
  if (original_bob_pk !== recovered_bob_pk) {
    res.status(400).send('Digest mismatch');
    return;
  }
  db.get(
    'SELECT `signing_pk`, `bob_pk`, `kfrag` FROM `KFrags` WHERE `signing_pk` = ? AND `bob_pk` = ?',
    signing_pk,
    req.body.bob_pk,
    function (err, row) {
      if (!row) {
        res.status(400).send('KFrag not found');
        return;
      }
      let kfrag = umbral.KeyFrag.from_array(Base64.toUint8Array(row.kfrag));
      signing_pk = umbral.PublicKey.from_array(Base64.toUint8Array(signing_pk));
      let alice_pk = umbral.PublicKey.from_array(Base64.toUint8Array(req.body.alice_pk));
      let bob_pk = umbral.PublicKey.from_array(Base64.toUint8Array(req.body.bob_pk));
      let capsule = umbral.Capsule.from_array(Base64.toUint8Array(req.body.capsule));
      console.assert(kfrag.verify_with_delegating_and_receiving_keys(signing_pk, alice_pk, bob_pk), 'kfrag is invalid');
      let metadata = 'creaton'; // this is useless
      let enc = new TextEncoder();
      let cfrag = umbral.reencrypt(capsule, kfrag, enc.encode(metadata));
      res.send(Base64.toBase64(cfrag.to_array()));
    }
  );
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
