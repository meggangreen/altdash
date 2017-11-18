import React from 'react';
import ReactDOM from 'react-dom';

import {Header, Static, Footer} from './components.jsx';
import {ChartTiles, Contact, Dynamic} from './components.jsx';

class AltDash extends React.Component {
  render () {
    return (
      <div>
        <Header />
        <Dynamic />
        <Static />
        <Footer />
      </div>
    );
  }
}

{/*
export class AltDash extends React.Component {
  render () {
    return (
      <div>
        <Header />
        <Dynamic />
        <Static />
        <Footer />
      </div>
    )
  }
}
*/}


ReactDOM.render(
    <AltDash />,
    document.getElementById("root")
);

