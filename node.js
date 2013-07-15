var child_process = require( 'child_process' );

var Node = {
    process: null,
    running: false,
    log: '',
    execute: function() {
        var script = this.command.split( ' ' )[ 0 ];
        var args = this.command.split( ' ' ).slice( 1 );
        this.process = child_process.spawn( script, args, { stdio: 'pipe' } );
        this.running = true;
        var node = this;
        node.inPort = this.process.stdin;
        node.outPort = this.process.stdout;
        node.outPort.on( 'data', function( data ) {
            node.log += data;
        } );
        this.process.on( 'close', function( code ) {
            node.running = false;
        } );
    },
    kill: function() {
        this.process.kill();
    },
    export: function() {
        return {
            name: this.name,
            command: this.command,
            running: this.running,
            log: this.log,
            pid: this.process.pid
        };
    }
};

exports.Node = Node;
