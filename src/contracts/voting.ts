import {
	method,
	prop,
	SmartContract,
	hash256,
	assert,
	ByteString,
	toByteString,
	FixedArray,
	fill,
} from 'scrypt-ts';

export type Name = ByteString;
export type Candidate = {
	name: Name;
	votesRecieved: bigint;
};
export const N = 2;

export class Voting extends SmartContract {
	@prop(true)
	candidates: FixedArray<Candidate, typeof N>;

	constructor(names: FixedArray<Name, typeof N>) {
		super(...arguments);
		this.candidates = fill(
			{
				name: toByteString(''),
				votesRecieved: 0n,
			},
			N
		);
		for (let i = 0; i < N; i++) {
			this.candidates[i] = {
				name: names[i],
				votesRecieved: 0n,
			};
		}
	}

	@method()
	public vote(name: Name) {
		for (let i = 0; i < N; i++) {
			if (this.candidates[i].name === name) {
				this.candidates[i].votesRecieved++;
			}
		}

		let outputs = this.buildStateOutput(this.ctx.utxo.value);
		if (this.changeAmount > 0n) {
			outputs += this.buildChangeOutput();
		}
		assert(this.ctx.hashOutputs === hash256(outputs));
	}
}
