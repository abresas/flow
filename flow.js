var child_process = require( 'child_process' ),
    fs = require( 'fs' ),
    repl = require( 'repl' );

var Node = {
    process: null,
    running: false,
    inLog: '',
    outLog: '',
    execute: function() {
        var script = this.command.split( ' ' )[ 0 ];
        var args = this.command.split( ' ' ).slice( 1 );
        this.process = child_process.spawn( script, args, { stdio: 'pipe' } );
        this.running = true;
        var node = this;
        node.inPort = this.process.stdin;
        node.inPort.on( 'data', function( data ) {
            node.inLog += data;
        } );
        node.outPort = this.process.stdout;
        node.outPort.on( 'data', function( data ) {
            node.outLog += data;
        } );
        this.process.on( 'close', function( code ) {
            node.running = false;
        } );
    }
};

var graph = {
    nodes: {},
    load: function( filename, callback ) {
        filename = filename || 'flow.json';
        this.configFile = filename;
        var config = JSON.parse( fs.readFileSync( filename ) );
        this.name = config.name;
        for ( i in config.nodes ) {
            var nodeData = config.nodes[ i ];
            this.createNode( nodeData[ 'name' ], nodeData[ 'command' ] );
        }
        for ( i in config.connections ) {
            var connectionData = config.connections[ i ];
            var outNode = this.getNode( connectionData[ 'out' ] );
            var inNode = this.getNode( connectionData[ 'in' ] );
            this.connect( outNode, inNode );
        }
    },
    createNode: function( name, command ) {
        var node = Object.create( Node );
        node.name = name;
        node.command = command;
        this.nodes[ name ] = node;
        node.execute();
        return node;
    },
    getNode: function( name ) {
        return this.nodes[ name ];
    },
    connect: function( nodeOut, nodeIn ) {
        nodeOut.outPort.on( 'data', function( data ) {
            nodeIn.inPort.write( data );
        } );
    }
};

graph.load();
repl.start( "> " ).context.graph = graph;
