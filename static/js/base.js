""" JS for every page. """

function getBootstrap() {
    // Script that does something and depends on jQuery being there.
    if( window.jQuery ) {
        let bsjs = '<script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>';
        $('body').append(bsjs);
    } else {
        // wait 50 milliseconds and try again.
        window.setTimeout( runScript, 50 );
    }
}
