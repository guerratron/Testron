//NAMESPACE TESTRON
/** @namespace testron
  * @summary El 'namespace' para todos los objetos 'testrons'
  * @description Este 'namespace' es el punto de partida para la construcción de 
  * Tests tipo 'testrons'. Contiene los métodos y objetos necesarios para, incluso,
  * construir toda la UI completa.  
  * @example <caption>Crear una completa UI Test:</caption>
  * var tests = testron.parseTestrons(
  *                                   objJS, 
  *                                   {container: 'divUI', 
  *                                    markerContainer: 'divMarker'
  *                                   });
  *
  * @example <caption>Usando los eventos:</caption>
  * testron.onOk(function(answer, marker){
  *   alert("OK: " + 
  *         answer.parent.num + "[" + 
  *         answer.name + "] ). " + 
  *         marker.score);
  *   contMarker.style.visibility = "visible";
  * });
  * testron.onFinished(function(test){
  *   alert("FINISHED TEST: " + test.id);
  * });
  *
  * @author GuerraTron - 2015. <dinertron@gmail.com> - GPL-v3
  * @version 1.0.0b */
var testron = {};
//END NAMESPACE TESTRON

//MODULE TESTRON & UTILS
/** @lends testron
  * @module utils */
(function (t) {
    "use strict";
   
    //VARIABLES INTERNAS PRIVADAS
    /** @private
      * @memberof testron
      * @summary Variable estática alfanumérica para el "id" generado */
    var alpha = "abcdefghijklmnopqrstuvwxyz";
    /** @private
      * @memberof testron 
      * @summary Prefijo estático para imágenes Base64 con formato 'monocromo GIF' */
    var prefImg64GIF = "data:image/gif;base64,R0lGODlhEAAQAIABAAAAAP///yH5BAEKAAEALAAAAAAQABAAAAI";
    /** @private
      * @memberof testron 
      * @summary array testrons */
    var tests = [];
    //LISTENERS
    /** @private
      * @memberof testron
      * @summary Listener de evento para las Respuestas Correctas. Esto debe ser una función con dos parámetros: El objeto Respuesta (Answer) y el objeto Marcador (Marker) */
    var successAnswerListener = null;
    /** @private
      * @memberof testron
      * @summary Listener de evento para las Respuestas Fallidas. Esto debe ser una función con dos parámetros: El objeto Respuesta (Answer) y el objeto Marcador (Marker) */
    var failAnswerListener = null;
    /** @private
      * @memberof testron
      * @summary Listener de evento para cada 'click' en las Respuestas. Esto debe ser una función con dos parámetros: El objeto Respuesta (Answer) y el objeto Marcador (Marker) */
    var clickAnswerListener = null;
    /** @private
      * @memberof testron
      * @summary Listener de evento para cada 'siguiente' Pregunta. Esto debe ser una función con dos parámetros: El objeto Pregunta (Question) y el objeto Marcador (Marker) */
    var nextQuestionListener = null;
    /** @private
      * @memberof testron
      * @summary Listener de evento en cada 'actualización' del Marcador. El listener pasado debe ser una función con on parámetro: El objeto Marcador (Marker) */
    var updateMarkerListener = null;
    /** @private
      * @memberof testron
      * @summary Listener de evento para cuando 'Finalize' el Test. El listener pasado debe ser una función con un parámetro: El objeto Test */
    var finishedListener = null;
    
    //FUNCIONES INTERNAS PRIVADAS
    /** @private
      * @summary Función Getter 
      * @return {Array:testrons} */
    function getTests() {
        return tests;
    }
    
    function addTest(test) {
        tests.push(test);
    }
    function removeTestIndex(index) {
        if ((index < 0) || (index > tests.length)) { return tests; }
        if (index === 0) {
            if (tests.length === 1) { return (tests = []); }
            return (tests = tests.slice(1));
        }
        var pre = tests.slice(0, index);
        return (tests = pre.concat(tests.slice(index + 1)));
    }
    function removeTest(test) {
        for (var i = 0; i < tests.length; i++) {
            if (tests[i].id === test.id) { return t.removeTestIndex(i); }
        }
        return tests;
    }
    
    function resetTests() {
        tests = [];
    }
    
    /** Obtiene un Id alfanumérico aleatorio. Está basado en la variable estática "alpha" */
    function generateId() {
        var temp = alpha[parseInt(Math.random() * alpha.length, 10)].toLowerCase() +
                 alpha[parseInt(Math.random() * alpha.length, 10)].toUpperCase();
        return temp + (Math.random() * 1000) + alpha[parseInt(Math.random() * alpha.length, 10)].toUpperCase();
    }
    
    /** @memberof module:utils
      * @summary Establece la exactitud del número dependiendo del parámetro.
      * @description Este método procesa el número como cadenas, y retorna un número
      * [es-ES] 
      * <p>Retorna un número 'n' flotante redondeado al número de decimales indicado en 'precision'.
      * Método para formatear números en coma flotante hasta X decimales (puede contener menos)</p>
      * @param floatNumber {number} El número al cual ajustar su precisión
      * @param precision {number} La precisión para most decimales
      * @returns {number}
      * @see #toDecimals(number, number) */
    function toPrecision(floatNumber, precision) {
        //return parseFloat((Math.round(floatNumber * Math.pow(10, decimals)) / Math.pow(10, decimals)) +"" );
        return Math.round(floatNumber * Math.pow(10, precision)) / Math.pow(10, precision);
    }
    /** @summary Establece la exactitud del número dependiendo del parámetro.
      * @description Este método procesa el número como cadenas, y lo retorna como cadena
      * <p>[es-ES] 
      * Retorna un número 'n' flotante redondeado al número de decimales indicado en 'precision'.
      * Método para formatear números en coma flotante hasta X decimales.
      * Retorna una cadena, no un número.</p>
      * @param floatNumber {number} El número al cual ajustar sus decimales
      * @param precision {number} La precisión para most decimales
      * @returns {string}
      * @see #toPrecision(number, number) */
    function toDecimals(floatNumber, decimals) {
        var n = parseFloat(toPrecision(floatNumber, decimals) + "");
        n = (n + "").split(".");
        if (n.length > 1) {
            n[1] = toDigits(n[1].split("").reverse().join(""), decimals).split("").reverse().join("");
        }
        return n.join(".");
    }
    
    /** @summary Fija a un máximo de dígitos
      * @description Retorna un número el cual se fija a un número máximo de digitos, añadiendo ceros a la izquierda.
      * Esto no trunca el número, si es demasiado largo no hace nada.
      * @param num {number} El número a tratar
      * @param digits {number} El total máximo de dígitos para el número
      * @param sign {boolean} Si se desea contar el signo como un dígito
      * @returns {string}
      * @see #digits(number, number) */
    function toDigits(num, digits, sign) {
        if (isNaN(num) || (digits < 2)) { return num; }
        var abs = ((num < 0) ? (num + "").substr(1) : num) + "";
        var signo = (num < 0) ? "-" : "";
        var partes = abs.split(".");
        var discount = (sign && (num < 0)) ? 1 : 0;
        digits -= ((partes.length > 1) ? (partes[1].length + discount) : 0);
        var d = digits;
        do {
            if (partes[0].length < digits) {
                partes[0] = "0" + partes[0];
            }
            d--;
        } while (d > 0);
        
        return (signo + partes.join("."));
    }
    
    /** @summary Fijar a un máximo de dígitos
      * @description Retorna un número al cual se ha fijado un número máximo de dígitos, añadiendo ceros a la izquierda.
      * Esto no truca el número, si es demasiado largo no hace nada.
      * @param num {number} The number to treat
      * @param digits {number} El total máximo de dígitos para el número
      * @returns {string}
      * @see #digits2(number, number)*/
    function toDigits2(num, digits) {
        var n = parseFloat(num + "") + "";
        if (isNaN(n)) { return num; }
        var sign = (num >= 0) ? "" : "-";
        //alert(digits - n.length);
        //for (var i = 0; i < (digits - n.length); i++) {
        /*while (n.length < digits) {
            n = "0" + n;
        }*/
        n = sign + stringFill3("0", (digits - n.length)) + Math.abs(n);
        return n;
    }
    
    /** Una MUY MUY BUENA (LA MEJOR) manera de sintetizar una supuesta función '.repeat(...)' */
    function stringFill3(x, n) {
        if ((typeof(x) === "undefined") || n < 1) { return x; }
        var s = '';
        for (;;) {
            if (n & 1) { s += x; }
            n >>= 1;
            if (n) { x += x; } else { break; }
        }
        /*do {
            if (n & 1) { s += x; }
            n >>= 1;
            x += x;
        } while (n);*/
        return s;
    }
    
    /** 
      * @summary Función completa AUTOSUFICIENTE. Si se aportan los 'contenedores' crea incluso la interfaz gráfica.
      * @description Crea el Test (o los Tests) desde el parámetro 'testrons'.
      * El parámetro puede ser un objeto Javascript o una cadena JSON con la siguiente estructura:
      * <pre>
      * {
      *   testrons: [
      *     {
      *       conf: {...},
      *       questions: [
      *         {
      *           conf: {..., txt: "Question 1 ??"},
      *           answers: [
      *             {name: "A", txt: "Answer 1"}, {...}, ...
      *           ]
      *         },
      *         { ... }, //OTHER QUESTION
      *         ...
      *       ]
      *     },
      *     { ... } //OTHER TEST
      *   ]
      * }
      * </pre>
      *
      * El segundo parámetro es Opcional, representa cualquier variable de configuración extra, por ejemplo 
      * los contenedores para la UI en la forma: <code>{container: "idElement1", markerContainer: "idElement2"}</code>.
      * @returns {Array} Un array de objetos Testrons
      */
    function parseTestrons(testrons, conf) {
        //var tests = [];
        //tests = [];
        conf = conf || {};
        if (testrons && testrons.replace) { //Comprobar si es una cadena
            testrons = JSON.parse(testrons);
        }
        var str = ["Guerratron Analizing  with testron.parseTestrons() ... "];
        if (!testrons) {
            str.push("ERROR: 'testrons' object not exists!");
            return ("ERROR::\n" + str.join("\n"));
        }
        if (testrons.testrons) { testrons = testrons.testrons; }
        if (!testrons || (testrons.length < 1)) {
            str.push("ERROR: 'testrons' array not exists, or is empty!");
            return ("ERROR::\n" + str.join("\n"));
        }
        
        t.resetTests();
        
        var confLength = 0;
        for(var p in conf){ if(conf.hasOwnProperty(p)) { confLength++; } }
        
        for (var i = 0; i < testrons.length; i++) {
            var test = testrons[i];
            if (!test || !test.conf) {
                str.push("WARNING: 'testrons.test[" + i + "].conf' object not exists!");
                if (!confLength) { continue; }
            }
            test.conf = merge(test.conf, conf);
            test.conf.container = filterContainer(test.conf.container, test.conf.remove);
            test.conf.markerContainer = filterContainer(test.conf.markerContainer, test.conf.markerRemove);
            
            test = new t.Test({testron: test});
            //tests.push(new t.Test({testron: test}));
            //t.addTest(test);
            test.update();
        }

        //return tests;
        return t.getTests();
        //return str.join("\n");
    }
    
    function filterContainer(container, remove) {
        if (container) {
            if (!container.getAttribute && container.replace) { // string
                container = document.getElementById(container);
            }
            if (container) {
                if (remove) { container.innerHTML = ""; }
            } else {
                container = null;
            }
        } else {
            container = null;
        }
        return container;
    }
    
    /** Iconos en base 64 para adjuntar al atributo 'src' de las imágenes, al 'href' de las etiquetas 'a',
      * o bien para utilizarlo en CSS en el background como 'url(...)'
      * @returns {Object} */
    function icos() {
        return {
          /*"PREF":           prefImg64GIF, /*Prefijo GIF monocromo. No utilizar externamente */
          /** Imágen representando el número de versión de estos iconos. (1) */
          VER:        "data:image/gif;base64,R0lGODlhCAAIAIABAAAAAP///yH5BAEKAAEALAAAAAAIAAgAAAINjGEZgIqtVjxTOsZqKgA7",
          GUERRATRON: "data:image/gif;base64,R0lGODlhEAAQAOMMABUQEL4aF38yEmZXVCRmmU9mHf9ERVqrLM2Ue/uUMpSwwvrKgP///////////////yH5BAEKAA8ALAAAAAAQABAAAARY8J1HZb31jIzx+SDQXUg4XuCnnFT6JfCydAdBHIAgxAhmEwpCIAAbLESV34+YAMyQD+VAMNT1oEGbYhAwdFfQKEABEBkezjD6QaYI2OuLaPXYPHqsvP4SAQA7",
          LOGO:       "data:image/gif;base64,R0lGODlhEAAQAKECAAcJBOIeFP///////yH5BAEKAAIALAAAAAAQABAAAAI0lC8RyAeqQHMPAtmuVEIz/11HNHUctEwoWrJcmaQiPIPZ3OEUNqbI24toWMGApgI0JJW+AgA7",
          //
          "ADJUST":         prefImg64GIF + "njI9pwKDtAlNoyktd3G/1E1EeJoJhuZwlh54q9rKaOEtvtTWPjioFADs=",
          "ADJUST1":        prefImg64GIF + "ljI9pwLodoItgxVkr0nvew2GWB4akdI5eaHaJmYkaqkBM++BkAQA7",
          "ADJUST2":        prefImg64GIF + "rjI9pwIztQlQLLGmTy7a9fWFclH0QZZaoqFLQdIxy2MEehylgvpJn/FspCgA7",
          "ADJUST3":        prefImg64GIF + "pjI9pwIztQlMrTnrBUlruD3ZJJ1JHZD5lSmLn83oyLF+chY64LUGpWQAAOw==",
          "AXES":           prefImg64GIF + "mjANwy5ja1nvRJIcjvKge7n1QaI2lZp4MKCnTC8cyy4prmrU3GhYAOw==",
          "AXES2":          prefImg64GIF + "sjAEWuKrITnMQPrcSi4merl1dhnnPiIVfyZIpupbR2W7Vjef6OL8UHKP5DAUAOw==",
          "BROOM":          prefImg64GIF + "gjI+pywzQ0IMxzGpfnVRyrnxfKGpL2SVoJLKje2GmUgAAOw==",
          "CLOSE":          prefImg64GIF + "njI9pwLodGEQSPEnrqTbqzGFKOI2cs50o2SVs6YlqXKof2IlmiyoFADs=",
          "COLOR":          prefImg64GIF + "gjI+pywcPmoGw1XBTxlE9iXzg1I2b6ImbRpUMNcayXAAAOw==",
          "COG":            prefImg64GIF + "mjA8Jx63bQkLPzIez3ptlOzkhCHmjdJJmSUFfy8UyhpJjakdR1RQAOw==",
          "DECIMALS":       prefImg64GIF + "pjI+pqwDsjotpPkoNzuFJxHkaKHYgeX5SyaLquHqhfE0aneUix/T+UQAAOw==",
          "DOWN":           prefImg64GIF + "kjA8Jx63b4otSUWcvyhjOYD3LJJZmeIpbCq0mdWqlZnw02DIFADs=",
          "DOWN_IMAGE":     prefImg64GIF + "jhI+pyxGsXHpw0gqcjFRv5IWSeInRcTWoFaLkx5nx675eJhYAOw==",
          "DOWNLOAD":       prefImg64GIF + "eDI6Zpt0Bo4Rr2mql27y/6AGaN24Z41xduaKh+YoFADs=",
          "DRAW":           prefImg64GIF + "jjI+pCrDc3DMyThva03y7L0FZFiadtkTgRaEeOZHYVcb2vRQAOw==",
          "EMPTY":          prefImg64GIF, /*Igual al Prefijo GIF monocromo. */
          "ERASER":         prefImg64GIF + "mjH+gyKYPWoJPUsrunRryHgUhuFRi55jaN3psGyKbKJ1ubZt4vhUAOw==",
          "FRACTION":       prefImg64GIF + "njI+JkMDq2lthVtsWpiaqM3mQw4ifVmXoBWJiZLLaZsJWHeYceJ4FADs=",
          "GRID" :          prefImg64GIF + "ljGGBl72anos0gouzrpA134UTKGnmRnJjKHFPecauOoPr+6V2AQA7",
          "HELP":           prefImg64GIF + "jjAOpcI0L3TrRTKlscnQ/3jFgKIJQyVWjumYj+cbvFdPyWwAAOw==",
          "IMAGE":          prefImg64GIF + "ghI+pyxDR0HvRTVhnwtXydimaNxoXdGJoepJs28Xy3BQAOw==",
          "INFO":           prefImg64GIF + "mjI+pywYPWoDuLTtjVnq7hHHdhITkMZppF5qn96JjdWFUA83SzhcAOw==",
          "INFO2":          prefImg64GIF + "mjA2px6G/GDyPTlTd1Qv6n3FgYo2kOJamWoUAip1xJM6yvTVeUwAAOw==",
          "INFO3":          prefImg64GIF + "ijI+pBg2LHoPHSYqVvfDy5WEN8yWhWI1dFZRsSqlq7GR2AQA7",
          "INVERT_X":       prefImg64GIF + "njI+piwDnWIiGzteetVBjnn3OOEIViZ4iGrXi4nbJhl2ZLOX6zgcFADs=",
          "INVERT_Y":       prefImg64GIF + "rjI+pCX1uYGjg1Xin1NxmvlHMpn1YhF1q5oitWbknQtXdKN74spj8D0QUAAA7",
          "LAYERS":         prefImg64GIF + "mjI+ZwO2MngTRmXcD1lZzukDeJo1dSU2owqZqk70wx7YyeN31fhQAOw==",
          "LOCK_LOCKED":    prefImg64GIF + "ojA8Jx6zaXDIwhomWxVRHfnnZQ4plKZ1V94Sri5Fp3I4Taquznp9GAQA7",
          "LOCK_UNLOCKED":  prefImg64GIF + "njA8Jx6zaXDIwhomWjXhL/oTdJYZSWVEPuWaV6WKwus4sqtH4uQcFADs=",
          "MAGIC":          prefImg64GIF + "mRB6Gitn7ImsG1GTPdW9CT0Uf422ZqC1nmpIlaoGwLMaoROP3jhQAOw==",
          "MINUS":          prefImg64GIF + "TjI+py+0Po3Sg2quuBrP7D4ZOAQA7",
          "MOUSE_DROP":     prefImg64GIF + "ljI+py+DOwptQvXPT3cB031XaB5UUF36ImEmV6p5RLM72jedMAQA7",
          "MOUSE_POINT":    prefImg64GIF + "ojIFoy+nKDgwpUlVrAzfzfVlR1jnb93yL+Yhh6kplrJrxqt2z3vFSAQA7",
          "MOVE":           prefImg64GIF + "ljB8AyKwN1YNHSoomXUbz+nmcRZbmOYmgs3ZY8mHlC2uvfcdHAQA7",
          "NEXT":           prefImg64GIF + "ljI+pq9ALIoquyUPhNdlWvk1hl5CBeY5h+rGl2rrYaqLcw+RIAQA7",
          "PAINT":          prefImg64GIF + "kjAOpe7cPGpwRIVpNxNm2/1HgqJFjZzKmpqxs4l6wq6512jYFADs=",
          "PALETTE":        prefImg64GIF + "mjI+ZwM0anASrmXnkpfH17mzURJYYaHrpSoqt5aIyGKOhmGnQbhQAOw==",
          "PENCIL":         prefImg64GIF + "pjAGmq3jJFgxoMuiobXrmizWbxj3R542oeKbJSFJSRFpwXNLoLVY8WAAAOw==",
          "PLUS":           prefImg64GIF + "ajI+py+0AHILy0Boug7zH5HnPV2mSOWLqihUAOw==",
          "POLYGON":        prefImg64GIF + "qjA8Jx73xmjNRUpXsZVl2jmHa01XcBo3h50Us6JiQLM5vipPeVbalcigAADs=",
          "POLYGON2":       prefImg64GIF + "mjA8Jx63b4ovuQZpYRrPaLX2XZ1HBBGJXqo2n+4Zb186KLOIGXQAAOw==",
          "POLYGON3":       prefImg64GIF + "rjA8Jx73xmjNRIiUxfIli1W3fAjJlaXloqmlmeGWVJ9cbfYF6y/WcChN1CgA7",
          "PROPORTION_X":   prefImg64GIF + "rjI+pywafYJSHogcqzgFi3W3c94WWeHGparJoK5HemJXmYtsaGyp631AUAAA7",
          "PROPORTION_Y":   prefImg64GIF + "pjI+pAbDbHIqqpSgZswZLzm2bA1rUmKHpebBtOlaweM3hKz+5Ps38UQAAOw==",
          "REFRESH":        prefImg64GIF + "kjI+pywEPG5xgPXVRbqdyQzGesyUROZpbqk0fqbJlR80x+yYFADs=",
          "REFRESH2":       prefImg64GIF + "oRB6gi2e5okKyMihpxLNx/njWJnbeiabNtY5my5DwlGmkW4N16ORJAQA7",
          "ROUNDED":        prefImg64GIF + "ojB8AyKe/moFQPnSxanlG/m2SR45JJI5iaoUfw3YOe77yTL0wZc5SAQA7",
          "RULER":          prefImg64GIF + "gjAOpeY2rnITSwFgvy7o2yl2eBoydZy2mGILTiboO2RQAOw==",
          "RULER_WIDTH":    prefImg64GIF + "qDIIIl2usoomwJVvn1TWz5Shgk23mNKaOerBPu8YwSNf2jef6ztfnHygAADs=",
          "RULER_HEIGHT":   prefImg64GIF + "rDI4Xa5zpQESsyvUoVibfumXRxDlY+ICX95Usin4gCXWtp8ZaR8+nnbItCgA7",
          "SAVE":           prefImg64GIF + "aDI6Zpt0Bo4Rr2mql27z7T4GRGHrlh6YoAxYAOw==",
          "SELECT":         prefImg64GIF + "pjI9pwNEOYHRKzVkPXo9tCiLXQiZjhqZWKZZnG3LXo6ngV81Rt9O2UQAAOw==",
          "SHAPE":          prefImg64GIF + "mjI8Hm20LnIIM0aga1HrbhD3ZB0aY1zFoGqzWGk5SWEmt6+B5nRQAOw==",
          "SIZE":           prefImg64GIF + "ljI+pywrfzpsRGutAshhfPWmBuHEg+aFnaX6SGCKhiqbRjedJAQA7",
          "STAR":           prefImg64GIF + "ejI+pywitHjygTlPlypzHnjGgtnlQd1qhmJDXCzcFADs=",
          "STAR2":          prefImg64GIF + "pjI+pBrDa2kPRzSCxTdV29h1ddIHalWmbmJrc6lLw+UJORctjC66kUQAAOw==",
          "TEXT":           prefImg64GIF + "rjAN5y+kMnYJLAlrvxE/Jdhnakx3WhoSiZbLTdqZrm4Udenp4Lrdq+puBCgA7",
          "TOROTRON":       prefImg64GIF + "pjI9pgKwHonxtUijdDVnTiGXJ1FkLx5Weo4Jhq4ipea7piJ55s7MbVQAAOw==",
          "TRASH":          prefImg64GIF + "rjA2pxwicWlC0nicbrnyhfEHgg33ihIYnuZqsun1lGqNzHd+ufI5aFzEUAAA7",
          "TRASH2":         prefImg64GIF + "qjA2pxwicWlC0nicbrnzlf3UUBE5k9mCItqrmu70r3J6x6d5xXrqTqCoAADs=",
          "TRASH3":         prefImg64GIF + "pjA2pxwicWlC0norXzFh6yVFQGF3cNopR6Tyr+5gwym7zm9KzHDbkUQAAOw==",
          "UNDO":           prefImg64GIF + "lRB6gi6e54nOyTothbFIzjn1IKHrNOZYoNa1sC4EiOdMn6VZnAQA7",
          "UNDO2":          prefImg64GIF + "uRB6gi6f5EHOwtWjuyi9TySWX1UUS6WzbKFpu6KJtnFag9kEq5pmklwJOXipLAQA7",
          "USER":           prefImg64GIF + "gjI+pAQ2LnINGNsostm9PDIYQdynkd5xSpJZV24lyUgAAOw==",
          "VECTOR":         prefImg64GIF + "jhBGpee3/1oJIshOqnWzLqnlZJ5KhB5amOrYl0qCQTNUODRQAOw==",
          "VECTOR2":        prefImg64GIF + "ohBGpecYNH1sLhUifs7nO7l1gyI1WCZ6joq7iuyJNOsPUiUOH5nRNAQA7",
          "WEB":            prefImg64GIF + "qjI+pwK3WokNyMlrpyekG8HkLFIKPiUrat0WrWF6iCXE15uL1tKjPnygAADs=",
          "WRENCH":         prefImg64GIF + "sjB+gi83a0IPRQHaA1Il331ncAlLktYlTRjlmu43t+Wr2md5g+lUq5vvsIgUAOw==",
          "XY":             prefImg64GIF + "ojI+py30AEAzzVTMvvDR2HFVc6G2bdIIcaJmJVnoqa9U0nX726vROAQA7",
          "ZOOM":           prefImg64GIF + "ojAOZx6YPmlNzNcvo0Rkjv0WheJGfWZUmN0Jg5b6n+Eh2bXdsjudjAQA7",
          "ZOOM_SIZE":      prefImg64GIF + "pjI95oB0AHYJUzlQVMzRfvj0hB2LjFk1nqX7iMj5qh3Ywk3laGu8WVgAAOw==",
          "ZOOM_IN":        prefImg64GIF + "qjAOZx6YPmltHSYrprHFzBIHMAkWa6KEfek6dK4GlddFPXLdxiHP6nigAADs=",
          "ZOOM_OUT":       prefImg64GIF + "qjAOZx6YPmltHScpsjRLx6T1eFkHlN3YY2KwTqrWmeGl0R7rqjYdorygAADs=",
          "ZOOM_RESTORE":   prefImg64GIF + "sRA6ZeK2vmlvTyBCrRYYuynDghklgOYnWiWXP1ZKZCdWOpsL6q9NzHyMBFQUAOw=="
        };
    }
    
    /** COMPATIBILIZADOR DE EVENTOS
     * @param elem {Object:HTMLElement} es el elemento sobre el que se quiere establecer la escucha.
     * @param enventType {string} El nombre del evento (sin prefijo 'on')
     * @param handler {Function|lambda} la función a ejecutar
     * @returns {Object} Se retorna el objeto 'util' para permitir 'chaining' */
    function addEvent (elem, eventType, handler) {
        if (elem.addEventListener){ //ALL (IE>8)
            elem.addEventListener(eventType, handler, false);
        } else if (elem.attachEvent){ //IE<=8
            elem.attachEvent('on'+eventType, handler);
        }else{
            alert("NO PUEDEN ASOCIARSE EVENTOS AL ELEMENTO");
        }
        return this;
    }
      
    function editListener(el) {
        var elP = el.parentNode;
        if (elP.getAttribute("class").indexOf("hidden") > -1) {
            elP.setAttribute("class", "visible");
            elP.style.display = "table-cell";
            el.style.display = "block";
            el.focus();
            el.select();
            var a= document.getElementById("testron-download-link");
            if (a) { a.style.display = "none"; }
        } else {
            elP.setAttribute("class", "hidden");
            elP.style.display = "none";
        }
    }
    
    /*
    //CON OBJETO BLOB
    function downIE6(fileName, content, contentType) {
      //window.open("http://dev.modern.ie/community/","_blank","height=300,width=500,scrollbars=yes,location=yes");
      //ABRE UNA VENTANA CON UN HTML EMBEBIDO EN EL TEXTO
      /*window.open('data:text/html;charset=utf-8,%3C!DOCTYPE%20HTML%20PUBLIC%20%22-'+
  '%2F%2FW3C%2F%2FDTD%20HTML%204.0%2F%2FEN%22%3E%0D%0A%3Chtml%20lang%3D%22en'+
  '%22%3E%0D%0A%3Chead%3E%3Ctitle%3EEmbedded%20Window%3C%2Ftitle%3E%3C%2Fhea'+
  'd%3E%0D%0A%3Cbody%3E%3Ch1%3E42%3C%2Fh1%3E%3C%2Fbody%3E%0D%0A%3C%2Fhtml%3E'+
  '%0D%0A','_blank','height=300,width=400');*/
  /*
          if(!contentType) { contentType = 'application/octet-stream'; }
              var a = document.createElement('a');
              //var blob = new Blob([content], {'type':contentType});
              //a.href = window.URL.createObjectURL(blob);
              a.href = window.URL.createObjectURL({"content": content, "type": contentType});
              a.download = fileName;
              if (document.createEvent) {
                  var event = document.createEvent('MouseEvents');
                  event.initEvent('click', true, true);
                  a.dispatchEvent(event);
              } else {
                  a.click();
              }
      }
    //CON LINK AUTO-CONSTRUIDO Y AUTO-DISPARADO
    function downIE5(filename, text) {
          var pom = document.createElement('a');
          pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
          //pom.setAttribute('href', 'data:application/octet-stream,' + encodeURIComponent(text));
          //message/rfc822 //multipart/alternative
          pom.setAttribute('download', filename);
          pom.innerHTML = "EL LINK cREADO";
          pom.style.color = "red";
          document.getElementById("divLink").appendChild(pom);
          if (document.createEvent) {
              var event = document.createEvent('MouseEvents');
              event.initEvent('click', true, true);
              pom.dispatchEvent(event);
          } else {
              pom.click();
          }
      }
    */
    
    //PROBLEMAS EN IE, PERO QUE COPIEN EL TEXTO Y LO GUARDEN MANUALMENTE...
    function saveListener(el) {
        if (!encodeURIComponent) { return copyClipboardListener(el); }
        var elP = el.parentNode;
        elP.setAttribute("class", "visible");
        elP.style.display = "table-cell";
        el.style.display = "block";
        el.focus();
        el.select();
        var a= document.getElementById("testron-download-link");
        if (!a) {
            a = document.createElement("a");
            a.setAttribute("id", "testron-download-link");
            a.innerHTML = "&nabla; donwload &nabla;";
            var d = new Date();
            a.setAttribute("download", "testron-" + (d.getTime()) + ".json");
            a.setAttribute("target", "_blank");
            a.setAttribute("title", "download json");
            a.style.textShadow = "1px 1px 2px #333333";
            /**/
            addEvent(a, "click", function onClickDownload() {
                a.style.display = "none";
                return false;
            });
            elP.appendChild(a);
        }
        a.setAttribute("style", "display:inline");
        a.setAttribute("href", 'data:text/plain;charset=utf-8,' +
                                encodeURIComponent(el.innerHTML));
        //el.style.display = "none";
        //el.style.visibility = "hidden";
        el.setAttribute("style", "display:none");
        //a.style.display = "inline";
        
        //el.toDataURL()); //base64.encode(el.innerHTML));
    }
    
    function copyClipboardListener(el) {
        var elP = el.parentNode;
        if (elP.getAttribute("class").indexOf("hidden") > -1) {
            elP.setAttribute("class", "visible");
            elP.style.display = "table-cell";
            el.focus();
            el.select();
            //CLIPBOARD
            var clip = false;
            if (window && window.clipboardData && window.clipboardData.setData){// CLIPBOARD ONLY IE
                window.clipboardData.setData("Text", el.innerHTML);
                clip = true;
             } else if(document.execCommand) { //ALL ANOTHERS
                clip = document.execCommand('copy');
                //window.getSelection().removeAllRanges();
             }
             if (clip === false) {
                alert("Your browser doesn't allows copy from 'textarea'");
             } else {
                alert("OKAY. Copied text. \n Now you can paste it into any text file to save");
             }
        } else {
            elP.setAttribute("class", "hidden");
            elP.style.display = "none";
        }
    }
    
    function resetListener(el) {
        //self.root.parseTestrons(JSON.parse(areaEditSave.value));
        return t.parseTestrons(JSON.parse(el.value));
    }
    
    /** @summary Método para detectar el elemento padre contenedor a través de timers. */
    function setTimerContainer(obj) {
        var success = false, interval;
        function timmerContainer(obj) {
            var testronParent = null;
            if (!obj) { window.clearInterval(interval); }
            if (obj && obj.element && obj.element.parentNode) {
                testronParent = obj.element.parentNode;
                if (testronParent) {
                    testronParent.id = testronParent.id ? testronParent.id : ("testron-parent-" + t.getTests().length);
                    obj.conf.container = testronParent;
                    obj.container = testronParent;
                }
            }
            /*
            var li = document.createElement("li");
            li.innerHTML =  (interval + "-" + obj.element.parentNode + "; ");
            obj.element.appendChild(li);
            */
            if (testronParent) { window.clearInterval(interval); /*alert("out Interval " + interval);*/ }
            
            return testronParent;
        }
        if (!obj.conf.container && !obj.container && obj.element) { //&& obj.element.parentNode) {
            if (window && window.setInterval) {
                try {
                    //interval = window.setInterval(timmerContainer, 500, obj); //WARNING IE
                    interval = window.setInterval(function () { timmerContainer(obj); }, 500);
                    success = true;
                } catch (e) {
                    /*try {
                        interval = window.setInterval(function () { timmerContainer(obj); }, 500);
                        success = true;
                    } catch (e2) {
                        return false;
                    }*/
                }
            }
        }
        return success;
    }
    
    //FUNCIONES INTERNAS PARA EVENTOS
    function onOk(listener, answer){
      successAnswerListener = listener ? listener : successAnswerListener;
      if(successAnswerListener && answer){
        var marker = (answer.parent) ? (answer.parent.parent ? answer.parent.parent.marker : null) : null;
        successAnswerListener.call(null, answer, marker);
      }
    }
    function onFail(listener, answer){
      failAnswerListener = listener ? listener : failAnswerListener;
      if(failAnswerListener && answer){
        var marker = (answer.parent) ? (answer.parent.parent ? answer.parent.parent.marker : null) : null;
        failAnswerListener.call(null, answer, marker);
      }
    }
    function onClick(listener, answer){
      clickAnswerListener = listener ? listener : clickAnswerListener;
      if(clickAnswerListener && answer){
        var marker = (answer.parent) ? (answer.parent.parent ? answer.parent.parent.marker : null) : null;
        clickAnswerListener.call(null, answer, marker);
      }
    }
    function onNext(listener, question){
      nextQuestionListener = listener ? listener : nextQuestionListener;
      if(nextQuestionListener && question){
        var marker = (question.parent) ? question.parent.marker : null;
        nextQuestionListener.call(null, question, marker);
      }
    }
    function onMarker(listener, marker){
      updateMarkerListener = listener ? listener : updateMarkerListener;
      if(updateMarkerListener && marker){
        updateMarkerListener.call(null, marker);
      }
    }
    function onFinished(listener, test){
      finishedListener = listener ? listener : finishedListener;
      if(finishedListener && test){
        finishedListener.call(null, test);
      }
    }
      
    function toJSON() {
        var str = [];
        for (var i = 0; i < t.getTests().length; i++) {
            var test = t.getTests()[i];
            /*if (!test.conf.container && test.element && test.element.parentNode) {
                var testronParent = test.element.parentNode;
                if (testronParent) {
                    testronParent.id = testronParent.id ? testronParent.id : ("testron-parent-" + t.getTests().length);
                    test.conf.container = testronParent;
                    test.container = testronParent;
                }
            }*/
            str.push(test.toJSON());
        }
        return ('{ "testrons": [ ' + str.join(", ") + ' ] }');
    }
    
    /** @summary Utilidad para mezclar dos objetos de configuración */
    function merge(confInitial, confFinal) {
        confInitial = confInitial || {};
        confFinal = confFinal || {};
        for (var p in confFinal) {
            if (confFinal.hasOwnProperty(p)) {
                confInitial[p] = confFinal[p];
                //alert(p + " == " + confInitial[p] + " == " + confFinal[p]);
            }
        }
        return confInitial;
    }
    
 
    //PUBLIC API
    /** @memberof testron 
      * @summary obtiene su identificador
      * @type {string} */
    t.id = generateId();
    /** @method
      * @memberof testron 
      * @summary Método Getter
      * @return {Array:tests} */
    t.getTests = getTests;
    /** @method
      * @memberof testron 
      * @summary Añade un Test al array */
    t.addTest = addTest;
    /** @method
      * @memberof testron 
      * @summary Elimina un Test del array, desde su índice
      * @return {Array} el array de Tests actualizado */
    t.removeTestIndex = removeTestIndex;
    /** @method
      * @memberof testron 
      * @summary Borra un Test desde el array
      * @return {Array} el array de Tests actualizado */
    t.removeTest = removeTest;
    /** @method
      * @memberof testron 
      * @summary Borra TODOS los Tests del array */
    t.resetTests = resetTests;
    /** @memberof testron
      * @summary El objeto 'utils'
      * @property {string} generateId obtiene un identificador único
      * @property {Function} Util.toPrecision - Obtiene un número el cual es fijado a una conreta precisión
      * @property {Function} Util.toDecimals - Otiene un número el cual es fijado a unos concretos decimales
      * @property {Function} Util.toDigits - Otiene un número el cual es fijado a unos exactos dígitos
      * @property {Object} Util.icos - Es un objeto el cual contiene los iconos en formato 'base64'
      * @property {Function} Util.addEvent - Método Cross-browser para añadir eventos
      * @property {Function} Util.editListener - Listener para disparar los eventos 'change' (editArea).
      * @property {Function} Util.saveListener - Listener para disparar los eventos 'save' (button).
      * @property {Function} Util.copyClipboardListener - Listener para disparar los eventos 'copy' (clipboard).
      * @property {Function} Util.resetListener - reinicializa el listener para este objeto. (no-implementable actualmente)
      * @property {Function} Util.setTimerContainer - establece un temporizador para este elemento contenedor
      * @type {Object} */
    t.utils = {
        generateId: generateId,
        toPrecision: toPrecision,
        toDecimals: toDecimals,
        toDigits: toDigits,
        icos: icos(), //retorna un objeto literal
        addEvent: addEvent,
        editListener: editListener,
        saveListener: saveListener,
        copyClipboardListener: copyClipboardListener,
        resetListener: resetListener,
        setTimerContainer: setTimerContainer
    };
    /** @method
      * @memberof testron 
      * @summary Parsea una cadena JSON que representa la suite testron completa
      * @return {Array} el array de tests actualizado */
    t.parseTestrons = parseTestrons;
    /** @method
      * @memberof testron 
      * @summary Filtra el objeto de configuración para sanearlo
      * @return {Object} el objeto de configuración una vez saneado */
    t.filterContainer = filterContainer;
    /** @method
      * @memberof testron 
      * @summary Obtiene una cadena JSON que representa la suite testron completa
      * @return {string} una cadena JSON */
    t.toJSON = toJSON;
    /** @method
      * @memberof testron 
      * @summary Método para mezclar las propiedades de dos objetos (de configuración)
      * @return {Object} el objeto mezclado */
    t.merge = merge;
    //EVENTS HANDLERS
    /** @event
      * @memberof testron
      * @summary Evento para el listener <b>Respuesta correcta</b>. 
      * @description El listener pasado debe ser una función con dos parámetros: El objeto respuesta (Answer) y el objeto marcador (Marker) */
    t.onOk = onOk;
    /** @event
      * @memberof testron
      * @summary Evento para el listener <b>Respuesta fallida</b>. 
      * @description El listener pasado debe ser una función con dos parámetros: El objeto respuesta (Answer) y el objeto marcador (Marker) */
    t.onFail = onFail;
    /** @event
      * @memberof testron
      * @summary Evento para el listener <b>click en Respuesta</b>. 
      * @description El listener pasado debe ser una función con dos parámetros: El objeto respuesta (Answer) y el objeto marcador (Marker) */
    t.onClick = onClick;
    /** @event
      * @memberof testron
      * @summary Evento para el listener <b>siguiente Pregunta</b>. 
      * @description El listener pasado debe ser una función con dos parámetros: El objeto pregunta (Question) y el objeto marcador (Marker) */
    t.onNext = onNext;
    /** @event
      * @memberof testron
      * @summary Evento para el listener <b>actualiza Marcador</b>. 
      * @description El listener pasado debe ser una función con un parámetro: El objeto marcador (Marker) */
    t.onMarker = onMarker;
    /** @event
      * @memberof testron
      * @summary Evento para el listener <b>Test finalizado</b>. 
      * @description El listener pasado debe ser una función con un parámetro: El objeto Test */
    t.onFinished = onFinished;
})
(testron || (testron = {}));
//END MODULE TESTRON & UTILS

