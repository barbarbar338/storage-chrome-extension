import React, { ChangeEvent, FC, FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { browser, Tabs } from "webextension-polyfill-ts";
import { useCopyToClipboard } from "react-use";
import validURL from "../../utils/validURL";

export interface IShortenForm {
	token: string;
	host: string;
}

const ShortenForm: FC<IShortenForm> = ({ token, host }) => {
	const [url, setUrl] = useState("");
	const [code, setCode] = useState("");
	const [loading, setLoading] = useState(false);
	const [, setTab] = useState<Tabs.Tab>();
	const [, copy] = useCopyToClipboard();

	useEffect(() => {
		browser.tabs
			.query({ active: true, currentWindow: true })
			.then((tabs: Tabs.Tab[]) => {
				const currentTab: Tabs.Tab | undefined = tabs[0];
				if (!currentTab) {
					toast.warning("No active tab found");
					return;
				}
				setTab(currentTab);
				if (currentTab.url) setUrl(currentTab.url);
			});
	}, []);

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
		if (!validURL(url)) {
			toast.error("Invalid URL");
			return;
		}

		await fetch(`${host}/v1/shorten`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
			body: JSON.stringify({
				url,
				code,
			}),
		})
			.then(async (res) => {
				const body = await res.json();

				if (res.status < 200 || res.status > 299) {
					toast.error(`Shorten failed ${body.message}`);
					return;
				}

				copy(`${host}/${body.data}`);

				toast.success("URL shortened! Copied to clipboard");
			})
			.catch((err) => {
				toast.error(err.message);
			});

		setLoading(false);
	};

	return (
		<form onSubmit={onSubmit}>
			<div className="bg-white px-10 py-8 rounded-xl w-screen shadow-md max-w-sm">
				<div className="space-y-4">
					<h1 className="text-center text-2xl font-semibold text-gray-600">
						Shorten
						<br />
						<span className="text-sm">
							(authorized on{" "}
							<a
								href={host}
								target="_blank"
								className="text-blue-500"
							>
								{host}
							</a>
							)
						</span>
					</h1>

					<div>
						<label className="block mb-1 text-gray-600 font-semibold">
							Url
						</label>
						<input
							value={url}
							onChange={(e) => onChange(e, setUrl)}
							required
							type="text"
							className="bg-indigo-50 px-4 py-2 outline-none rounded-md w-full"
						/>
					</div>
					<div>
						<label className="block mb-1 text-gray-600 font-semibold">
							Custom Code (optional)
						</label>
						<input
							value={code}
							onChange={(e) => onChange(e, setCode)}
							type="text"
							className="bg-indigo-50 px-4 py-2 outline-none rounded-md w-full"
						/>
					</div>
				</div>
				<button className="mt-4 w-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-indigo-100 py-2 rounded-md text-lg tracking-wide">
					Shorten
				</button>
			</div>
		</form>
	);
};

export default ShortenForm;
