"use strict";
// import Header, Static, Footer from './static/js/components';
// import ChartTiles, Contact from './static/js/components';

class AltDash extends React.Component {
  render () {
    return (
      <p>I love React ... but less now</p>
      // <div className="AltDash">
        // <p>I love React</p>

        // <div id="body-header" className="plain">
        //   <Header />
        // </div><!-- /#body-header -->

        // <div id="body-dynamic" className="plain">
        //   <Dynamic />
        //   // <ReactRouterDOM.Route exact path="/" component={ ChartTiles }/>
        //   // <ReactRouterDOM.Route path="/contact" component={ Contact }/>
        // </div><!-- /#body-dynamic -->

        // <div id="body-static" className="plain">
        //   <Static />
        // </div><!-- /#body-static -->

        // <div id="body-footer" className="plain">
        //   <Footer />
        // </div><!-- /#body-footer -->

      // </div>
    )
  }
}


ReactDOM.render(
    <AltDash />,
    document.getElementById("root")
);

// ReactDOM.render((
//   <ReactRouterDOM.BrowserRouter>
//     <AltDash />
//         // <ReactRouterDOM.Route path="/" component={ AltDash }>
//         // </ReactRouterDOM.Route>
//   </ReactRouterDOM.BrowserRouter>),
//   document.getElementById('root')
// );