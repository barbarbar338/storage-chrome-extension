import Home from "@components/Home";
import LoginForm from "@components/Login";
import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { browser } from "webextension-polyfill-ts";

const Popup = () => {
	const [redirect, setRedirect] = useState(false);
	const [token, setToken] = useState("");
	const [host, setHost] = useState("");

	useEffect(() => {
		async function effect() {
			const { token: accessToken, host: storageHost } =
				await browser.storage.sync.get(["token", "host"]);
			if (accessToken && storageHost) {
				setToken(accessToken);
				setHost(storageHost);
				setRedirect(true);
			}
		}
		effect();
	}, []);

	return (
		<div className="popupContainer">
			<ToastContainer
				position="bottom-right"
				autoClose={5000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
			/>
			<div className="mx-4 my-4">
				{redirect ? <Home host={host} token={token} /> : <LoginForm />}
			</div>
		</div>
	);
};

export default Popup;