//MODULE TEST
/**  @lends testron
  * @module Test */
(function (t) {
    "use strict";
   
    //VARIABLES INTERNAS PRIVADAS
    /** Contador estático */
    var counter = 0;
   
    /** @class Una clase para construir Preguntas Tests configurable y dinámicamente
      * @constructor
      * @memberof module:testron
      * @summary Clase Tests de Concurso
      * @description Constructor para la creación de objetos "Test". Admite un parámetro con
      * un objeto de configuración con unas propiedades o atributos determinados.
      * @param conf {Object} Objeto de configuración (ver {@link #conf conf})
      * @see #conf  */
    function Test(conf) {
        /** @summary Id Exclusivo (+ o -)
          * @type {string} */
        this.id;
        if (t.utils && t.utils.generateId) {
            this.id = t.utils.generateId(); //Exclusive id (+ or -)
        }
        /** @summary Número de este test. 
          * @description Esto no es igual al 'this.id' (desde 0 a +Infinity)
          * @type {number} */
        this.num = counter++; //from 0 to infinity
        /** @summary Objeto padre "testron"
          * @type {namespace:testron} */
        this.root = t;
        /** @summary Array de objetos Question
          * @type {Array:Question} */
        this.questions = [];
        /** @summary el elemento DOM propio
          * @type {Object:HTMLElement} */
        this.element = null;
        /** @summary ¿ es válido este Test ?
          * @type {boolean} */
        this.valid = true;
        /** @summary Marcador para este Test
          * @type {Object:Marker} */
        this.marker = null;
        /** @summary Elemento DOM para el Marcador propio
          * @type {Object:HTMLElement} */
        this.markerElement = null;
        /** @summary Opciones de configuración
          * @description un objeto Javascript con la siguiente estructura:
          * <pre>
          * {
          *   className: "testron-80",
          *   container: "divUI",
          *   markerContainer: "divMarker",
          *   remove: true,
          *   markerRemove: true,
          *   digits: 4,
          *   precision: 2,
          *   nQ: 1,
          *   nA: 4,
          *   stopOnSuccess: false,
          *   charset: "utf-8"
          * }
          * </pre>
          * @type {Object} */
        this.conf = this.filterConf(conf || {});
        if (conf.testron) { //objeto JSON
            //var str =
            this.parseTestron(conf);
            //alert(str);
        }
        /** @summary clon de {@link conf.className}
          * @description si se desea una nombre de clase específico para el contenedor
          * @type {string} */
        this.className = this.conf.className;
        /** @summary clon de {@link conf.container}
          * @description el elemento DOM al cual embeber la UI
          * @type {Object:HTMLElement} */
        this.container = this.conf.container;
        /** @summary clon from {@link conf.markerContainer}
          * @description similar a 'container' para Marcador (Se aconseja en posición fija)
          * @type {Object:HTMLElement} */
        this.markerContainer = this.conf.markerContainer;
        /** @summary clon de {@link conf.remove}
          * @description limpia el contenedor antes de insertar el contenido
          * @type {boolean} */
        this.remove = this.conf.remove;
        /** @summary clon de {@link conf.markerRemove}
          * @description similar a 'remove' para el Marcador
          * @type {boolean} */
        this.markerRemove = this.conf.markerRemove;
        /** @summary ¿ ha finalizado el Test ?
          * @type {boolean} */
        this.finished = false;
        this.root.addTest(this); //var valueJSON = this.root.toJSON().toString();
        //this.update_nAnQ();
        //this.toHtml();
        this.update();
    }
   
    /** @method
      * @summary Obtiene el propio auto-contador */
    Test.prototype.getCounter = function () { return counter; };
   
    /** @method
      * @summary Filtra las opciones de Configuración
      * @description Las Opciones de Configuración se establecerán a las 'por defecto' si no esisten
      * @param conf {Object} Objeto de configuració
      * @return {Object} Las opciones de configuración saneadas
      * @see #conf */
    Test.prototype.filterConf = function (conf) {
        var container = this.root.filterContainer(conf.container, conf.remove);
        var markerContainer = this.root.filterContainer(conf.markerContainer, conf.markerRemove);
        return {
            /** Nombre de clase para estilos CSS */
            className: "testron" + (conf.className ? (" " + conf.className) : ""),
            /* * Fuerza el Parseo */
            //parse: conf.parse || false,
            container: container, //conf.container || null,
            markerContainer: markerContainer, //conf.markerContainer || null,
            remove: conf.remove,
            markerRemove: conf.markerRemove,
            /** Número de Preguntas */
            nQ: conf.nQ || 1,
            /** Número de Respuestas */
            nA: conf.nA || 4,
            digits: conf.digits || 2,
            precision: conf.precision || 2,
            stopOnSuccess: conf.stopOnSuccess || false,
            charset: conf.charset || "utf-8"
        };
    };
    
    /** @summary Elimina las respuestas inválidas */
    Test.prototype.sanitizeQuestions = function () {
        var questions2 = [];
        for (var i = 0; i < this.questions.length; i++) {
            if (this.questions[i].valid) { questions2.push(this.questions[i]); }
        }
        this.questions = questions2;
        this.update_nAnQ();
    };
    
    /** @summary Acatualiza el número de respuestas y preguntas y su marcador */
    Test.prototype.update_nAnQ = function () {
        //Actualiza nA Y nQ
        var nA = 0;
        for (var i = 0; i < this.questions.length; i++) {
            nA += this.questions[i].conf.nA;
        }
        this.conf.nA = nA;
        this.conf.nQ = this.questions.length;
    };
    
    /** @summary Actualiza este Test.
      * @description También actualiza el número de respuestas y preguntas y su marcador */
    Test.prototype.update = function () {
        //this.update_nAnQ();
        this.toHtml();
        if (!this.marker) { this.marker = this.createMarker(this.conf); }
        if (this.marker && this.marker.update) { this.marker.update(); }
        //if (this.marker && this.marker.update) { this.marker.update(); }
        /*if (!this.conf.container && this.element && this.element.parentNode) {
            var testronParent = this.element.parentNode;
            if (testronParent) {
                testronParent.id = testronParent.id ? testronParent.id : ("testron-parent-" + this.id);
                this.conf.container = testronParent;
                this.container = testronParent;
            }
        }*/
    };
    
    /** @summary Verifica si este Test ha finalizado.
      * @return {boolean} */
    Test.prototype.checkFinished = function () {
      var finished = true;
      for (var i = 0; i < this.questions.length; i++) {
            if (!this.questions[i].ok) {
              finished = false;
              break;
            };
      }
      return (this.finished = finished);
    }
   
    /** @method
      * @summary Añade un objeto Pregunta (Question) a este Test
      * @param question {Object:testron.Test.Question} El objeto "Question"
      * @param refresh {boolean} ¿ actualizar este Test ?
      * @returns {Object:Question} Retorna la misma pregunta del parámetro de entrada */
    Test.prototype.addQuestion = function (question, refresh) {
        if (!question || !question.conf) { return question; }
        var finded = false, i = 0, q = null; //, nA = 0;
        this.sanitizeQuestions();
        for (i = 0; i < this.questions.length; i++) {
            q = this.questions[i];
            if (q.conf.num === question.conf.num) { //Already exists
                q = question;
                finded = true;
            }
        }
        if (! finded) {
            question.position = this.questions.length;
            this.questions.push(question);
        }
        //this.update_nAnQ();
        if (refresh) { this.update(); }
        return question;
    };
    
    /** @method
      * @summary Crea y añade un objeto Pregunta (Question) a este Test
      * @param conf {Object} Objeto de configuración (para objetos Question)
      * @returns {Object:Question} Retorna la misma pregunta (objeto Question) creada */
    Test.prototype.createQuestion = function (conf, refresh) {
        return this.addQuestion(new this.Question(this, conf), refresh);
    };
    
    /** @method
      * @summary Crea un objeto Marcador (Marker) para este Test
      * @param conf {Object} Objeto de configuración (para objetos Marker)
      * @returns {Object:Marker} Retorna el nuevo objeto Marker creado */
    Test.prototype.createMarker = function (conf) {
        conf = conf || this.conf;
        if (!conf.markerContainer) { return this.marker; }
        var markerContainer = conf.markerContainer;
        if (!markerContainer.getAttribute && markerContainer.replace) { // string
            markerContainer = document.getElementById(markerContainer);
        }
        if (!markerContainer) { return this.marker; }
        this.markerElement = markerContainer.getElementsByClassName("testron-marker")[0];
        //this.markerContainer = this.markerElement;
        if (!this.markerElement) {
            this.marker = new this.Marker(this, conf);
        }
        this.marker.update();
        //if (this.marker && this.marker.update) { this.marker.update(); }
        return this.marker;
    };
    
    /** @summary Crea un Test desde el parámetro 'test'.
      * @description El parámetro puede ser un objeto Javascript o un acadena JSON con la siguiente estructura:
      * <pre>
      * testron: {
      *     conf: {...},
      *     questions: [...] // an Array of questions. (see Test#parseQuestions(...))
      * }
      * </pre>
      * @param test {Object|string} un objeto Javascript o una cadena JSON
      * @return {string} una cadena "DEBUG" con información
      */
    Test.prototype.parseTestron = function (test) {
        var str = ["Analizing Test.parseTestron() ... "];
        if (test && test.replace) { //Comprobar si es una cadena JSON
            test = JSON.parse(test);
            str.push("string JSON detected !");
        }
        if (!test) {
            str.push("ERROR: 'test' object not exists!");
            return str.join("\n");
        }
        if (test.testron) { test = test.testron; }
        /*if (!test || (test.length < 1)) {
            str.push("ERROR: 'testrons' array not exists, or is empty!");
            return str.join("\n");
        }*/
        if (!test.conf) { str.push("WARNING: 'test.conf' object not exists!"); }
        this.conf = this.filterConf(test.conf);
        //QUESTIONS
        var questions = test.questions;
        if (!questions) {
            str.push("ERROR/WARNING: 'test.questions' array not exists!");
            return str.join("\n");
        }
        for (var i = 0; i < questions.length; i++) {
            var q = questions[i];
            if (!q) {
                str.push("WARNING: 'question[" + i + "]' object not exists!");
                continue;
            }
            this.createQuestion({question: q});
        }
        str.push("... test FINISH");
        return str.join("\n");
    };
   
    /** @method
      * @summary Crea el HTML para la UI para este Test y lo retorna
      * as HTMLElement (HTMLUlElement)
      * @return {HTMLElement:HTMLUlElement} */
    Test.prototype.toHtml = function () {
        /** @type {HTMLElement} */
        var ul = document.createElement("ul");
        if (this.element && this.element.innerHTML) {
            this.element.innerHTML = "";
            ul = this.element;
        }
        /*alert("UNO-"+this.className.substr(0,8)+"-") +" || -"+ (this.className.substr(8).trim()+"-");
        alert("DOS::-"+this.conf.className.substr(0,8)+"-") +" || -"+ (this.conf.className.substr(8).trim()+"-");
        if ((this.className.substr(0,8) === "test ") && (this.className.substr(8).trim().length > 0)) {
            //this.className = this.className.substr(8);
        }*/
        ul.setAttribute("class", this.className);
        if (this.valid) {
            var caption = document.createElement("caption");
            caption.innerHTML = "Testron";
            ul.appendChild(caption);
            this.sanitizeQuestions();
            for (var i = 0; i < this.questions.length; i++) {
                var li = document.createElement("li");
                li.setAttribute("class", "li-question");
                li.appendChild(this.questions[i].toHtml());
                ul.appendChild(li);
            }
            //if (this.element) { this.element.innerHTML = ""; }
            this.element = ul;
            if (this.container) {
                this.container.appendChild(this.element);
            } else {
                t.utils.setTimerContainer(this); //TIMER PARA DETECTAR AL CONTENEDOR
            }
        } else {
            ul.style.background = "#333333";
        }
        
        return ul;
    };
    
    /** @summary Convierte este elemento a JSON 
      * @return {string} una cadena JSON que representa a este objeto Test */
    Test.prototype.toJSON = function () {
        var markerContainer = (this.marker && this.marker.container)  ? this.marker.container : "";
        if (this.markerContainer) {
            if (this.markerContainer.id) { //DOM element
                markerContainer = this.markerContainer.id;
            } else if (this.markerContainer.replace) { //string
                markerContainer = this.markerContainer;
            }
        }
        /*alert("UNO-"+this.className.substr(0,8)+"-") +" || -"+ (this.className.substr(8).trim()+"-");
        alert("DOS::-"+this.conf.className.substr(0,8)+"-") +" || -"+ (this.conf.className.substr(8).trim()+"-");
        if ((this.className.substr(0,8) === "testron ") && (this.className.substr(8).trim().length > 0)) {
            //this.className = this.className.substr(8);
            var partes = this.className.split("testron");
            this.className = "testron" + partes[partes.length - 1];
            this.conf.className = this.className;
        }*/
        var partes = this.className.split("testron");
        this.className = "testron" + partes[partes.length - 1];
        this.conf.className = this.className;
            
        var conf = {
            className: this.conf.className,
            container: (this.container ? this.container.id : ""),
            markerContainer: markerContainer,
            remove: this.remove || this.conf.remove || true,
            markerRemove: this.markerRemove || this.conf.markerRemove || true,
            num: this.conf.num,
            //parse: true, //this.conf.parse,
            nQ: this.conf.nQ,
            nA: this.conf.nA,
            digits: this.conf.digits,
            precision: this.conf.precision,
            stopOnSuccess: this.conf.stopOnSuccess,
            charset: this.conf.charset
        };
        var str = [];
        for (var i = 0; i < this.questions.length; i++) {
            var question = this.questions[i];
            str.push(question.toJSON());
        }
        return ('{"conf": ' + JSON.stringify(conf) + ', "questions": [ ' + str.join(", ") + ' ] }');
    };
    
    //EMIT EVENTS FUNCTIONS
    /** @emitter
      * @summary Emite el evento 'Next' para pasar a la siguiente Pregunta */
    Test.prototype.emitNext = function (question) {
        var msg = "Test:: click in " + question.intents + " " +
                  "intents for Question (" + question.conf.num + ") ";
        if (question.position < (this.questions.length - 1)) {
            msg += "- to Next Question at :: " + (question.position + 2);
        } else {
            msg += "- This is the last Question ...";
        }
        //alert(msg);
        this.root.onNext(null, question);
    };
    
    /** @emitter
      * @summary Emite el evento 'Marker' para actualizar el Marcador */
    Test.prototype.emitMarker = function (question) {
        this.update_nAnQ();
        //this.marker = new this.Marker(this, this.conf);
        if (!this.marker) { this.marker = this.createMarker(this.conf); }
        if (this.marker && this.marker.update) { this.marker.update(question); }
        //if (this.marker && this.marker.update) { this.marker.update(question); }
        this.root.onMarker(null, this.marker);
        if (this.checkFinished()) { this.root.onFinished(null, this); }
    };

    t.Test = Test;

})
(testron || (testron = {}));
//END MODULE TEST

