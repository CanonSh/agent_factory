/** Herramienta local: no usa redes, archivos ni procesos. */
class {
    @AITool( "Cuenta el numero de caracteres en un texto proporcionado." )
    function countCharacters( required string content ) {
        return len( arguments.content );
    }

    @AITool( "Cuenta el numero de palabras en un texto proporcionado." )
    function countWords( required string content ) {
        var clean = trim( arguments.content );
        if ( !len( clean ) ) { return 0; }
        clean = replace( clean, char(9), " ", "all" );
        clean = replace( clean, char(10), " ", "all" );
        clean = replace( clean, char(13), " ", "all" );
        clean = reReplace( clean, " +", " ", "all" );
        return arrayLen( listToArray( clean, " " ) );
    }
}
