> -----------------------------------------------------------------------------------------------------
>   'Testron' (API JS) - Aplicación Javascript para preguntas tipo 'tests'.  
>   Author: Juan José Guerra Haba - <dinertron@gmail.com> - Mayo de 2016  
>   License: Free BSD. & Open GPL v.3. Keep credit, please.  
>   Versión: 1.0.0 BETA   
>   File: testron.js               Main Class: testron.Test.js  
>   
> ----------------------------------------------------------------------------------------------------

# TESTRON
[![logo Testron](img/Testron_logo.png "Testron GitHub page")](http://guerratron.github.io/Testron "Página web Testron")
Es una **API Javascript** para realizar preguntas tipo *test*.
[<img src="img/testronUI.png" alt="testronUI_img" style="width: 150px;" />](img/testronUI.png "Testron UI")

## DESCRIPCIÓN
Puede utilizarse como método preparatorio para exámenes academicos u oposiciones. Sólo necesita el archivo de preguntas con una estructura válida. Este archivo puede estar en formato JSON (objeto o cadena) u Objeto Javascript con una variable declarada.  
Esta rígida estructura puede contener parámetros de configuración (la propiedad **conf**) donde especificar por ejemplo los contenedores para la Interfaz de Usuario en la cual embeber las cuestiones y el Marcador con información y botonera, o si se permite seleccionar varias respuestas o una sólo, el juego de caracteres a utilizar, etc.  

> Este *namespace* utiliza profúsamente funciones de utilidad de un objeto interno implementado en el mismo archivo, el objeto **'util'**, el cual contiene métodos y objetos estáticos, que pueden ser usados fuera del mismo, utilizando su *'classpath'*.  
> También contiene las clases **Test**, **Test.Marker**, **Test.Question** and **Tests.Question.Answer**, pero es más cómodo utilizar un único método, el cual desarrollará todo el trabajo de forma automatizada:  
> ````javascript  
>  
>  var tests = testron.parseTestrons (test, conf);  
>  
>````
>  
> Aquí *test* representa una *batería-de-preguntas*

## CARACTERÍSTICAS 
  1. Completamente *POO*
  2. Personalizable por **CSS**
  3. Cross-browser
  4. Pilosofía MVC
  5. *HTML5* y *CSS3*.  
  6. Reducción al **mínimo código** a utilizar por el usuario.

## USO
La librería **testron** puede utilizarse de varias formas:

  1. Por un puro **Objeto Javascript** que respete la estructura necesaria (see **STRUCTURE TEST**).
  2. A través de un **objeto JSON**
  3. Con una **cadena** pura con formato JSON.
  4. O de la forma clásica: Con su **constructor**. (menos aconsejable)
    
Eg:  

````javascript    

  var tests1 = new testron.Test(objTestJSON, 
                                {container: "containerUI", 
                                markerContainer: "containerMarker"});
  
```` 
O:  (PREFERIBLEMENTE)
````javascript  
  
  var tests = testron.parseTestron(objTestronJSON, 
                                  {container: "containerUI", 
                                  markerContainer: "containerMarker"});
  
```` 

luego pueden utilizarse **eventos** para realizar acciones condicionadas por sus **listeners**:
````javascript    

  testron.onClick(function(answer, marker){
      alert("CLICK: " + answer.parent.num + 
            "[" + answer.name + "] ). " + marker.score);
      contMarker.style.visibility = "hidden";
  });
  testron.onFinished(function(test){
      alert("FINISHED TEST: " + test.id);
      contMarker.style.visibility = "visible";
  });
  
```` 

> Por supuesto se debe cargar previamente el **script** en la cabecera HTML. (sección *header*) 
>````HTML
>  
>  <script type="text/javascript" src="testron.js"></script>
>  
>````

## API Pública
 - Constructor
````javascript
  testron.Test (test-questions object);
````
 - Getters 
````javascript
  getTests ();
  addTest (test-questions object);
  removeTest (test-questions object);
  resetTests ();
````
 - OTROS METHODS
````javascript
  parseTestrons (tests-questions object);
  toJSON ();
````
 - OBJECTOS INTERNOS
   - util
````javascript
  toPrecision (floatNumber, precision);
  toDecimals (floatNumber, precision);
  toDigits (num, digits, sign);
  icos [icons object]
  addEvent (elem, eventType, handler);
  ... algunos listeners ...
````
 - EVENTOS
````javascript
  onOk (function listenerOk (answer, marker) { ... });
  onFail (function listenerFail (answer, marker) { ... });
  onClick (function listenerClick (answer, marker) { ... });
  onNext (function listenerNext (question, marker) { ... });
  onMarker (function listenerUpdateMarker (marker) { ... });
  onFinished (function listenerFinished (test) { ... });
````

## ESTRUCTURA <small>para los objetos 'tests'</small>
Esta estructura es rígida y debe ser como el ejemplo siguiente:
````javascript
{
    testron: [
        {
            conf: {className: "test-80", container: "container1", 
                   markerContainer: "container2", stopOnSuccess: true, 
                   digits: 2, precision: 2},
            questions: [
                {
                    conf: {num: 1, solution: 2, txt: "Pregunta 1 ???"},
                    answers: [
                        {name: "A", txt: "Respuesta A"},
                        {name: "B", txt: "Respuesta B"},
                        {name: "C", txt: "Respuesta C"}
                    ]
                },
                {
                    conf: {num: 2, solution: 3, txt: "Pregunta 2 ???"},
                    answers: [
                        {name: "A", txt: "Respuesta A"},
                        {name: "B", txt: "Respuesta B"},
                        {name: "C", txt: "Respuesta C"}
                    ]
                },
                {
                    conf: {num: 3, solution: 3, txt: "Pregunta 3 ???"},
                    answers: [
                        {name: "A", txt: "Respuesta A"},
                        {name: "B", txt: "Respuesta B"},
                        {name: "C", txt: "Respuesta C"}
                    ]
                },
                {
                    conf: {num: 4, solution: 1, txt: "Pregunta 4 ???"},
                    answers: [
                        {name: "A", txt: "Respuesta A"},
                        {name: "B", txt: "Respuesta B"},
                        {name: "C", txt: "Respuesta C"}
                    ]
                } // END QUESTION
            ] // END QUESTIONS
        } // END TEST
        //, ... OTHERs TESTS
    ] // END TESTS
}
````

## CONFIGURACIóN
Estas opciones para la configuración pueden incluirse en la propiedad **conf**, estas son:
  
  - **className**       : {string} si se desea un nombre de clase específico para el contenedor 
  - **container**       : {string} el id del elemento *DOM* el cual embeberá toda la UI
  - **markerContainer** : {string} igual para el **Marcador** (se aconseja en position fija (*fixed* ))
  - **remove**          : {boolean} limpia el *contenedor* antes de insertar el contenido
  - **markerRemove**    : {boolean} igual para el contenedor del **Marcador**
  - **stopOnSuccess**   : {boolean} permite seleccionar múltiples respuestas hasta encontrar la correcta
  - **digits**          : {number} dígitos para mostrar en el *Marcador*
  - **precision**       : {number} exactitud de los resultados

### Autoría
Creado y desarrollado complétamente por Juan Jose Guerra Haba. &lt;dinertron@gmail.com&gt;    
Copyright 2016 &copy; [GuerraTron](&#x6d;&#97;&#105;&#108;&#116;&#x6f;&#x3a;&#100;&#105;&#110;&#x65;&#x72;&#x74;&#114;&#x6f;&#110;&#64;&#x67;&#109;&#x61;&#x69;&#x6c;&#46;&#99;&#x6f;&#x6d; "author") 
License GPL v3

### Desarrollo &amp; Herramientas
Creado con [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   
Nodeclipse is free open-source project that grows with your contributions.  
Depurado con Firefox + Firebug
Ediciones adicionales y limplieza de código con Notepad++

> Espero que pueda serle de utilidad a alguien como lo ha sido para mí. En tal caso se agradecería email comentando su uso o sugerencias para futuras mejoras.  
> ¡ POR FAVOR, MANTENER CRÉDITOS Y ENLACES. GRACIAS !

    ... y como diría George Lucas: ¡Que la fuerza te acompañe!