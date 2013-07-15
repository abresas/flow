var express = require( 'express' ),
    graph = require( './graph.js' ).graph,
    mustache = require( 'mustache' ),
    fs = require( 'fs' ),
    util = require( 'util' );

var app = express();

app.configure( function() {
    app.use( express.bodyParser() );
    app.use( express.methodOverride() );
    app.use( app.router );
    app.set( "views", __dirname );
    app.set( "view options", { layout: false } );
    app.engine( 'html', require( 'ejs' ).renderFile );
    app.use( express.errorHandler( {
        dumpExceptions: true,
        showStack: true
    } ) );
} );

app.get( '/', function( req, res ) {
    res.render( 'index.html' );
} );

app.get( '/api/nodes/', function( req, res ) {
    res.send( graph.exportNodes() );
} );

app.post( '/api/nodes/:name', function( req, res ) {
    node = graph.createNode( req.params.name, req.body.command );
    res.send( { 
        node: node.export(),
        "errors": []
    } );
    // add node
} );

app.get( '/api/nodes/:name', function( req, res ) {
    var node = graph.getNode( req.params.name );
    res.send( node.export() );
} );

app.put( '/api/nodes/:name', function( req, res ) {
    var node = graph.getNode( req.params.name );
    if ( req.body.newName ) {
        node.name = req.body.newName;
    }
    if ( req.body.command ) {
        if ( node.running ) {
            node.kill();
        }
        node.command = req.body.command;
        node.execute();
    }
    res.send( {
        node: node.export(),
        "errors": []
    } );
} );

app.delete( '/api/nodes/:name', function( req, res ) {
    var node = graph.getNode( req.params.name );
    if ( node.running ) {
        node.kill();
    }
    // graph.disconnectNode( node )
    res.send( {
        node: node.export(),
        "errors": [ "Disconnect not yet implemented." ],
    } );
} );

app.post( '/api/nodes/:name/kill', function( req, res ) {
    var node = graph.getNode( req.params.name );
    node.kill();
    res.send( {
        node: node.export(),
        "errors": []
    } );
} );

app.post( '/api/nodes/:name/execute', function( req, res ) {
    var node = graph.getNode( req.params.name );
    node.execute();
    res.send( {
        node: node.export(),
        "errors": []
    } );
} );

app.get( '/api/connections/', function( req, res ) {
    res.send( graph.exportConnections() );
} );

app.post( '/api/connections/', function( req, res ) {
    nodeOut = graph.getNode( req.body.out );
    nodeIn = graph.getNode( req.body.in );
    graph.connect( nodeOut, nodeIn );
    res.send( {
        "out": nodeOut.name,
        "in": nodeIn.name,
        "errors": []
    } );
} );

app.delete( '/api/connections/:id', function( req, res ) {
    // graph.disconnect( req.params.id )
    res.send( {
        "errors": [ "Disconnect not yet implemented." ]
    } );
} );

app.get( '/api/graph', function( req, res ) {
    res.send( graph.export() );
} );

graph.load();
app.listen( 8080 );
