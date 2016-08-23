import React from 'react';
import ReactDOM from 'react-dom/server';

import Freud from '../index.js';

import fs from 'fs';

const pageContent = ReactDOM.renderToStaticMarkup(
	<div>
		{"From server we should have: test.js, a twitter meta, and a titleTemplate"}
		<Freud
			title="How to bake cookies"
			scripts={[{ src: 'test.js', type: 'application/javascript', defer: true }]}
		/>

		{"Also blue.css is mounted both on server and client: should mount once"}
		<Freud links={[{ rel: 'stylesheet', href: 'blue.css' }]} />

		<Freud
			titleTemplate="Freud's corner | %s"
			metas={[
				{ property: 'twitter:image', content: 'not really'},
				{ property: 'og:title', content: 'something that will get overridden' }
			]}
		/>
	</div>
);

const { title, scripts, metas } = Freud.rewind();

fs.writeFileSync(
	'tests/index.html',
	`<!DOCTYPE html>
	<html>
		<head>
			<meta charset="utf-8" />
			${title.toString()}
			${metas.toString()}
			${scripts.toString()}
		</head>
		<body>
			<div id="react-root"></div>
			${pageContent}
		</body>
	</html>`,
	'utf-8'
);
