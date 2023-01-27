import './root.css'
import * as React from "react";

export default function Root() {
	return (
		<div className="Root">
			<header className="Root-header">
				<a className="Root-link" href='./account'>Go to the Account page</a>
				<a className="Root-link" href='./chat'>Go to the Chat page</a>
				<a className="Root-link" href='./pong'>Go to the Pong page</a>
			</header>
		</div>
	);
}