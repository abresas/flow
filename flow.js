var graph = require( './graph.js' ).graph,
    repl = require( 'repl' );
graph.load();
repl.start( "> " ).context.graph = graph;
