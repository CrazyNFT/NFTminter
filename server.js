require('dotenv').config();
const express = require('express');
const cors = require('cors')
const Web3 = require('web3');
const MongoClient = require('mongodb').MongoClient;
const ERC721ABI = require('./config/erc721.json');
const ERC1155ABI = require('./config/erc721.json');

var web3 = new Web3("https://rpc-mumbai.maticvigil.com");

const ERC721 = new web3.eth.Contract(ERC721ABI, "0x7A69E073705E7F7BFD40472C06551725d7219914");
const ERC1155 = new web3.eth.Contract(ERC1155ABI, "0x7772CdF98Bf070516CEBfEDE18aE8b39227227AB");

const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_URL}/${process.env.DB_NAME}\
?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const encodedParams = "0x485f0f700000000000000000000000000000000000000000000000000000000000ad253b0000000000000000000000\
00000000000000000000000000000000000013081b00000000000000000000000000000000000000000000000000000000000000600000000000000\
000000000000000000000000000000000000000000000000008676976656e55524c000000000000000000000000000000000000000000000000";

let collection;

async function run() {
  try {
  	console.log("Starting DB connection...");
    await client.connect();
    collection = await client.db("minter").collection("tokens");
    console.log("DB ready");
  } catch(e) {
  	console.log(e);
  }
}

run();

var app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());

app.post('/add', async function (req, res) {
	try {
		const { address, name, description, image, external_url, uri, type, count } = req.body;
		const newDocument = {
			minter: minter,
			name: name,
			description: description,
			image: image,
			external_url: external_url,
			type: type, // ERC721 or ERC1155
			count: count,
			timestamp: Date.now()
		}
		const result = await collection.insertOne(newDocument);
		res.send(result);
	} catch(e) {
		console.log(e);
		res.sendStatus(400);
	}
});

app.get('/all', async function (req, res) {
	try {
		const result = await collection.find({}, {sort: { timestamp: 1 }}).toArray();
		console.log(result);
		res.send(result);
	} catch(e) {
		console.log(e);
		res.sendStatus(400);
	}
});

app.post('/approve', async function (req, res) {
	try {
		const { id } = req.body;
		const status = await ERC721.methods.mintToCaller(signerAddress, 'https://gateway.pinata.cloud/ipfs/' + ipfsHash).send()
		const result = await collection.deleteOne({_id: id});
		console.log(result);
		res.send(result);
	} catch(e) {
		console.log(e);
		res.sendStatus(400);
	}
});

app.post('/decline', async function (req, res) {
	try {
		const { id } = req.body;
		const result = await collection.deleteOne({_id: id});
		console.log(result);
		res.send(result);
	} catch(e) {
		console.log(e);
		res.sendStatus(400);
	}
});

app.post('/mint', async function (req, res) {
	try {
		// direct mints; approval-less content
		res.send();
	} catch(e) {
		console.log(e);
		res.sendStatus(400);
	}
});

app.listen(8080);