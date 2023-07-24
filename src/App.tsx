import React, { useEffect, useRef } from 'react';
import './App.css';
import {
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Paper,
	Button,
	Snackbar,
	Alert,
	Link,
	Typography,
	Box,
	Divider,
} from '@mui/material';
import {
	Scrypt,
	ScryptProvider,
	SensiletSigner,
	ContractCalledEvent,
	ByteString,
	toByteString,
} from 'scrypt-ts';
import { Voting } from './contracts/voting';
// import Footer from './Footer';

type Success = {
	txId: string;
	candidate: string;
};

function App() {
	const contractId = {
		txId: 'be1b43acaae5d26d50e70d0cb5cda740ad06c744e31ae1b15e17aa78739e452d',
		outputIndex: 0,
	};

	const signerRef = useRef<SensiletSigner>();
	const [error, setError] = React.useState('');
	const [contract, setContract] = React.useState<Voting>();
	const [success, setSuccess] = React.useState<Success>({
		txId: '',
		candidate: '',
	});

	async function fetchContract() {
		try {
			const instance = await Scrypt.contractApi.getLatestInstance(
				Voting,
				contractId
			);
			setContract(instance);
		} catch (error: any) {
			console.log('error while fetching contract: ', error);
			setError(error.message);
		}
	}

	useEffect(() => {
		const provider = new ScryptProvider();
		const signer = new SensiletSigner(provider);

		signerRef.current = signer;
		fetchContract();

		const subscribtion = Scrypt.contractApi.subscribe(
			{
				clazz: Voting,
				id: contractId,
			},
			(event: ContractCalledEvent<Voting>) => {
				setSuccess({
					txId: event.tx.id,
					candidate: event.args[0] as ByteString,
				});
				setContract(event.nexts[0]);
			}
		);

		return () => {
			subscribtion.unsubscribe();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// const handleClose = (
	// 	_event: React.SyntheticEvent | Event,
	// 	reason?: string
	// ) => {
	// 	if (reason === 'clickaway') {
	// 		return;
	// 	}
	// 	setError('');
	// };

	// const handleSuccessClose = (
	// 	_event: React.SyntheticEvent | Event,
	// 	reason?: string
	// ) => {
	// 	if (reason === 'clickaway') {
	// 		return;
	// 	}
	// 	setSuccess({
	// 		txId: '',
	// 		candidate: '',
	// 	});
	// };

	async function vote(e: any) {
		// handleSuccessClose(e);
		await fetchContract();
		const signer = signerRef.current as SensiletSigner;

		if (contract && signer) {
			const { isAuthenticated, error } = await signer.requestAuth();
			if (!isAuthenticated) {
				throw new Error(error);
			}

			await contract.connect(signer);

			const nextInstance = contract.next();

			const candidateName = e.target.name;
			if (candidateName === 'iPhone') {
				nextInstance.candidates[0].votesRecieved++;
			} else if (candidateName === 'android') {
				nextInstance.candidates[1].votesRecieved++;
			}

			contract.methods
				.vote(toByteString(candidateName, true), {
					next: {
						instance: nextInstance,
						balance: contract.balance,
					},
				})
				.then((result) => {
					console.log(`txid: ${result.tx.id}`);
				})
				.catch((e) => {
					setError(e.message);
					fetchContract();
					console.error(e);
				});
		}
	}

	return (
		<div className="App">
			<header className="App-header">
				<h2>What's your favorite phone?</h2>
			</header>
			<TableContainer
				component={Paper}
				variant="outlined"
				style={{ width: 1200, height: '80vh', margin: 'auto' }}
			>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell align="center">
								<Typography variant={'h3'}>iPhone</Typography>
							</TableCell>

							<TableCell align="center">
								<Typography variant={'h3'}>Samsung</Typography>
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						<TableRow>
							<TableCell align="center">
								<Box>
									<Box
										sx={{
											height: 200,
										}}
										component="img"
										alt={'iphone'}
										src={`${process.env.PUBLIC_URL}/${'iphone'}.png`}
									/>
								</Box>
							</TableCell>
							<TableCell align="center">
								<Box>
									<Box
										sx={{
											height: 200,
										}}
										component="img"
										alt={'android'}
										src={`${process.env.PUBLIC_URL}/${'android'}.png`}
									/>
								</Box>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell align="center">
								<Box>
									<Typography variant={'h3'}>
										{contract?.candidates[0].votesRecieved.toString()}
									</Typography>
									<Button
										variant="text"
										onClick={vote}
										name="iphone"
										// onClick={voting}
										// name={votingContract?.candidates[0].name}
									>
										👍
									</Button>
								</Box>
							</TableCell>

							<TableCell align="center">
								<Divider orientation="vertical" flexItem />
								<Box>
									<Typography variant={'h3'}>
										{contract?.candidates[1].votesRecieved.toString()}
									</Typography>
									<Button
										variant="text"
										onClick={vote}
										// name={votingContract?.candidates[1].name}
										name="android"
									>
										👍
									</Button>
								</Box>
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</TableContainer>
			{/* <Footer /> */}
			<Snackbar
				open={error !== ''}
				autoHideDuration={6000}
				// onClose={handleClose}
			>
				<Alert severity="error">{error}</Alert>
			</Snackbar>

			<Snackbar
				open={success.candidate !== '' && success.txId !== ''}
				autoHideDuration={6000}
				// onClose={handleSuccessClose}
			>
				<Alert severity="success">
					{' '}
					<Link
						href={`https://test.whatsonchain.com/tx/${success.txId}`}
						target="_blank"
						rel="noreferrer"
					>
						{`"${Buffer.from(success.candidate, 'hex').toString(
							'utf8'
						)}" got one vote,  tx: ${success.txId}`}
					</Link>
				</Alert>
			</Snackbar>
		</div>
	);
}

export default App;