//MODULE MARKER
/** @lends testron.Test
 * @module Marker */
(function (t) {
   "use strict";
  
   //VARIABLES INTERNAS PRIVADAS
   /** Contador estático */
   var counter = 0;
   /** PUNTOS ESTÁTICOS PARA CÁLCULOS */
   var POINTS_TRUE = 1;
   var POINTS_FALSE = -0.5;
   var POINTS_NULL = -0.1;
   var POINTS_BLANK = 0;
   var POINTS_TOP = 10; //Max Puntuation (0-10)
   
   //FUNCIONES INTERNAS PRIVADAS
   /** @class Una clase para construir Marcadores para los Tests, 
     * configurable y dinámicamente
     * @constructor
     * @memberof module:testron#Test
     * @summary Marcador para los Tests
     * @description Constructor para la creación de objetos "Marker". Admite un parámetro con
      * un objeto de configuración con unas propiedades o atributos determinados.
     * @param parent {Object} Objeto "Test"
     * @param conf {Object} Objeto de configuración (ver {@link #conf conf})
     * @see #conf  */
   function Marker(parent, conf) {
     /** @summary Objeto ancestro "testron"
       * @type {namespace:testron} */
     this.root = parent.root;
     /** @summary clon de {@link testron.utils}"
       * @type {Object} */
     this.utils =  (this.root && this.root.utils) ? this.root.utils : null;
     /** @summary Objeto padre "Test"
       * @type {Object:Test} */
     this.parent = parent;
     /** @summary Id Exclusivo (+ o -)
       * @type {string} */
     this.id;
     if (this.utils && this.utils.generateId) {
         this.id = this.utils.generateId();
     } //Exclusive id (+ or -)
     this.id = (parent ? (parent.id + "-") : "") + this.id;
     /** @summary Número de este Marcador. 
       * @description Esto no es igual a 'this.id' (desde 0 a +Infinity)
       * @type {number} */
     this.num = counter++; //from 0 to infinity
     /** @summary Opciones de configuración
       * @description un objeto Javascript con la siguiente estructura:
       * <pre>
       * {
       *    container: "divMarker",
       *    digits: 4,
       *    precision: 2,
       *    nQ: 1,
       *    nA: 4,
       *    charset: "utf-8"
       * }
       * </pre>
       * @type {Object} */
     this.conf = this.filterConf(conf || this.parent.conf);
     /** @summary clon de {@link conf.container}
       * @description esto debe ser igual a {@link parent.markerContainer}
       * @type {Object:HTMLElement} */
     this.container = this.conf.container; //this.root.filterContainer(this.conf.container);
     /** @summary contador para las soluciones de las respuestas
       * @description Son sólo nombres de propiedades, no booleanos, no son datos primitivos. 
       * Your structure is: 
       * <code>{"true": 0, "false": 0, "null": 0, "blank": 0}</code>
       * @type {Object}
       */
     this.results = {"true": 0, "false": 0, "null": 0, "blank": 0};
     this.position = 0;
     /** @summary elemento DOM propio
       * @type {Object:HTMLElement} */
     this.element = null;
     this.elementScore = null;
     this.elementTrue = null;
     this.elementFalse = null;
     this.elementPointsTrue = null;
     this.elementPointsFalse = null;
     this.elementBlank = null;
     this.elementBtnEdit = null;
     this.elementBtnDownload = null;
     this.elementBtnReset = null;
     this.elementAreaEditSave = null;
     /** @summary cuenta los intentos
       * @type {number} */
     this.intents = 0;
     /** @summary registra la puntuación
       * @type {number} */
     this.score = 0;
     /** @summary ¿ cuál es la Pregunta actual ?
       * @type {number} */
     this.currentQuestion = null;
     /** @summary ¿ es válido este Marcador ?
       * @type {boolean} */
     this.valid = true;
     
     this.toHtml();
   }
  
   /**
     * @method
     * @summary Obtiene el propio auto-contador */
   Marker.prototype.getCounter = function () { return counter; };
  
   /**
     * @method
     * @summary Filtra las opciones de configuración
     * @description Las opciones de configuración se tomarán del objeto padre ("Test"), si no existen
     * @param conf {Object} Objeto de configuración
     * @see #conf */
   Marker.prototype.filterConf = function (conf) {
       var markerContainer = this.root.filterContainer(conf.markerContainer, conf.markerRemove);
       return {
           container: markerContainer, //conf.markerContainer,
           /** Número de este Marcador. Esto no es igual a this.id */
           digits: conf.digits || this.parent.conf.digits || 4,
           precision: conf.precision || this.parent.conf.precision || 2,
           /** Número de Preguntas */
           nQ: conf.nQ || this.parent.conf.nQ || 1,
           /** Número de Respuestas */
           nA: conf.nA || this.parent.conf.nA || 4,
           charset: conf.charset || this.parent.conf.charset || "utf-8"
       };
   };
   
   /** @method
     * @summary Comprueba el objeto de los resultados y lo sanea.
     * @see #results */
   Marker.prototype.sanitizeResults = function () {
       this.results = {"true": this.results["true"],
                       "false": this.results["false"],
                       "null": this.results["null"],
                       "blank": this.results.blank};
   };
  
   /**
     * @method
     * @summary Suma uno a "true" del objeto contador
     * @returns {number} Retorna el contador de "true" actualizado */
   Marker.prototype.plusTrue = function () {
       if (!this.valid) { return -1; }
       this.results["true"]++;
       this.intents++;
       return this.results["true"];
   };
  
   /**
     * @method
     * @summary Suma uno a "false" del objeto contador
     * @returns {number} Retorna el contador de "false" actualizado */
   Marker.prototype.plusFalse = function () {
       if (!this.valid) { return -1; }
       this.results["false"]++;
       this.intents++;
       return this.results["false"];
   };
   
   /**
     * @method
     * @summary Suma uno a "null" del objeto contador
     * @returns {number} Retorna el contador de "null" actualizado */
   Marker.prototype.plusNull = function () {
       if (!this.valid) { return -1; }
       this.results["null"]++;
       this.intents++;
       return this.results["null"];
   };
  
   /**
     * @method
     * @summary Suma uno a "blank" del objeto contador
     * @returns {number} Retorna el contador de "blank" actualizado */
   Marker.prototype.plusBlank = function () {
       if (!this.valid) { return -1; }
       this.results.blank++;
       this.intents++;
       return this.results.blank;
   };
   
   /**
     * @method
     * @summary Resetea al completo el objeto contador
     * @see #results */
   Marker.prototype.resetResults = function () {
       if (this.valid) {
           this.results = {"true": 0, "false": 0, "null": 0, "blank": 0};
       }
   };
   
   /**
     * @method
     * @summary Reinicializa los contadores
     * @see #intents
     * @see #results */
   Marker.prototype.reset = function () {
       if (this.valid) {
           this.intents = 0;
           this.resetResults();
       }
   };
   
   /**
     * @method
     * @summary Actualiza los contadores
     * @param {Object:Question} Objeto Pregunta (Question) */
   Marker.prototype.update = function (question) {
       var dataQuestions = this.parent.questions;
       if (this.valid && dataQuestions) {
           this.reset();
           for (var i = 0; i < dataQuestions.length; i++) {
               var q = dataQuestions[i];
               var intents = q.ok ? (q.intents - 1) : q.intents;
               if (q.ok) { this.plusTrue(); }
               if (q.marked) {
                   for (var j = 0; j < intents; j++) {
                       this.plusFalse();
                   }
               } else {
                   this.plusBlank();
               }
           }
           //this.conf.nA = this.parent.conf.nA;
           this.conf.nQ = this.parent.conf.nQ;
           this.conf.nA = (question && question.conf) ? question.conf.nA : this.parent.conf.nA;
       }
       this.elementScore.innerHTML = '<strong>TOTAL: </strong> <span class="marker-score">' +
                                     this.calcScore() + "</span>";
       if (this.calcScore() >= (POINTS_TOP / 2)) {
           this.elementScore.getElementsByClassName("marker-score")[0].style.color = "darkGreen";
       } else {
           this.elementScore.getElementsByClassName("marker-score")[0].style.color = "red";
       }
       this.elementPointsTrue.innerHTML = "<strong>Points:</strong> (True:" +
                                           this.filterDigits(this.scoreSuccesses() * POINTS_TOP) + ") ";
       this.elementPointsFalse.innerHTML = "(False:" + this.filterDigits(this.scoreFailures() * POINTS_TOP) + ")";
       this.elementTrue.innerHTML = this.results["true"];
       this.elementFalse.innerHTML = this.results["false"];
       this.elementBlank.innerHTML = this.results.blank;
       this.elementAreaEditSave.innerHTML = this.root.toJSON();
       //alert(this.intents);
   };
   
   //SCORE
   /** @method
     * @summary Calcula la solución para la puntuación total
     * @returns {number} puntución actualizada */
   Marker.prototype.calcScore = function () {
       this.score = this.filterDigits(POINTS_TOP * (this.scoreSuccesses() - this.scoreFailures()));
       return this.score;
   };
   
   /** @method
     * @summary Calcula el coeficiente de aciertos
     * @description Está basada en el número total de Preguntas.
     * Este coeficiente se aplicará como multiplicando a las Respuestas Acertadas
     * @returns {number} el coeficiente de aciertos */
   Marker.prototype.coefficientSuccesses = function () {
       return this.filterDigits(1 / this.conf.nQ);
   };
   /** @method
     * @summary Calcula el coeficiente de fallos
     * @description Está basado en el número total de Preguntas y Respuestas.
     * Este coeficiente se aplicará como multiplicando a las Respuestas Fallidas
     * @returns {number} coeficiente de fallos */
   Marker.prototype.coefficientFailures = function () {
       return this.filterDigits(1 / ((this.conf.nA - 1) * this.conf.nQ));
   };
   /** @method
     * @summary Calcula la puntuación para las Respuestas Acertadas
     * @returns {number} puntuación de aciertos */
   Marker.prototype.scoreSuccesses = function () {
       return this.filterDigits(this.results["true"] * this.coefficientSuccesses());
   };
   /** @method
     * @summary Calcula la puntuación para las Respuestas Fallidas
     * @returns {number} puntuación de fallos */
   Marker.prototype.scoreFailures = function () {
       return this.filterDigits(this.results["false"] * this.coefficientFailures());
   };
   //END SCORE
   
   /** @summary Filtra un número según los parámetros aportados.
     * @description Se utiliza par filtrar a las propiedades de configuración: 'precision' and 'digits number' */
   Marker.prototype.filterDigits = function (floatNumber, precision, digits, sign) {
       precision = precision || this.conf.precision;
       digits = digits || this.conf.digits;
       if (this.utils) {
           if (this.utils.toDecimals) { floatNumber = this.utils.toDecimals(floatNumber, precision); }
           if (this.utils.toDigits) { floatNumber = this.utils.toDigits(floatNumber, digits, sign); }
       }
       return floatNumber;
   };
  
   /** @method
     * @summary Crea el HTML-UI
     * @description Crea el HTML para la UI para este Marcador y lo retorna
     * as HTMLElement (HTMLUlElement)
     * @return {Object:HTMLElement}*/
   Marker.prototype.toHtml = function () {
       var self = this;
       /** @type {HTMLElement} */
       var table = document.createElement("table");
       if (this.element && this.element.innerHTML) {
          this.element.innerHTML = "";
           table = this.element;
       }
       table.setAttribute("class", "marker testron-marker");
       table.setAttribute("id", this.id);
       if (this.valid) {
           var caption = document.createElement("caption");
           caption.innerHTML = "Marcador (" + this.num + ")";
           table.appendChild(caption);
           this.sanitizeResults();
           var thead = document.createElement("thead");
               var trh1 = document.createElement("tr");
                   var th1 = document.createElement("th");
                   th1.innerHTML = "";
                   trh1.appendChild(th1);
                   var th2 = document.createElement("th");
                   th2.innerHTML = "Valor";
                   trh1.appendChild(th2);
               thead.appendChild(trh1);
           table.appendChild(thead);
           var tfoot = document.createElement("tfoot");
               var trf1 = document.createElement("tr");
                   var tdf1 = document.createElement("td");
                   tdf1.setAttribute("class", "marker-total");
                   tdf1.setAttribute("colspan", 2);
                   tdf1.innerHTML = '<strong>TOTAL: </strong> <span class="marker-score">' +
                                     this.calcScore() + "</span>";
                   this.elementScore = tdf1;   //SCORE
                   trf1.appendChild(tdf1);
               tfoot.appendChild(trf1);
               var trf2 = document.createElement("tr");
                   trf2.style.fontSize = "smaller";
                   var tdf2 = document.createElement("td");
                   tdf2.innerHTML = "<strong>Puntos:</strong> (Aciertos:" +
                                    this.filterDigits(this.scoreSuccesses() * POINTS_TOP) + ") ";
                   this.elementPointsTrue = tdf2;   //POINTS TRUE
                   trf2.appendChild(tdf2);
                   var tdf3 = document.createElement("td");
                   tdf3.innerHTML = "(Fallos:" + this.filterDigits(this.scoreFailures() * POINTS_TOP) + ") ";
                   this.elementPointsFalse = tdf3;   //POINTS FALSE
                   trf2.appendChild(tdf3);
               tfoot.appendChild(trf2);
               var trf3 = document.createElement("tr");
                   trf3.style.fontSize = "smaller";
                   var tdf4 = document.createElement("td");
                       var i1 = document.createElement("i");
                       i1.setAttribute("class", "btn btn-16");
                       i1.innerHTML = '<image src="' + this.root.utils.icos.PENCIL +
                                       '" title="editar/importar ... modifica o pega otro texto"/>';
                       this.elementBtnEdit = i1;   //EDIT BUTTON
                       this.elementBtnEdit.disabled = !document.queryCommandSupported('copy');
                       this.utils.addEvent(i1, "click", function testronEditListener (){
                           self.utils.editListener(areaEditSave);
                       });
                       tdf4.appendChild(i1);
                       var i2 = document.createElement("i");
                       i2.setAttribute("class", "btn btn-16");
                       i2.innerHTML = '<image src="' + this.root.utils.icos.DOWNLOAD +
                                      '" title="ver guardar/descargar ... click en el enlace download"/>';
                       this.elementBtnDownload = i2;   //DOWNLOAD BUTTON
                       this.utils.addEvent(i2, "click", function testronSaveListener (){
                           self.utils.saveListener(areaEditSave);
                       });
                       tdf4.appendChild(i2);
                       var i3 = document.createElement("i");
                       i3.setAttribute("class", "btn btn-16");
                       i3.innerHTML = '<image src="' + this.root.utils.icos.UNDO +
                                      '" title="reinicializa los tests" />';
                       this.elementBtnReset = i3;   //RESET BUTTON
                       this.utils.addEvent(i3, "click", function testronResetListener (){
                           //self.root.parseTestrons(JSON.parse(areaEditSave.value));
                           var numTests = self.utils.resetListener(areaEditSave);
                           if(numTests.charAt && (numTests.substr(0,5) === "ERROR")) { //ERROR string
                               //alert(self.parent.toJSON());
                               areaEditSave.innerHTML = self.parent.toJSON();
                               numTests = self.utils.resetListener(areaEditSave);
                               if(numTests.charAt && (numTests.substr(0,5) === "ERROR")) { //ERROR string
                                   alert("ERROR parseando JSON");
                               }
                           }
                       });
                       tdf4.appendChild(i3);
                   trf3.appendChild(tdf4);
               tfoot.appendChild(trf3);
               var trf4 = document.createElement("tr");    //TEXTAREA IMPORT/SAVE
                   trf4.style.fontSize = "larger";
                   var tdf6 = document.createElement("td");
                   tdf6.setAttribute("colspan", "2");
                   tdf6.setAttribute("class", "hidden");
                   tdf6.setAttribute("id", "testron-area-celd");
                   tdf6.style.textAling = "center";
                   tdf6.style.display = "none";
                   var areaEditSave = document.createElement("textarea");
                   areaEditSave.setAttribute("rows", "5");
                   areaEditSave.style.width = "98%";
                   areaEditSave.style.fontSize = "smaller";
                   var valueJSON = this.root.toJSON().toString();
                   areaEditSave.innerHTML = ((valueJSON > 30) ? valueJSON : self.parent.toJSON());
                   this.elementAreaEditSave = areaEditSave;   //POINTS TRUE
                   this.utils.addEvent(this.elementAreaEditSave, "change", function importArea() {
                      self.root.parseTestrons(JSON.parse(areaEditSave.value));
                   });
                   tdf6.appendChild(areaEditSave);
                   trf4.appendChild(tdf6);
               tfoot.appendChild(trf4);
           table.appendChild(tfoot);
           var tbody = document.createElement("tbody");
               var tr1 = document.createElement("tr");
                   var td11 = document.createElement("td");
                   td11.innerHTML = "Aciertos";
                   tr1.appendChild(td11);
                   var td12 = document.createElement("td");
                   td12.setAttribute("class", "marker-values");
                   td12.innerHTML = this.results["true"];
                   this.elementTrue = td12;    //TRUE
                   tr1.appendChild(td12);
               tbody.appendChild(tr1);
               var tr2 = document.createElement("tr");
                   var td21 = document.createElement("td");
                   td21.innerHTML = "Fallos";
                   tr2.appendChild(td21);
                   var td22 = document.createElement("td");
                   td22.setAttribute("class", "marker-values");
                   td22.innerHTML = this.results["false"];
                   this.elementFalse = td22;   //FALSE
                   tr2.appendChild(td22);
               tbody.appendChild(tr2);
               var tr3 = document.createElement("tr");
                   var td31 = document.createElement("td");
                   td31.innerHTML = "Blanco";
                   tr3.appendChild(td31);
                   var td32 = document.createElement("td");
                   td32.setAttribute("class", "marker-values");
                   td32.innerHTML = this.results["blank"];
                   this.elementBlank = td32;   //BLANK
                   tr3.appendChild(td32);
               tbody.appendChild(tr3);
           table.appendChild(tbody);
           //if (this.element) { this.element.parentNode.removeChild(this.element); }
           this.element = table;
           if (this.container) {
               this.container.appendChild(this.element);
           } else {
               this.root.utils.setTimerContainer(this); //TIMER TO DETECT CONTAINER
           }
       } else {
           table.style.background = "#666666";
       }
       
       return table;
   };
   
   /*//EVENTS
   /** @event
     * @summary Emit the Click event for comprobations in this Marker * /
   Marker.prototype.emitClick = function (question) {
       /*this.intents++;
       //alert("Marker:: with Answer:: " + answer.name);
       if (this.verify(answer.position)) {
           answer.toOK();
           this.toOK();
       } else {
           answer.toFail();
           this.toFail();
       }* /
       this.update(question);
   };
   
   /** @event
     * @summary Emit the Next event for pass to forward Marker * /
   Marker.prototype.emitNext = function () {
       //alert("next Marker");
       this.parent.emitNext(this); //propagate to parent
   };
  */
   t.prototype.Marker = Marker;

})
(testron.Test || (testron.Test = function () {}));
//END MODULE MARKER

