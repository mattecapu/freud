# Freud
### It gets in your head

Freud is an `head` manager for React applications. It supports server-rendering and thus is compatible with your SPAs or any other amenity.

Freud is inspired by [react-helmet](https://github.com/nfl/react-helmet), but it's a far simpler implementation (which is largely possible thanks to the awesome [react-side-effect](https://github.com/gaearon/react-side-effect)).

## Example
```jsx
import React from 'react';
import Freud form 'freud';

/* the tag renders as null and sets the provided properties */
/* properties on tags which appear later/deeper in the render tree override previous tags */
const OEdipus = () =>
	<div>
		<Freud title="I've got a problem" />
		<Freud title="Maybe two" />
		{"Mom is best ❤️"}
	</div>;

const Mother = () =>
	<div>
		<Freud
			titleTemplate="OEdipus news | %s"
			links={[{ rel: 'stylesheet', href: 'thebes.css' }]}
		/>
	</div>;

ReactDOM.render(
	<main>
		<Freud
			links={[{ rel: 'stylesheet', href: 'vienna.css' }]}
			scripts={[{ src: 'dreams.js', async: true }]}
		/>
		<Mother />
		<OEdipus />
		<Freud syncHere={true} />
	</main>
);
```

## Usage

Install it the `npm`-way:
```
npm install react-freud --save
```
You'll need also `react` as `peerDependencies`.

### `<Freud prop=value />`
It's just a normal component which renders to `null` but does some magic at render time. The fact it renders to `null` means **it swallows all its children** so don't use it as a wrapper component.

* **`title`**: sets the title of the page.
* **`defaultTitle`**: if no `title` is set, this becomes the title, otherwise it's overridden (low-precedence `title`).
* **`titleTemplate`**: a format string where `%s` gets replaced by the `title` (in the example above, the page title will be *OEdipus news | Maybe two*).
* **`links`**: an array of PJOs whom attributes will be set on `<link>` tags. **Arrays are not overridden but merged**, for instance in the above example Freud will add `vienna.css` and `thebes.css` (preserves order). However, if you add two identical objects (identical == deeply equal), Freud will only load one.
* **`scripts`**: same semantics of `links`, but creates `<script>` tags.
* **`metas`**: same semantics of `links`, but creates `<meta>` tags.

To do the actual modifications to `head` there are two options:
* Use the **`syncHere`** attribute on a `Freud` tag (see example). When this component is rendered, the `head` state will be synced with all the options set **until now**. So use this only if you want to force some rendering or you are 100% sure this is the last `Freud` tag that is rendered
* Use the **`sync`** method of `Freud`, which does the same thing.
* Use **withFreudSync** HoC component which automatically calls `Freud.sync()` whenever its children change. This is the most effective way, especially if you're using routing: just wrap your top components with it:
```jsx
import { withFreudSync } from 'react-freud';

<Router>
	<Route component={withFreudSync(MyComponent)} path="/foo" />
	<Route component={withFreudSync(MyOtherComponent)} path="/bar" />
</Router>
```

#### Why all this trouble?
Because of the way `react-side-effect` works, `Freud` cannot know if the properties encountered until now are complete or something is missing. So if I sync head *every time* a `Freud` tag is rendered, I could unmount some tag which is required by a `Freud` tag deeper in the render tree.
In particular, by doing this `Freud` works fine with server-side rendering.
On the serve, use the amazing `rewind()` function to get the tags to put in your `head`.
```jsx
import Freud from 'freud';

const html = ReactDOM.renderToStaticMarkup(<MyAppContainer />);

const { title, scripts, links, metas } = Freud.rewind();

sendResponseBody(
	`<!DOCTYPE html>
	<html>
		<head>
			${title.toString()}
			${scripts.toString()}
			${links.toString()}
			${metas.toString()}
		</head>
		<body>
			Your awesome <div id="react-root"></div>
		</body>
	</html>`
);

```
_It's actually **required** to use `rewind()` on server-side to avoid memory leaks._ See [react-side-effect](https://github.com/gaearon/react-side-effect) documentation.

If you rehydrate your React app client-side, you should call `Freud.sync()` after the app gets re-rendered.

A good place is the `ReactDOM.render()` callback:
```jsx
ReactDOM.render(
	<App />,
	document.getElementById("app-root"),
	() => Freud.sync()
);
```

Which is called every time the `App` component is updated. If during the lifecycle of your app some components dynamically render `Freud` tags, remember to call `Freud.sync()`.

## Contribution
Typical `npm` workflow:
```
git clone https://github.com/mattecapu/freud.git
cd freud
NODE_ENV=development npm i
npm run dev
```

## License
ISC
