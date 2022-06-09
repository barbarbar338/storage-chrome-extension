import BookmarkForm from "@components/BookmarkForm";
import ShortenForm from "@components/ShortenForm";
import React, { FC, useState } from "react";

export interface IHome {
	token: string;
	host: string;
}

const Home: FC<IHome> = ({ host, token }) => {
	const [bookmark, setBookmark] = useState(false);
	const [shorten, setShorten] = useState(false);

	const onBookmarkClick = () => {
		setBookmark(true);
	};

	const onShortenClick = () => {
		setShorten(true);
	};

	if (bookmark) return <BookmarkForm host={host} token={token} />;
	if (shorten) return <ShortenForm host={host} token={token} />;

	return (
		<div>
			<div className="bg-white px-10 py-8 rounded-xl w-screen shadow-md max-w-sm">
				<button
					onClick={onBookmarkClick}
					className="mt-4 w-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-indigo-100 py-2 rounded-md text-lg tracking-wide"
				>
					Add Bookmark
				</button>
			</div>
			<div className="bg-white mt-2 px-10 py-8 rounded-xl w-screen shadow-md max-w-sm">
				<button
					onClick={onShortenClick}
					className="mt-4 w-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-indigo-100 py-2 rounded-md text-lg tracking-wide"
				>
					Shorten A URL
				</button>
			</div>
		</div>
	);
};

export default Home;