//MODULE QUESTION
/** @lends testron.Test
 * @module Question */
(function (t) {
   "use strict";
  
   //VARIABLES INTERNAS PRIVADAS
   /** Contador estático */
   var counter = 0;
   
   //FUNCIONES INTERNAS PRIVADAS
   /** @class Una clase para construir Preguntas para Tests congigurable y dinamicamente 
     * @constructor
     * @memberof module:testron#Test
     * @summary Preguntas para test
     * @description Constructor para la creación de objetos "Question". Admite un parámetro con
     * un objeto de configuración con unas propiedades o atributos determinados.
     * @param parent {Object} Objeto "Test"
     * @param conf {Object} Objeto de configuración (ver {@link #conf conf})
     * @see #conf */
   function Question(parent, conf) {
     /** @summary objeto ancestro "testron" {namespace}
       * @type {namespaces:testron} */
     this.root = parent.root; //"testron" {namespace}
     /** @summary Id Exclusivo (+ o -)
       * @type {string} */
     this.id;
     if (this.root.utils && this.root.utils.generateId) {
         this.id = this.root.utils.generateId();
     }
     this.id = (parent ? (parent.id + "-") : "") + this.id;
     /** @summary Número de esta Pregunta. 
       * @description Esto no es igual a 'this.id' (desde 0 a +Infinity)
       * @type {number} */
     this.num = counter++;
     /** @summary objeto padre "Test"
       * @type {Object:Test} */
     this.parent = parent;
     /** @summary array de objetos Respuesta (Answer)
       * @type {Array:Answer} */
     this.answers = [];
     /** @summary Posición en el array padre 'questions'
       * @type {number} */
     this.position = 0;
     /** @summary ¿ Está esta pregunta solucionada ?
       * @type {boolean} */
     this.ok = false;
     /** @summary elemento DOM propio
       * @type {Object:HTMLElement} */
     this.element = null;
     /** @summary Maniene un registro de marcado para esta Pregunta
       * @type {boolean} */
     this.marked = false;
     /** @summary Cuenta los intentos para esta Pregunta
       * @type {number} */
     this.intents = 0;
     /** @summary ¿ es válida esta Pregunta ?
       * @type {boolean} */
     this.valid = true;
     /** @summary Opciones de configuración
       * @description un objeto Javascript con la siguiente estructura:
       * <pre>
       * {
       *    num: 2,
       *    nA: 4,
       *    solution: 0,
       *    stopOnSuccess : false,
       *    charset: "utf-8",
       *    txt: "Question 2 ?"
       * }
       * </pre>
       * @type {Object} */
     this.conf = this.filterConf(conf || this.parent.conf);
     if (conf.question) { //objeto JSON
         var str = this.parseQuestion(conf);
         //alert(str);
     }
     /** @summary clon de {@link conf.solution}
       * @type {number} */
     this.solution = this.conf.solution;
     /** @summary clone de {@link conf.stopOnSuccess}
       * @description False = Sólo un click, True = clicks hasta acertar
       * @type {boolean} */
     this.stopOnSuccess = this.conf.stopOnSuccess;
     
     this.update_nA();
   }
  
   /**
     * @method
     * @summary Obtener el propio auto-contador */
   Question.prototype.getCounter = function () { return counter; };
  
   /**
     * @method
     * @summary Filtra las opciones de configuración
     * @description Las opciones de configuración se tomarán del padre ("Test"),
     * si no existen.
     * @param conf {Object} Objeto de configuración
     * @return {Object} Las opciones de configuración saneadas
     * @see #conf */
   Question.prototype.filterConf = function (conf) {
       return {
           /** Número de esta Pregunta. Esto no es igual a this.id */
           num: conf.num,
           /** Número de Respuestas */
           nA: conf.nA || this.parent.conf.nA || 4,
           solution: conf.solution || 0,
           /** Cuándo parar? true = 'Parar en acierto', false = 'Parar en cualquier click' */
           stopOnSuccess : (conf.stopOnSuccess !== undefined) ? conf.stopOnSuccess :
                           ((this.parent.conf.stopOnSuccess !== undefined) ? this.parent.conf.stopOnSuccess : false),
           charset: conf.charset || this.parent.conf.charset || "utf-8",
           txt: conf.txt || "?"
       };
   };
   
   /** @method
     * @summary Suprimir las respuestas inválidas */
   Question.prototype.sanitizeAnswers = function () {
       var answers2 = [];
       for (var i = 0; i < this.answers.length; i++) {
           if (this.answers[i].valid) { answers2.push(this.answers[i]); }
       }
       this.answers = answers2;
   };
  
   /**
     * @method
     * @summary Añadir un objeto Respuesta (Answer) a esta pregunta
     * @param answer {Object:testron.Test.Question.Answer} objeto Respuesta ("Answer")
     * @returns {Object:Answer} Retorna el mismo parámetro de entrada */
   Question.prototype.addAnswer = function (answer) {
       if (!answer || !answer.conf) { return answer; }
       var finded = false, i = 0;
       this.sanitizeAnswers();
       for (i = 0; i < this.answers.length; i++) {
           var a = this.answers[i];
           if (a.conf.name === answer.conf.name) { //Already exists
               a = answer;
               finded = true;
           }
       }
       if (! finded) {
           answer.position = this.answers.length;
           this.answers.push(answer);
       }
       this.update_nA();
       return answer;
   };
  
   /** @method
     * @summary Crea y añade un objeto Respuesta (Answer) a este Test
     * @param conf {Object} Opciones de configuración [para los Objetos Respuesta (Answer)]
     * @returns {Object:Answer} Retorna el nuevo objeto Respuesta (Answer) creado */
   Question.prototype.createAnswer = function (conf) {
       return this.addAnswer(new this.Answer(this, conf));
   };
   
   /** @method
     * @summary Borrar todas las respuestas para esta Pregunta de Test */
   Question.prototype.removeAnswers = function () {
       for (var i = 0; i < this.answers.length; i++) {
           this.answers[i].remove();
       }
       this.answers = [];
   };
   
   /** @method
     * @summary Borrar esta Pregunta de Test (y sus respuestas hijas) */
   Question.prototype.remove = function () {
       this.removeAnswers();
       this.root = this.parent = this.conf = this.element = null; //NULLIFY
       this.valid = false;
       //...MÁS OPERACIONES PARA LIBERAR MEMORIA
   };
   
   /** @summary Actualiza el número de respuestas */
   Question.prototype.update_nA = function () {
       //UPDATE nA
       this.conf.nA = this.answers.length;
   };
   
   /** @summary Esto verifica la solución correcta para esta Pregunta
     * @returns {boolean} True / False */
   Question.prototype.verify = function (position) {
       //alert(position + " === " + this.solution);
       return ((position + 1) === this.solution);
   };
   
   /** @method
     * @summary Esto cambia el estilo a "ACIERTO" para el elemento (DOMElement) para esta Pregunta. 
     * También dispara el evento 'emitNext' */
   Question.prototype.toOK = function () {
       if (this.valid && this.element) {
           this.element.style.backgroundColor = "aquamarine";
           this.ok = true;
           this.parent.emitMarker(this);
       }
       this.emitNext();
   };
   
   /** @method
     * @summary Cambia el estilo a "FALLO" para el elemento (DOMElement) para esta Pregunta */
   Question.prototype.toFail = function () {
       if (this.valid && this.element) {
           this.element.style.backgroundColor = "maroon";
           this.parent.emitMarker(this);
       }
   };
   
   /** @summary Crea preguntas desde el parámetro 'questions'.
     * @description El parámetro puede ser un objeto Javascript o una cadena JSON con la siguiente estructura:
     * <pre>
     * questions: [
     *   {
     *     conf: {..., txt: "Pregunta 1 ??"},
     *     answers: [ ... ] // see Question.parseAnswers(...)
     *   },
     *   { ... },
     *   ...
     * ]
     * </pre>
     * @param test {Object|string} un objeto Javascript o una cadena JSON
     * @return {string} una cadena "DEBUG" con información
     */
   Question.prototype.parseQuestion = function (question) {
       var str = ["Analizing Question.parseQuestion() ... "];
       if (question && question.replace) { //Comprobar si es una cadena
           question = JSON.parse(question);
           str.push("string JSON detected !");
       }
       if (!question) {
           str.push("ERROR: 'question' object not exists!");
           return str.join("\n");
       }
       if (question.question) { question = question.question; }
       if (!question.conf) { str.push("WARNING: 'question.conf' object not exists!"); }
       this.conf = this.filterConf(question.conf);

       //RESPUESTAS
       var answers = question.answers;
       if (!answers) {
           str.push("ERROR/WARNING: 'anwers' array in this question (" + this.id + ") not exists!");
           return str.join("\n");
       }
       for (var i = 0; i < answers.length; i++) {
           var a = answers[i];
           if (!a) {
               str.push("ERROR/WARNING: 'anwers[" + i + "]' object in this question (" + this.id + ") not exists!");
               continue;
           }
           this.createAnswer({answer: a});
       }
       str.push("... question FINISH");
       return str.join("\n");
   };
  
   /** @method
     * @summary Crea el HTML-UI para esta Pregunat y lo retorna
     * como HTMLElement (HTMLUlElement)
     * @return {Object:HTMLElement} */
   Question.prototype.toHtml = function () {
       /** @type {HTMLElement} */
       var ul = document.createElement("ul");
       ul.setAttribute("class", "question");
       if (this.valid) {
           var caption = document.createElement("caption");
           caption.innerHTML = '<span class="caption">(' + this.conf.num + ')</span> &emsp; ' + this.conf.txt;
           ul.appendChild(caption);
           this.sanitizeAnswers();
           for (var i = 0; i < this.answers.length; i++) {
               ul.appendChild(this.answers[i].toHtml());
           }
           this.element = ul;
       } else {
           ul.style.background = "#666666";
       }
       return ul;
   };
   
   /** @summary Convierte este elemento a JSON 
     * @return {string} una cadena JSON que representa a este objeto Pregunta (Question) */
   Question.prototype.toJSON = function () {
       var conf = {
           num: this.conf.num,
           nA: this.conf.nA,
           solution: this.conf.solution,
           //stopOnSuccess : this.conf.stopOnSuccess,
           charset: this.conf.charset,
           txt: this.conf.txt
       };
       var str = [];
       for (var i = 0; i < this.answers.length; i++) {
           var answer = this.answers[i];
           str.push(answer.toJSON());
       }
       return ('{"conf": ' + JSON.stringify(conf) + ', "answers": [ ' + str.join(", ") + ' ] }');
   };
   
   //EMITERs EVENTOS
   /** @emitter
     * @summary Emite el evento 'Click' para comprobaciones en esta Pregunta */
   Question.prototype.emitClick = function (answer) {
       if (!this.marked || (this.stopOnSuccess ? !this.ok : false)) {
           this.intents++;
           //alert("Question:: with Answer:: " + answer.name);
           if (this.verify(answer.position)) {
               answer.toOK();
               this.toOK();
               this.root.onOk(null, answer);
           } else {
               answer.toFail();
               this.toFail();
               this.root.onFail(null, answer);
           }
           this.marked = true;
           //this.parent.emitMarker(this);
           this.root.onClick(null, answer);
       }
   };
   
   /** @emitter
     * @summary Emite el evento 'Next' para pasar a la siguiente Pregunta */
   Question.prototype.emitNext = function () {
       this.update_nA();
       //alert("next Question");
       this.parent.emitNext(this); //propagate to parent
       //this.root.onNext(null, this);
   };
  
   t.prototype.Question = Question;

})
(testron.Test || (testron.Test = function () {}));
//END MODULE QUESTION

