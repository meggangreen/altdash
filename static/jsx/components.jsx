import React from 'react';

export class Header extends React.Component {
  render() {
    return (
      <div id="body-header" className="plain">
        <nav className="navbar navbar-default navbar-fixed-top">
          <div id="nav-container" className="container-fluid">
            {/* <!-- Brand and toggle get grouped for better mobile display --> */}
            <div className="navbar-header">
              <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#nav-menu" aria-expanded="false">
                <span className="sr-only">Toggle Navigation</span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </button>
              <a className="navbar-brand" href="#">AltDash</a>
            </div> {/* <!-- /.navbar-header --> */}

            {/* <!-- Collect the nav links, forms, and other content for toggling --> */}
            <div id="nav-menu" className="collapse navbar-collapse">
              <ul className="nav navbar-nav navbar-right">
                <li className="active"><ReactRouterDOM.Link to='/'>Home<span className="sr-only"> (current)</span></ReactRouterDOM.Link></li>
                <li><ReactRouterDOM.Link to='/map'>Map</ReactRouterDOM.Link></li>
                <li><ReactRouterDOM.Link to='/contact'>Contact</ReactRouterDOM.Link></li>
              </ul>
            </div>{/* <!-- /.navbar-collapse --> */}
          </div>{/* <!-- /#nav-container --> */}
        </nav>
      </div>
    );
  }
}

export class Dynamic extends React.Component {
  render() {
    return (
      <div id="body-dynamic" className="plain">
        <p>DYNAMIC</p>
      </div>
    );
  }
}

export class ChartTiles extends React.Component {
  render() {
    return (
      <div>CHART AND TILES</div>
    );
  }
}

export class Contact extends React.Component {
  render() {
    return (
      <div>CONTACT</div>
    );
  }
}

export class Static extends React.Component {
  render() {
    return (
      <div id="body-static" className="plain">
        <div className="body-1">{/* <!-- show information about AltDash --> */}
          <div id="cont-body-altdashmmg" className="container-fluid container-body">
            <div id="row-body-altdashmmg" className="row body-row">
              <div id="col-altdash" className="col-xs-12 col-md-offset-2 col-md-3">
                <h3>About AltDash</h3>
                <p>
                  AltDash is a proposed Alternative Dashboard for looking at World Bank
                  data as it reflects progress toward the Sustainable Development Goals.
                </p>
                <p>
                  EEE
                </p>
              </div>{/* <!-- /#col-altdash --> */}
              <div id="col-mmg" className="col-xs-12 col-md-offset-2 col-md-3">
                <h3>About Meggan</h3>
                <p>
                  <a href="http://meggangreen.com/" target="_blank" title="Meggan M Green">
                    Meggan M Green
                  </a>
                  BIO
                </p>
                <p>
                  EEE
                </p>
              </div>{/* <!-- /#col-mmg --> */}
            </div>{/* <!-- /#row-body-altdashmmg --> */}
          </div>{/* <!-- /#cont-body-altdashmmg --> */}
        </div>{/* <!-- /.body-1 --> */}
        <div className="body-2">{/* <!-- show information about the world bank --> */}
          <div id="cont-body-wbunsdg" className="container-fluid container-body">
            <div id="row-body-wbunsdg" className="row body-row">
              <div id="col-sdg" className="col-xs-12 col-md-4">
                <h3>Sustainable Development Goals</h3>
                <p>
                  In 2015, countries adopted the 2030 Agenda for Sustainable Development
                  and its 17 Sustainable Development Goals. In 2016, the Paris Agreement
                  on climate change entered into force, addressing the need to limit the
                  rise of global temperatures.
                </p>
                <p>
                  Governments, businesses, and civil society together with the United
                  Nations are mobilizing efforts to achieve the Sustainable Development
                  Agenda by 2030. Universal, inclusive, and indivisible, the Agenda calls
                  for action by all countries to improve the lives of people 
                  everywhere.
                </p>
                <p>Text from the UN SDG Site</p>
              </div>{/* <!-- /#col-sdg --> */}
              <div id="col-un" className="col-xs-12 col-md-4">
                <h3>The United Nations</h3>
                <p>
                  <a href="http://www.un.org/" target="_blank" title="United Nations">
                    The United Nations
                  </a>
                  is an international organization founded in 1945. It
                  is currently made up of 193 Member States. The mission and work of the
                  United Nations are guided by the purposes and principles contained in
                  its founding Charter.
                </p>
                <p>
                  Due to its Charter and its unique international character, the United
                  Nations can take action on the issues confronting humanity in the 21st
                  century, like those covered in the 2030 Agenda for Sustainable
                  Development. All SDG images on AltDash were downloaded from the <a 
                  href="http://www.un.org/sustainabledevelopment/" target="_blank" 
                  title="UN SDG Site">UN SDG Site</a> and not modified other than to 
                  facilitate the AltDash site functionality.
                </p>
              </div>{/* <!-- /#col-un --> */}
              <div id="col-wb" className="col-xs-12 col-md-4">
                <h3>The World Bank</h3>
                <p>
                  <a href="https://worldbank.org/" target="_blank" title="The World Bank">
                    The World Bank Group
                  </a>
                  is a unique global partnership: five institutions 
                  working for sustainable solutions that reduce poverty and build shared 
                  prosperity in developing countries. It consists of 189 member 
                  countries and works in every major area of development.
                </p>
                <p>
                  One of the ways The World Bank achieves its goals is through data 
                  collection and analysis. The data is freely available online as part of an
                  Open Data initiative. All data on AltDash was downloaded from the <a 
                  href="https://data.worldbank.org/data-catalog" target="_blank" title="World 
                  Bank Data Catalog">WB Data Catalog</a> and not modified other than to 
                  facilitate the AltDash database functionality.
                </p>
              </div>{/* <!-- /#col-wb --> */}
            </div>{/* <!-- /#row-body-wbunsdg --> */}
          </div>{/* <!-- /#cont-body-wbunsdg --> */}
        </div>{/* <!-- /.body-2 --> */}
      </div>
    );
  }
}

export class Footer extends React.Component {
  render() {
    return (
      <div id="body-footer" className="plain">
        <div id="footer-container" className="container-fluid">
          <div id="row-footer" className="row footer-row">
              <div id="col-footer" className="col-xs-12">
                <p>
                  &copy; 2017 <a href="http://meggangreen.com" target="_blank" 
                  title="Meggan M Green">Meggan M Green</a>
                </p>
                <p>
                  <a href="/" title="AltDash">AltDash</a>
                  is neither endorsed nor affiliated in any way with 
                  <a href="https://worldbank.org/" target="_blank" title="The World Bank">
                    The World Bank
                  </a>
                  or 
                  <a href="http://www.un.org/" target="_blank" title="United Nations">
                    The United Nations
                  </a>
                </p>
                <p>
                  All data used in accordance with the
                  <a href="https://data.worldbank.org/summary-terms-of-use" target="_blank" title="Open Data Terms of Use">
                    World Bank Open Data Terms of Use
                  </a>
                </p>
              </div>{/* <!-- /#col-footer --> */}
            </div>{/* <!-- /#row-footer --> */}
        </div>{/* <!-- /#footer-container --> */}
      </div>
    );
  }
}