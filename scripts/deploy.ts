import { writeFileSync } from 'fs';
import { Voting, Name } from '../src/contracts/voting';
import { privateKey } from './privateKey';
import {
	bsv,
	TestWallet,
	DefaultProvider,
	sha256,
	FixedArray,
	toByteString,
} from 'scrypt-ts';

function getScriptHash(scriptPubKeyHex: string) {
	const res = sha256(scriptPubKeyHex).match(/.{2}/g);
	if (!res) {
		throw new Error('scriptPubKeyHex is not of even length');
	}
	return res.reverse().join('');
}

async function main() {
	await Voting.compile();

	// Prepare signer.
	// See https://scrypt.io/docs/how-to-deploy-and-call-a-contract/#prepare-a-signer-and-provider
	const signer = new TestWallet(
		privateKey,
		new DefaultProvider({
			network: bsv.Networks.testnet,
		})
	);

	// Adjust the amount of satoshis locked in the smart contract:
	const amount = 1;

	const names: FixedArray<Name, 2> = [
		toByteString('iPhone', true),
		toByteString('android', true),
	];
	const instance = new Voting(names);

	// Connect to a signer.
	await instance.connect(signer);

	// Contract deployment.
	const deployTx = await instance.deploy(amount);

	// Save deployed contracts script hash.
	const scriptHash = getScriptHash(instance.lockingScript.toHex());
	const shFile = `.scriptHash`;
	writeFileSync(shFile, scriptHash);

	console.log('Voting contract was successfully deployed!');
	console.log(`TXID: ${deployTx.id}`);
	console.log(`scriptHash: ${scriptHash}`);
}

main();
