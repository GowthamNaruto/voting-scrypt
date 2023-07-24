import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Scrypt, bsv } from 'scrypt-ts';

import artifact from '../artifacts/voting.json';
import { Voting } from './contracts/voting';

Voting.loadArtifact(artifact);

Scrypt.init({
	apiKey: 'testnet_3z5Zn86JECxHJEYIrVqfmKc3QP4oFCGaaqECWaMgSKF73d88I',
	network: bsv.Networks.testnet,
});

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
