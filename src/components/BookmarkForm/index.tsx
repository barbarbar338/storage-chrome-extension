import React, { ChangeEvent, FC, FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { browser, Tabs } from "webextension-polyfill-ts";

export interface IBookmarkForm {
	token: string;
	host: string;
}

export interface IMeta {
	name: string;
	property: string;
	httpequiv: string;
	content: string;
	charset: string;
}

const metaScript = `
var metas = document.getElementsByTagName("meta"); 
var metaArr = [];

for (var i = 0; i < metas.length; i++) { 
	var name = metas[i].getAttribute("name");
	if (name == "null") continue;

	var property = metas[i].getAttribute("property");
	var httpequiv = metas[i].getAttribute("http-equiv");
	var content = metas[i].getAttribute("content");
	var charset = metas[i].getAttribute("charset");
	
	metaArr.push({name, property, httpequiv, content, charset});
} 

chrome.runtime.sendMessage({
	method: "getMetaTags",
	metas: metaArr
});
`;

const placeHolder = "https://picsum.photos/1280/720";

export const BookmarkForm: FC<IBookmarkForm> = ({ token, host }) => {
	const [title, setTitle] = useState("");
	const [url, setUrl] = useState("");
	const [description, setDescription] = useState("");
	const [imageUrl, setImageUrl] = useState(placeHolder);
	const [loading, setLoading] = useState(false);
	const [_, setTab] = useState<Tabs.Tab>();

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
				currentTab.title && setTitle(currentTab.title);
				currentTab.url && setUrl(currentTab.url);
				currentTab.favIconUrl && setImageUrl(currentTab.favIconUrl);

				browser.tabs.executeScript(currentTab.id, {
					code: metaScript,
				});
			});

		browser.runtime.onMessage.addListener(function (request) {
			if (request.method == "getMetaTags") {
				const metas: IMeta[] = request.metas;
				const description = metas.find(
					(meta) => meta.name === "description",
				);
				description && setDescription(description.content);
			}
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
		if (!validURL(url)) return toast.error("Invalid URL");
		if (!(await isImage(imageUrl))) return toast.error("Invalid image URL");

		await fetch(`${host}/v1/bookmark`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
			body: JSON.stringify({
				title,
				url,
				description,
				imageUrl,
			}),
		})
			.then(async (res) => {
				const body = await res.json();

				if (res.status < 200 || res.status > 299) {
					toast.error(`Bookmark failed ${body.message}`);
					return;
				}

				toast.success("Bookmark created");
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
						Bookmark
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
							Title
						</label>
						<input
							value={title}
							onChange={(e) => onChange(e, setTitle)}
							required
							type="text"
							className="bg-indigo-50 px-4 py-2 outline-none rounded-md w-full"
						/>
					</div>
					<div>
						<label className="block mb-1 text-gray-600 font-semibold">
							Description
						</label>
						<input
							value={description}
							onChange={(e) => onChange(e, setDescription)}
							required
							type="text"
							className="bg-indigo-50 px-4 py-2 outline-none rounded-md w-full"
						/>
					</div>
					<div>
						<label className="block mb-1 text-gray-600 font-semibold">
							Banner Url
						</label>
						<input
							value={imageUrl}
							onChange={(e) => onChange(e, setImageUrl)}
							required
							type="text"
							className="bg-indigo-50 px-4 py-2 outline-none rounded-md w-full"
						/>
					</div>
				</div>
				<button className="mt-4 w-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-indigo-100 py-2 rounded-md text-lg tracking-wide">
					Add Bookmark
				</button>
			</div>
		</form>
	);
};

// https://stackoverflow.com/a/5717133/10124281
function validURL(str: string): boolean {
	const pattern = new RegExp(
		"^(https?:\\/\\/)?" + // protocol
			"((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
			"((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
			"(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
			"(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
			"(\\#[-a-z\\d_]*)?$",
		"i",
	); // fragment locator
	return !!pattern.test(str);
}

// https://stackoverflow.com/questions/9519569/what-is-the-true-way-of-checking-a-string-for-image-url-and-existence-if-valid/9526102
async function isImage(str: string): Promise<boolean> {
	return new Promise<boolean>((resolve) => {
		const img = new Image();
		img.onload = () => resolve(true);
		img.onerror = () => resolve(false);
		img.src = str;
	});
}
