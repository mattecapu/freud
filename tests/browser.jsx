import React from 'react';
import ReactDOM from 'react-dom';

import withWatching from 'react-watch';

import Freud, { withFreudSync } from '../index.js';

class Test extends React.PureComponent {
	constructor() {
		super();
		this.handleClick = this.handleClick.bind(this);
		this.state = { step: 0 };
	}

	handleClick() {
		console.log('CLICK!');
		this.setState({ step: this.state.step + 1 });
	}

	render() {
		return (
			<div>
				{this.state.step}
				{"Title should be 'Interpretation of dreams'"}
				<Freud title="Interpretation of dreams" />
				<br/>

				{this.state.step % 2 ? <Freud scripts={[{ src: 'script.js' }]} /> : null}

				<button onClick={this.handleClick}>
					{'Change color to satisfy your Es'}
				</button>
				{this.state.step % 2 ?  <Freud links={[{ rel: 'stylesheet', href: 'red.css' }]} /> : null}
				{this.state.step % 2 ? null : <Freud links={[{ rel: 'stylesheet', href: 'blue.css' }]} />}
				<br/>

				{"Also there should be a meta og:title set to 'Banana'"}
				<Freud metas={[
					{ property: 'og:title', content: 'Banana'}
				]} />
				<br/>

				{this.state.step === 0 ? <button onClick={() => {Freud.sync()}}>{"sync head with sync()"}</button> : <Freud syncHere={true} />}
			</div>
		);
	}
}

Test = withFreudSync(withWatching(Test));

window.addEventListener(
	'DOMContentLoaded',
	() =>
		ReactDOM.render(
			<Test />,
			document.getElementById('react-root'),
			() => {
				console.log('render');
			}
		)
);
