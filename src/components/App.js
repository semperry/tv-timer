import { useEffect, useState } from "react";
import { HashRouter, Route, Switch } from "react-router-dom";

import Home from "../pages/Home";
import Clock from "../pages/Clock";

function App() {
	return (
		<HashRouter>
			<Switch>
				<Route exact path="/" component={Home} />

				<Route path="/clock" component={Clock} />
			</Switch>
		</HashRouter>
	);
}

export default App;
