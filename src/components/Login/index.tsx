import BookmarkForm from "@components/BookmarkForm";
import React, { ChangeEvent, FC, FormEvent, useState } from "react";
import { toast } from "react-toastify";
import { browser } from "webextension-polyfill-ts";

const LoginForm: FC = () => {
	const [loading, setLoading] = useState(false);
	const [storageUrl, setStorageUrl] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [redirect, setRedirect] = useState(false);
	const [token, setToken] = useState("");

	const onChange = (
		e: ChangeEvent<HTMLInputElement>,
		setter: (value: string) => void,
	) => {
		setter(e.target.value);
	};

	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (loading) return;
		setLoading(true);

		await fetch(`${storageUrl}/v1/auth/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username,
				password,
			}),
		})
			.then(async (res) => {
				const body = await res.json();

				if (res.status < 200 || res.status > 299) {
					toast.error(`Login failed ${body.message}`);
					return;
				}

				const accessToken = body.data.access_token;

				await browser.storage.sync.set({
					token: accessToken,
					host: storageUrl,
				});

				toast.success("Login successful");
				setToken(accessToken);
				setRedirect(true);
			})
			.catch((err) => {
				toast.error(err.message);
			});

		setLoading(false);
	};

	return redirect ? (
		<BookmarkForm token={token} host={storageUrl} />
	) : (
		<form onSubmit={onSubmit}>
			<div className="bg-white px-10 py-8 rounded-xl w-screen shadow-md max-w-sm">
				<div className="space-y-4">
					<h1 className="text-center text-2xl font-semibold text-gray-600">
						Login
					</h1>
					<div>
						<label className="block mb-1 text-gray-600 font-semibold">
							Storage URL
						</label>
						<input
							value={storageUrl}
							onChange={(e) => onChange(e, setStorageUrl)}
							required
							type="text"
							className="bg-indigo-50 px-4 py-2 outline-none rounded-md w-full"
						/>
					</div>
					<div>
						<label className="block mb-1 text-gray-600 font-semibold">
							Username
						</label>
						<input
							value={username}
							onChange={(e) => onChange(e, setUsername)}
							required
							type="text"
							className="bg-indigo-50 px-4 py-2 outline-none rounded-md w-full"
						/>
					</div>
					<div>
						<label className="block mb-1 text-gray-600 font-semibold">
							Password
						</label>
						<input
							value={password}
							onChange={(e) => onChange(e, setPassword)}
							required
							type="password"
							className="bg-indigo-50 px-4 py-2 outline-none rounded-md w-full"
						/>
					</div>
				</div>
				<button className="mt-4 w-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-indigo-100 py-2 rounded-md text-lg tracking-wide">
					Login
				</button>
			</div>
		</form>
	);
};

export default LoginForm;