//MODULE ANSWER
/** @lends testron.Test.Question
 * @module Answer */
(function (q) {
   "use strict";
  
   //VARIABLES INTERNAS PRIVADAS
   /** Contador estático */
   var counter = 0;
   
   //FUNCIONES INTERNAS PRIVADAS
   /** @class Una clase para construir Respuestas (Answers) para Preguntas (Questions) de los Tests,
     * configurable y dinamicamente
     * @constructor
     * @memberof module:testron#Question#Test
     * @summary Respuesta para alguna Pregunta del Test
     * @description Constructor para la creación de objetos Respuesta ("Answer"). Admite un parámetro 
     * con un objeto de configuración con unas propiedades o atributos determinados.
     * @param parent {Object} Objeto Pregunta ("Question")
     * @param conf {Object} Objeto de configuración (ver {@link #conf conf})
     * @see #conf */
   function Answer(parent, conf) {
     /** @summary objeto ancestro "testron" {namespace}
       * @type {namespace:testron} */
     this.root = parent.root; //"testron" {namespace}
     /** @summary Id Exclusivo (+ o -)
       * @type {string} */
     this.id;
     if (this.root.utils && this.root.utils.generateId) {
         this.id = this.root.utils.generateId(); //Exclusive id (+ or -)
     }
     this.id = (parent ? (parent.id + "-") : "") + this.id;
     /** @summary Número de esta respuesta. 
       * @description Esto no es igual a 'this.id' (desde 0 a +Infinity)
       * @type {number} */
     this.num = counter++; //from 0 to infinity
     /** @summary objeto padre "Question"
       * @type {Object:Question} */
     this.parent = parent;
     /** @summary elemento DOM propio
       * @type {Object:HTMLElement} */
     this.element = null;
     /** @summary Mantiene un registro de marcado para esta respuesta
       * @type {boolean} */
     this.checked = false;
     /** @summary ¿ es válida esta Respuesta ?
       * @type {boolean} */
     this.valid = true;
     /** @summary Opciones de configuración
       * @description un objeto Javascript con la siguiente estructura:
       * <pre>
       * {
       *    num: 1,
       *    name: "A",
       *    charset: "utf-8",
       *   txt: "Respuesta 1"
       * }
       * </pre>
       * @type {Object} */
     this.conf = this.filterConf(conf || this.parent.conf);
     if (conf.answer) { //objeto JSON
         var str = this.parseAnswer(conf);
         //alert(str);
     }
     /** @summary clon de conf.name
       * @description Su nombre ('A', '1', 'a', 'IV', 'pepito', ...)
       * @type {string} */
     this.name = this.conf.name;
   }
  
   /** @method
     * @summary Obtiene el propio auto-contador */
   Answer.prototype.getCounter = function () { return counter; };
  
   /** @method
     * @summary Filtra las opciones de configuración
     * @description Las opciones de configuración se tomarán del padre 
     * ("Question"), si no existen
     * @param conf {Object} Objeto de configuración
     * @see #conf*/
   Answer.prototype.filterConf = function (conf) {
       return {
           /** Número de esta Respuesta. Esto no es igua a this.id */
           num: conf.num,
           name: conf.name,
           charset: conf.charset || this.parent.conf.charset || "utf-8",
           txt: conf.txt || ""
       };
   };
   
   /** @method
     * @summary Borrar esta Respuesta */
   Answer.prototype.remove = function () {
       this.root = this.parent = this.conf = this.element = null; //NULLIFY
       this.valid = false;
       //...MÁS OPERACIONES PARA LIBERAR MEMORIA
   };
   
   /** @method
     * @summary Cambia el estilo a OK para el elemento (DOMElement) de esta Respuesta */
   Answer.prototype.toOK = function () {
       if (this.valid && this.element) {
           this.element.style.backgroundColor = "lightGreen";
           //this.root.onOk(null, this);
       }
   };
   
   /** @method
     * @summary Cambia el estilo a FALLO para el elemento (DOMElement) de esta Respuesta */
   Answer.prototype.toFail = function () {
       if (this.valid && this.element) {
           this.element.style.backgroundColor = "coral";
           //this.root.onFail(null, this);
       }
   };
   
   /** @summary Crea respuestas desde el parámetro 'answers'.
     * @description El parámetro puede ser un objeto Javascript o una cadena JSON con la siguiente estructura:
     * <pre>
     * answers: [
     *       { name: "A", txt: "Respuesta 1"}, {...}, ...
     * ]
     * </pre>
      * @param test {Object|string} un objeto Javascript o una cadena JSON
      * @return {string} una cadena "DEBUG" con información
      */
   Answer.prototype.parseAnswer = function (answer) {
       var str = ["Analizing answer.parseAnswers() ... "];
       if (answer && answer.replace) { //Comprobar si es una cadena
           answer = JSON.parse(answer);
           str.push("string JSON detected !");
       }
       if (!answer) {
           str.push("ERROR: 'answer' object not exists!");
           return str.join("\n");
       }
       if (answer.answer) { answer = answer.answer; }
       //if (!answer.conf) { str.push("WARNING: 'answer.conf' object not exists!"); }
       this.conf = this.filterConf(answer);
       str.push("... answers FINISH");
       return str.join("\n");
   };
   
   /** @method
     * @summary Crea el HTML-UI para esta Respuesta y lo retorna
     * como HTMLElement (HTMLLiElement) */
   Answer.prototype.toHtml = function () {
       var self = this;
       /** @type {HTMLElement} */
       var li = document.createElement("li");
       li.setAttribute("class", "answer");
       if (this.valid) {
           li.innerHTML = '<span class="caption">' + this.conf.name + ')</span>&emsp;' + this.conf.txt;
           li.addEventListener("click", function () {
               self.emitClick();
           });
           this.element = li;
       } else {
           li.style.backgroundColor = "#666666";
       }
       return li;
   };
   
   /** @summary Convierte este elemento a JSON 
     * @return {string} una cadena JSON que representa a este objeto Respuesta (Answer) */
   Answer.prototype.toJSON = function () {
       return JSON.stringify({
           num: this.conf.num,
           name: this.name,
           charset: this.conf.charset,
           txt: this.conf.txt
       });
   };
   
   //EVENTS
   /** @emitter
     * @summary Emite el evento 'Click' para comprobaciones en esta Respuesta */
   Answer.prototype.emitClick = function () {
       if (this.valid && !this.checked) {
           this.checked = true;
           this.parent.emitClick(this); //propagar
       }
   };
  
   q.prototype.Answer = Answer;

})
(testron.Test.prototype.Question ||
 (testron.Test.prototype.Question = function () {})
);
//END MODULE ANSWER