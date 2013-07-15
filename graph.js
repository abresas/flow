var fs = require( 'fs' ),
    Node = require( './node.js' ).Node;

var graph = {
    nodes: {},
    connections: [],
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
        console.log( 'create node', name, command );
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
            if ( nodeIn.running ) {
                nodeIn.inPort.write( data );
            }
        } );
        this.connections.push( { "out": nodeOut.name, "in": nodeIn.name } );
    },
    export: function() {
        return {
            name: this.name,
            nodes: this.exportNodes(),
            connections: this.exportConnections()
        };
    },
    exportNodes: function() {
        var data = {};
        for ( var i in graph.nodes ) {
            node = graph.nodes[ i ];
            data[ node.name ] = node.export();
        }
        return data;
    },
    exportConnections: function() {
        return this.connections;
    }
};

exports.graph = graph;
