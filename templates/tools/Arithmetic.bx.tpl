/** Herramienta local: aritmetica simple y determinista. */
class {
    @AITool( "Suma dos numeros y devuelve el resultado exacto." )
    function addNumbers( required numeric a, required numeric b ) {
        return arguments.a + arguments.b;
    }
}
