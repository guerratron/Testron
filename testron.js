//NAMESPACE TESTRON
/** @namespace testron
  * @summary The namespace for all testrons objects
  * @description This 'namespace' is the starting point for building tests of 'testrons' type. 
  * It contains the methods and objects necessary for even build all full UI.
  * @example <caption>To create complete Test UI:</caption>
  * var tests = testron.parseTestrons(
  *                                   objJS, 
  *                                   {container: 'divUI', 
  *                                    markerContainer: 'divMarker'
  *                                   });
  *
  * @example <caption>Using the events:</caption>
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
   
    //INNER PRIVATES VARS
    /** @private
      * @memberof testron
      * @summary Static Alphanumeric variable for "id" generated */
    var alpha = "abcdefghijklmnopqrstuvwxyz";
    /** @private
      * @memberof testron 
      * @summary Static pref for Base64 images with 'monocrome GIF' format */
    var prefImg64GIF = "data:image/gif;base64,R0lGODlhEAAQAIABAAAAAP///yH5BAEKAAEALAAAAAAQABAAAAI";
    /** @private
      * @memberof testron 
      * @summary testrons array */
    var tests = [];
    //LISTENERS
    /** @private
      * @memberof testron
      * @summary Event Listener for successed Answer. This must be a function with two parameters: Answer object and Marker object */
    var successAnswerListener = null;
    /** @private
      * @memberof testron
      * @summary Event Listener for failed Answer. This must be a function with two parameters: Answer object and Marker object */
    var failAnswerListener = null;
    /** @private
      * @memberof testron
      * @summary Event Listener for clicks Answer. This must be a function with two parameters: Answer object and Marker object */
    var clickAnswerListener = null;
    /** @private
      * @memberof testron
      * @summary Event to Listener from next Question. The listener passed must be a function with two parameters: Question object and Marker object */
    var nextQuestionListener = null;
    /** @private
      * @memberof testron
      * @summary Event to Listener from update Marker. The listener passed must be a function with one parameter: Marker object */
    var updateMarkerListener = null;
    /** @private
      * @memberof testron
      * @summary Event to Listener from finished Test. The listener passed must be a function with one parameter: Test object */
    var finishedListener = null;
    
    //INNER PRIVATES FUNCTIONS
    /** @private
      * @summary Getter method 
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
    
    /** Get Randomized Alphanumeric Id. It is based on "alpha" static variable */
    function generateId() {
        var temp = alpha[parseInt(Math.random() * alpha.length, 10)].toLowerCase() +
                 alpha[parseInt(Math.random() * alpha.length, 10)].toUpperCase();
        return temp + (Math.random() * 1000) + alpha[parseInt(Math.random() * alpha.length, 10)].toUpperCase();
    }
    
    /** @memberof module:utils
      * @summary Set the accuracy of number depending on parameter.
      * @description This method processes the number as strings, and returns a number
      * [es-ES] 
      * <p>Retorna un número 'n' flotante redondeado al número de decimales indicado en 'precision'.
      * Método para formatear números en coma flotante hasta X decimales (puede contener menos)</p>
      * @param floatNumber {number} The number to which adjust its precision
      * @param precision {number} The precision for show digits
      * @returns {number}
      * @see #toDecimals(number, number) */
    function toPrecision(floatNumber, precision) {
        //return parseFloat((Math.round(floatNumber * Math.pow(10, decimals)) / Math.pow(10, decimals)) +"" );
        return Math.round(floatNumber * Math.pow(10, precision)) / Math.pow(10, precision);
    }
    /** @summary Set the accuracy of number depending on parameter.
      * @description This method processes the number as strings, and returns a string
      * <p>[es-ES] 
      * Retorna un número 'n' flotante redondeado al número de decimales indicado en 'precision'.
      * Método para formatear números en coma flotante hasta X decimales.
      * Retorna una cadena, no un número.</p>
      * @param floatNumber {number} The number to which adjust its decimals
      * @param precision {number} The precision for show decimals
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
    
    /** @summary Fix to max digits
      * @description It returns a number which is fixed to max number of digits, adding leading zeros.
      * This don't truncate the number, if it is too long don't anything.
      * @param num {number} The number to treat
      * @param digits {number} The maximum total digits for the number
      * @param sign {boolean} If you want to count the sign as a digit
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
    
    /** @summary Fix to max digits
      * @description It returns a number which is fixed to max number of digits, adding leading zeros.
      * This don't truncate the number, if it is too long don't anything.
      * @param num {number} The number to treat
      * @param digits {number} The maximum total digits for the number
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
      * @summary SELF-SUFFICIENT and complete Method. If the containers are contributed, it generates even the UI
      * @description Create Test from 'testrons' parameter.
      * The parameter can be a Javascript object or a JSON string object with follow structure:
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
      * The second parameter is Optional, it represents any extra configuration variable, by example
      * the containers for UI at the way: <code>{container: "idElement1", markerContainer: "idElement2"}</code>.
      * @returns {Array} An Testrons objects array
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
    
    /** @summary Base64 icons to attach the 'src' atributes images, the 'href' attribute in 'a' labels, 
      * or for use in CSS in the 'background' as 'url (...)'
      * @returns {Object} */
    function icos() {
        return {
          /*"PREF":           prefImg64GIF, /*Prefijo GIF monocromo. No utilizar externamente */
          /** Image representing the version number of these icons. (1) */
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
    
    /** EVENTS COMPATIBILIZER
     * @param elem {Object:HTMLElement} is the element that you want to set the listener.
     * @param enventType {string} The event name (without 'on' prefix)
     * @param handler {Function|lambda} the function to run
     * @returns {Object} It returns the 'util' object to allow 'chaining' */
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
    
    /** @summary Method to detect the container parent element through timers */
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
    
    //EVENTS INNER FUNCTIONS
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
    
    /** @summary Utility for merge two configuration objects */
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
      * @summary obtains this identificator
      * @type {string} */
    t.id = generateId();
    /** @method
      * @memberof testron 
      * @summary Getter method
      * @return {Array:tests} */
    t.getTests = getTests;
    /** @method
      * @memberof testron 
      * @summary Add a Test to array */
    t.addTest = addTest;
    /** @method
      * @memberof testron 
      * @summary Remove a Test from array, from its index
      * @return {Array} the updated tests array */
    t.removeTestIndex = removeTestIndex;
    /** @method
      * @memberof testron 
      * @summary Remove a Test from array
      * @return {Array} the updated tests array */
    t.removeTest = removeTest;
    /** @method
      * @memberof testron 
      * @summary Remove ALL Test from array */
    t.resetTests = resetTests;
    /** @memberof testron
      * @summary The utils object
      * @property {string} generateId obtains a unique identificator
      * @property {Function} Util.toPrecision - Obtains a number which is fixed to exact precision
      * @property {Function} Util.toDecimals - Obtains a number which is fixed to concrete decimals
      * @property {Function} Util.toDigits - Obtains a number which is fixed to exact digits
      * @property {Object} Util.icos - Is a object which contains icons on base64 format
      * @property {Function} Util.addEvent - Cross-browser Method for adding events
      * @property {Function} Util.editListener - Listener for shooting of change events (editArea).
      * @property {Function} Util.saveListener - Listener for shooting of save events (button).
      * @property {Function} Util.copyClipboardListener - Listener for shooting of copy events (clipboard).
      * @property {Function} Util.resetListener - reset the listener for this object. (non-implementable currently)
      * @property {Function} Util.setTimerContainer - set a timer for this container element
      * @type {Object} */
    t.utils = {
        generateId: generateId,
        toPrecision: toPrecision,
        toDecimals: toDecimals,
        toDigits: toDigits,
        icos: icos(), //returns a literal object
        addEvent: addEvent,
        editListener: editListener,
        saveListener: saveListener,
        copyClipboardListener: copyClipboardListener,
        resetListener: resetListener,
        setTimerContainer: setTimerContainer
    };
    /** @method
      * @memberof testron 
      * @summary Parse a JSON string which represents the complete testron suite
      * @return {Array} the updated tests array */
    t.parseTestrons = parseTestrons;
    /** @method
      * @memberof testron 
      * @summary Filter the configuration object to sanitize
      * @return {Object} the sanitized configuration object */
    t.filterContainer = filterContainer;
    /** @method
      * @memberof testron 
      * @summary Obtain a JSON string which represents the complete testron suite
      * @return {string} JSON string */
    t.toJSON = toJSON;
    /** @method
      * @memberof testron 
      * @summary Method to merge the properties from two objects (configuration)
      * @return {Object} the merged object */
    t.merge = merge;
    //EVENTS HANDLERS
    /** @event
      * @memberof testron
      * @summary Event to Listener from <b>successed Answer</b>. 
      * @description The listener passed must be a function with two parameters: Answer object and Marker object */
    t.onOk = onOk;
    /** @event
      * @memberof testron
      * @summary Event to Listener from <b>failed Answer</b>. 
      * @description The listener passed must be a function with two parameters: Answer object and Marker object */
    t.onFail = onFail;
    /** @event
      * @memberof testron
      * @summary Event to Listener from <b>clicks Answer</b>. 
      * @description The listener passed must be a function with two parameters: Answer object and Marker object */
    t.onClick = onClick;
    /** @event
      * @memberof testron
      * @summary Event to Listener from <b>next Question</b>. 
      * @description The listener passed must be a function with two parameters: Question object and Marker object */
    t.onNext = onNext;
    /** @event
      * @memberof testron
      * @summary Event to Listener from <b>update Marker</b>. 
      * @description The listener passed must be a function with one parameter: Marker object */
    t.onMarker = onMarker;
    /** @event
      * @memberof testron
      * @summary Event to Listener from <b>finished Test</b>. 
      * @description The listener passed must be a function with one parameter: Test object */
    t.onFinished = onFinished;
})
(testron || (testron = {}));
//END MODULE TESTRON & UTILS

//MODULE TEST
/**  @lends testron
  * @module Test
  * @summary Module for Test objects. Contain the Class and constructor. */
(function (t) {
    "use strict";
   
    //INNER PRIVATES VARS
    /** Static counter */
    var counter = 0;
   
    /** @class A class to build Questions Tests Configurable and dynamically
      * @constructor
      * @memberof module:testron
      * @summary Quiz Tests Class
      * @description Constructor for creating "Test" objects. It supports a parameter with a configuration 
      * object with certain properties or attributes. 
      * @param conf {Object} Configuration object (see {@link #conf conf})
      * @see #conf */
    function Test(conf) {
        /** @summary Exclusive id (+ or -)
          * @type {string} */
        this.id;
        if (t.utils && t.utils.generateId) {
            this.id = t.utils.generateId(); //Exclusive id (+ or -)
        }
        /** @summary Number of this Test. 
          * @description This is not equal to this.id (from 0 to +Infinity)
          * @type {number} */
        this.num = counter++; //from 0 to infinity
        /** @summary "testron" Parent object
          * @type {namespace:testron} */
        this.root = t;
        /** @summary Question objects array
          * @type {Array:Question} */
        this.questions = [];
        /** @summary own DOM element
          * @type {Object:HTMLElement} */
        this.element = null;
        /** @summary is valid this Test ?
          * @type {boolean} */
        this.valid = true;
        /** @summary Marker for this Test
          * @type {Object:Marker} */
        this.marker = null;
        /** @summary DOM Element for own Marker
          * @type {Object:HTMLElement} */
        this.markerElement = null;
        /** @summary Configuration Options
          * @description a Javascript object with follow structure:
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
        /** @summary clone from {@link conf.className}
          * @description if you wish a specific class name for container
          * @type {string} */
        this.className = this.conf.className;
        /** @summary clone from {@link conf.container}
          * @description the DOM element which embed the UI
          * @type {Object:HTMLElement} */
        this.container = this.conf.container;
        /** @summary clone from {@link conf.markerContainer}
          * @description similarly to 'container' for Marker (It advised in fixed position)
          * @type {Object:HTMLElement} */
        this.markerContainer = this.conf.markerContainer;
        /** @summary clone from {@link conf.remove}
          * @description cleans the container before insert the content
          * @type {boolean} */
        this.remove = this.conf.remove;
        /** @summary clone from {@link conf.markerRemove}
          * @description similarly to 'remove' for Marker
          * @type {boolean} */
        this.markerRemove = this.conf.markerRemove;
        /** @summary is finished this Test ?
          * @type {boolean} */
        this.finished = false;
        this.root.addTest(this); //var valueJSON = this.root.toJSON().toString();
        //this.update_nAnQ();
        //this.toHtml();
        this.update();
    }
   
    /** @method
      * @summary Get the self own-counter */
    Test.prototype.getCounter = function () { return counter; };
   
    /** @method
      * @summary Filter the Configuration Options
      * @description The Configuration Options will set to default if not exists
      * @param conf {Object} Configuration object
      * @return {Object} The sanitized configuration options
      * @see #conf */
    Test.prototype.filterConf = function (conf) {
        var container = this.root.filterContainer(conf.container, conf.remove);
        var markerContainer = this.root.filterContainer(conf.markerContainer, conf.markerRemove);
        return {
            /** Class name for CSS styles */
            className: "testron" + (conf.className ? (" " + conf.className) : ""),
            /* * Parse force */
            //parse: conf.parse || false,
            container: container, //conf.container || null,
            markerContainer: markerContainer, //conf.markerContainer || null,
            remove: conf.remove,
            markerRemove: conf.markerRemove,
            /** Questions Number */
            nQ: conf.nQ || 1,
            /** Answers Number */
            nA: conf.nA || 4,
            digits: conf.digits || 2,
            precision: conf.precision || 2,
            stopOnSuccess: conf.stopOnSuccess || false,
            charset: conf.charset || "utf-8"
        };
    };
    
    /** @summary Remove the invalid answers */
    Test.prototype.sanitizeQuestions = function () {
        var questions2 = [];
        for (var i = 0; i < this.questions.length; i++) {
            if (this.questions[i].valid) { questions2.push(this.questions[i]); }
        }
        this.questions = questions2;
        this.update_nAnQ();
    };
    
    /** @summary Updates the answers and questions number and its marker */
    Test.prototype.update_nAnQ = function () {
        //UPDATE nA AND nQ
        var nA = 0;
        for (var i = 0; i < this.questions.length; i++) {
            nA += this.questions[i].conf.nA;
        }
        this.conf.nA = nA;
        this.conf.nQ = this.questions.length;
    };
    
    /** @summary Updates this Test.
      * @description Also updates the answers and questions number and its marker */
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
    
    /** @summary Checks if this Test is finished.
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
      * @summary Adding a Question object to this Test
      * @param question {Object:testron.Test.Question} "Question" object
      * @param refresh {boolean} update this Test ?
      * @returns {Object:Question} Return the same question input parameter */
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
      * @summary Create and adding a Question object to this Test
      * @param conf {Object} Configuration object (for Question Objects)
      * @returns {Object:Question} Return the new Question created */
    Test.prototype.createQuestion = function (conf, refresh) {
        return this.addQuestion(new this.Question(this, conf), refresh);
    };
    
    /** @method
      * @summary Create a Marker object to this Test
      * @param conf {Object} Configuration object (for Marker Objects)
      * @returns {Object:Marker} Return the new Marker created */
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
    
    /** @summary Create Test from 'test' parameter.
      * @description The parameter can be a Javascript object or a JSON string object with follow structure:
      * <pre>
      * testron: {
      *     conf: {...},
      *     questions: [...] // an Array of questions. (see Test#parseQuestions(...))
      * }
      * </pre>
      * @param test {Object|string} a Javascript object or a JSON string object
      * @return {string} a DEBUG string with info
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
      * @summary Create the HTML-UI for this test and return it
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
                t.utils.setTimerContainer(this); //TIMER TO DETECT CONTAINER
            }
        } else {
            ul.style.background = "#333333";
        }
        
        return ul;
    };
    
    /** @summary Parse this element to JSON 
      * @return {string} a JSON string which represents to this Test object */
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
      * @summary Emit the Next event for pass to forward Question */
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
      * @summary Emit the Marker event for update the Marker */
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
  
   //INNER PRIVATES VARS
   /** Static counter */
   var counter = 0;
   /** STATIC POINTS FOR CALCULATIONS */
   var POINTS_TRUE = 1;
   var POINTS_FALSE = -0.5;
   var POINTS_NULL = -0.1;
   var POINTS_BLANK = 0;
   var POINTS_TOP = 10; //Max Puntuation (0-10)
   
   //INNER PRIVATES FUNCTIONS
   /** @class A class to build Markers for Tests, configurable and dynamically
     * @constructor
     * @memberof module:testron#Test
     * @summary Marker to Tests
     * @description Constructor for creating "Marker" objects. It supports a parameter with a 
     * configuration object with certain properties or attributes. 
     * @param parent {Object} "Test" object
     * @param conf {Object} Configuration object (see {@link #conf conf})
     * @see #conf */
   function Marker(parent, conf) {
     /** @summary "testron" Ancestor object
       * @type {namespace:testron} */
     this.root = parent.root;
     /** @summary clone of {@link testron.utils}"
       * @type {Object} */
     this.utils =  (this.root && this.root.utils) ? this.root.utils : null;
     /** @summary "Test" Parent object
       * @type {Object:Test} */
     this.parent = parent;
     /** @summary Exclusive id (+ or -)
       * @type {string} */
     this.id;
     if (this.utils && this.utils.generateId) {
         this.id = this.utils.generateId();
     } //Exclusive id (+ or -)
     this.id = (parent ? (parent.id + "-") : "") + this.id;
     /** @summary Number of this Marker. 
       * @description This is not equal to 'this.id' ( from 0 to +Infinity)
       * @type {number} */
     this.num = counter++; //from 0 to infinity
     /** @summary Configuration Options
       * @description a Javascript object with follow structure:
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
     /** @summary clone from {@link conf.container}
       * @description this must be equal to {@link parent.markerContainer}
       * @type {Object:HTMLElement} */
     this.container = this.conf.container; //this.root.filterContainer(this.conf.container);
     /** @summary counter for answers solution
       * @description These are only properties names, don't are booleans, don't are primitive types. 
       * Your structure is: 
       * <code>{"true": 0, "false": 0, "null": 0, "blank": 0}</code>
       * @type {Object}
       */
     this.results = {"true": 0, "false": 0, "null": 0, "blank": 0};
     this.position = 0;
     /** @summary own DOM element
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
     /** @summary it counts the intents
       * @type {number} */
     this.intents = 0;
     /** @summary score compute
       * @type {number} */
     this.score = 0;
     /** @summary what is the current Question ?
       * @type {number} */
     this.currentQuestion = null;
     /** @summary is valid this Marker ?
       * @type {boolean} */
     this.valid = true;
     
     this.toHtml();
   }
  
   /**
     * @method
     * @summary Get the self own-counter */
   Marker.prototype.getCounter = function () { return counter; };
  
   /**
     * @method
     * @summary Filter the Configuration Options
     * @description The Configuration Options will are get from
     * parent ("Test"), if not exists
     * @param conf {Object} Configuration object
     * @see #conf */
   Marker.prototype.filterConf = function (conf) {
       var markerContainer = this.root.filterContainer(conf.markerContainer, conf.markerRemove);
       return {
           container: markerContainer, //conf.markerContainer,
           /** Number of this Marker. This is not equal to this.id */
           digits: conf.digits || this.parent.conf.digits || 4,
           precision: conf.precision || this.parent.conf.precision || 2,
           /** Questions Number */
           nQ: conf.nQ || this.parent.conf.nQ || 1,
           /** Answers Number */
           nA: conf.nA || this.parent.conf.nA || 4,
           charset: conf.charset || this.parent.conf.charset || "utf-8"
       };
   };
   
   /** @method
     * @summary Checking the results object 
     * @see #results */
   Marker.prototype.sanitizeResults = function () {
       this.results = {"true": this.results["true"],
                       "false": this.results["false"],
                       "null": this.results["null"],
                       "blank": this.results.blank};
   };
  
   /**
     * @method
     * @summary Sum one to "true" object counter
     * @returns {number} Return the current updated counter */
   Marker.prototype.plusTrue = function () {
       if (!this.valid) { return -1; }
       this.results["true"]++;
       this.intents++;
       return this.results["true"];
   };
  
   /**
     * @method
     * @summary Sum one to "false" object counter
     * @returns {number} Return the current updated counter */
   Marker.prototype.plusFalse = function () {
       if (!this.valid) { return -1; }
       this.results["false"]++;
       this.intents++;
       return this.results["false"];
   };
   
   /**
     * @method
     * @summary Sum one to "null" object counter
     * @returns {number} Return the current updated counter */
   Marker.prototype.plusNull = function () {
       if (!this.valid) { return -1; }
       this.results["null"]++;
       this.intents++;
       return this.results["null"];
   };
  
   /**
     * @method
     * @summary Sum one to "blank" object counter
     * @returns {number} Return the current updated counter */
   Marker.prototype.plusBlank = function () {
       if (!this.valid) { return -1; }
       this.results.blank++;
       this.intents++;
       return this.results.blank;
   };
   
   /**
     * @method
     * @summary Reset full the object counter
     * @see #results */
   Marker.prototype.resetResults = function () {
       if (this.valid) {
           this.results = {"true": 0, "false": 0, "null": 0, "blank": 0};
       }
   };
   
   /**
     * @method
     * @summary Reset the counters
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
     * @summary Updates the counters
     * @param {Object:Question} Object Question */
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
     * @summary Calculates the solution for total score
     * @returns {number} updated score */
   Marker.prototype.calcScore = function () {
       this.score = this.filterDigits(POINTS_TOP * (this.scoreSuccesses() - this.scoreFailures()));
       return this.score;
   };
   
   /** @method
     * @summary Calculates the successes coefficient 
     * @description It's based on total Questions number.
     * This coefficient will apply as multiplicand to the True Answers
     * @returns {number} successes coefficient  */
   Marker.prototype.coefficientSuccesses = function () {
       return this.filterDigits(1 / this.conf.nQ);
   };
   /** @method
     * @summary Calculates the failures coefficient 
     * @description It's based on total number of Questions and Answers.
     * This coefficient will apply as multiplicand to the False Answers
     * @returns {number} failures coefficient  */
   Marker.prototype.coefficientFailures = function () {
       return this.filterDigits(1 / ((this.conf.nA - 1) * this.conf.nQ));
   };
   /** @method
     * @summary Calculates the score for True Answers
     * @returns {number} Successes score */
   Marker.prototype.scoreSuccesses = function () {
       return this.filterDigits(this.results["true"] * this.coefficientSuccesses());
   };
   /** @method
     * @summary Calculates the score for False Answers
     * @returns {number} Failures score */
   Marker.prototype.scoreFailures = function () {
       return this.filterDigits(this.results["false"] * this.coefficientFailures());
   };
   //END SCORE
   
   /** @summary Filter a number to passed parameters.
     * @description It is used to filter a number to configuration properties: 'precision' and 'digits number' */
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
     * @summary Create the HTML-UI
     * @description Create the HTML-UI for this Marker and return it
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
           caption.innerHTML = "Marker (" + this.num + ")";
           table.appendChild(caption);
           this.sanitizeResults();
           var thead = document.createElement("thead");
               var trh1 = document.createElement("tr");
                   var th1 = document.createElement("th");
                   th1.innerHTML = "";
                   trh1.appendChild(th1);
                   var th2 = document.createElement("th");
                   th2.innerHTML = "Value";
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
                   tdf2.innerHTML = "<strong>Points:</strong> (Success:" +
                                    this.filterDigits(this.scoreSuccesses() * POINTS_TOP) + ") ";
                   this.elementPointsTrue = tdf2;   //POINTS TRUE
                   trf2.appendChild(tdf2);
                   var tdf3 = document.createElement("td");
                   tdf3.innerHTML = "(Fails:" + this.filterDigits(this.scoreFailures() * POINTS_TOP) + ") ";
                   this.elementPointsFalse = tdf3;   //POINTS FALSE
                   trf2.appendChild(tdf3);
               tfoot.appendChild(trf2);
               var trf3 = document.createElement("tr");
                   trf3.style.fontSize = "smaller";
                   var tdf4 = document.createElement("td");
                       var i1 = document.createElement("i");
                       i1.setAttribute("class", "btn btn-16");
                       i1.innerHTML = '<image src="' + this.root.utils.icos.PENCIL +
                                       '" title="edit/import ... modify or paste other text"/>';
                       this.elementBtnEdit = i1;   //EDIT BUTTON
                       this.elementBtnEdit.disabled = !document.queryCommandSupported('copy');
                       this.utils.addEvent(i1, "click", function testronEditListener (){
                           self.utils.editListener(areaEditSave);
                       });
                       tdf4.appendChild(i1);
                       var i2 = document.createElement("i");
                       i2.setAttribute("class", "btn btn-16");
                       i2.innerHTML = '<image src="' + this.root.utils.icos.DOWNLOAD +
                                      '" title="view save/download ... click on download link"/>';
                       this.elementBtnDownload = i2;   //DOWNLOAD BUTTON
                       this.utils.addEvent(i2, "click", function testronSaveListener (){
                           self.utils.saveListener(areaEditSave);
                       });
                       tdf4.appendChild(i2);
                       var i3 = document.createElement("i");
                       i3.setAttribute("class", "btn btn-16");
                       i3.innerHTML = '<image src="' + this.root.utils.icos.UNDO +
                                      '" title="reset the tests"/>';
                       this.elementBtnReset = i3;   //RESET BUTTON
                       this.utils.addEvent(i3, "click", function testronResetListener (){
                           //self.root.parseTestrons(JSON.parse(areaEditSave.value));
                           var numTests = self.utils.resetListener(areaEditSave);
                           if(numTests.charAt && (numTests.substr(0,5) === "ERROR")) { //ERROR string
                               //alert(self.parent.toJSON());
                               areaEditSave.innerHTML = self.parent.toJSON();
                               numTests = self.utils.resetListener(areaEditSave);
                               if(numTests.charAt && (numTests.substr(0,5) === "ERROR")) { //ERROR string
                                   alert("ERROR parsing JSON");
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
                   td11.innerHTML = "Success";
                   tr1.appendChild(td11);
                   var td12 = document.createElement("td");
                   td12.setAttribute("class", "marker-values");
                   td12.innerHTML = this.results["true"];
                   this.elementTrue = td12;    //TRUE
                   tr1.appendChild(td12);
               tbody.appendChild(tr1);
               var tr2 = document.createElement("tr");
                   var td21 = document.createElement("td");
                   td21.innerHTML = "Fails";
                   tr2.appendChild(td21);
                   var td22 = document.createElement("td");
                   td22.setAttribute("class", "marker-values");
                   td22.innerHTML = this.results["false"];
                   this.elementFalse = td22;   //FALSE
                   tr2.appendChild(td22);
               tbody.appendChild(tr2);
               var tr3 = document.createElement("tr");
                   var td31 = document.createElement("td");
                   td31.innerHTML = "Blank";
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
  
   //INNER PRIVATES VARS
   /** Static counter */
   var counter = 0;

   //INNER PRIVATES FUNCTIONS
   /** @class A class to build Questions for Tests configurable and dynamically
     * @constructor
     * @memberof module:testron#Test
     * @summary Questions for test
     * @description Constructor for creating "Question" objects. It supports a parameter with a 
     * configuration object with certain properties or attributes. 
     * @param parent {Object} "Test" object
     * @param conf {Object} Configuration object (see {@link #conf conf})
     * @see #conf */
   function Question(parent, conf) {
     /** @summary "testron" Ancestor object {namespace}
       * @type {namespaces:testron} */
     this.root = parent.root; //"testron" {namespace}
     /** @summary Exclusive id (+ or -)
       * @type {string} */
     this.id;
     if (this.root.utils && this.root.utils.generateId) {
         this.id = this.root.utils.generateId();
     }
     this.id = (parent ? (parent.id + "-") : "") + this.id;
     /** @summary Number of this Question. 
       * @description This is not equal to 'this.id' (from 0 to +Infinity)
       * @type {number} */
     this.num = counter++;
     /** @summary "Test" Parent object
       * @type {Object:Test} */
     this.parent = parent;
     /** @summary Answer objects array
       * @type {Array:Answer} */
     this.answers = [];
     /** @summary Position in 'questions' parent array
       * @type {number} */
     this.position = 0;
     /** @summary Is this question is already succeeded ?
       * @type {boolean} */
     this.ok = false;
     /** @summary own DOM element
       * @type {Object:HTMLElement} */
     this.element = null;
     /** @summary It keeps track marking for this Question
       * @type {boolean} */
     this.marked = false;
     /** @summary Counts the intents for this Question
       * @type {number} */
     this.intents = 0;
     /** @summary is valid this Question ?
       * @type {boolean} */
     this.valid = true;
     /** @summary Configuration Options
       * @description a Javascript object with follow structure:
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
     /** @summary clone {@link conf.solution}
       * @type {number} */
     this.solution = this.conf.solution;
     /** @summary clone {@link conf.stopOnSuccess}
       * @description False = Only one click, True = clicks until success
       * @type {boolean} */
     this.stopOnSuccess = this.conf.stopOnSuccess;
     
     this.update_nA();
   }
  
   /**
     * @method
     * @summary Get the self own-counter */
   Question.prototype.getCounter = function () { return counter; };
  
   /**
     * @method
     * @summary Filter the Configuration Options
     * @description The Configuration Options will are get from
     * parent ("Test"), if not exists
     * @param conf {Object} Configuration object
     * @return {Object} The sanitized configuration options
     * @see #conf */
   Question.prototype.filterConf = function (conf) {
       return {
           /** Number of this Question. This is not equal to this.id */
           num: conf.num,
           /** Answers Number */
           nA: conf.nA || this.parent.conf.nA || 4,
           solution: conf.solution || 0,
           /** When stop? true = 'Stop on successes', false = 'Stop on click' */
           stopOnSuccess : (conf.stopOnSuccess !== undefined) ? conf.stopOnSuccess :
                           ((this.parent.conf.stopOnSuccess !== undefined) ? this.parent.conf.stopOnSuccess : false),
           charset: conf.charset || this.parent.conf.charset || "utf-8",
           txt: conf.txt || "?"
       };
   };
   
   /** @method
     * @summary Remove the invalid answers */
   Question.prototype.sanitizeAnswers = function () {
       var answers2 = [];
       for (var i = 0; i < this.answers.length; i++) {
           if (this.answers[i].valid) { answers2.push(this.answers[i]); }
       }
       this.answers = answers2;
   };
  
   /**
     * @method
     * @summary Adding an Answer object to this Question
     * @param answer {Object:testron.Test.Question.Answer} "Answer" object
     * @returns {Object:Answer} Return the same input parameter*/
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
     * @summary Create and adding an Answer object to this Test
     * @param conf {Object} Configuration object (for Answer Objects)
     * @returns {Object:Answer} Return the new Answer created */
   Question.prototype.createAnswer = function (conf) {
       return this.addAnswer(new this.Answer(this, conf));
   };
   
   /** @method
     * @summary Remove all answers for this Test Question */
   Question.prototype.removeAnswers = function () {
       for (var i = 0; i < this.answers.length; i++) {
           this.answers[i].remove();
       }
       this.answers = [];
   };
   
   /** @method
     * @summary Remove this Test Question (and your children answers) */
   Question.prototype.remove = function () {
       this.removeAnswers();
       this.root = this.parent = this.conf = this.element = null; //NULLIFY
       this.valid = false;
       //...MORE OPERATIONS FOR FREE MEMORY
   };
   
   /** @summary Updates the answers number */
   Question.prototype.update_nA = function () {
       //UPDATE nA
       this.conf.nA = this.answers.length;
   };
   
   /** @summary This checks the solution for this Question
     * @returns {boolean} True / False */
   Question.prototype.verify = function (position) {
       //alert(position + " === " + this.solution);
       return ((position + 1) === this.solution);
   };
   
   /** @method
     * @summary This changes the style for this Question DOMElement. 
     * Also shoots the 'emitNext' event */
   Question.prototype.toOK = function () {
       if (this.valid && this.element) {
           this.element.style.backgroundColor = "aquamarine";
           this.ok = true;
           this.parent.emitMarker(this);
       }
       this.emitNext();
   };
   
   /** @method
     * @summary Change the style to FAIL for this Question DOMElement */
   Question.prototype.toFail = function () {
       if (this.valid && this.element) {
           this.element.style.backgroundColor = "maroon";
           this.parent.emitMarker(this);
       }
   };
   
   /** @summary Create questions from 'questions' parameter.
     * @description The parameter can be a Javascript object or a JSON string object with follow structure:
     * <pre>
     * questions: [
     *   {
     *     conf: {..., txt: "Question 1 ??"},
     *     answers: [ ... ] // see Question.parseAnswers(...)
     *   },
     *   { ... },
     *   ...
     * ]
     * </pre>
     * @param test {Object|string} a Javascript object or a JSON string object
     * @return {string} a DEBUG string with info
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

       //ANSWERS
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
     * @summary Create the HTML-UI for this Question and return it
     * as HTMLElement (HTMLUlElement)
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
   
   /** @summary Parse this element to JSON 
     * @return {string} a JSON string which represents to this Question object */
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
   
   //EVENTS
   /** @emitter
     * @summary Emit the Click event for comprobations in this Question */
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
     * @summary Emit the Next event for pass to forward Question */
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
  
   //INNER PRIVATES VARS
   /** Static counter */
   var counter = 0;
   
   //INNER PRIVATES FUNCTIONS
   /** @class A class to build Answer for Questions Tests, configurable and dynamically
     * @constructor
     * @memberof module:testron#Question#Test
     * @summary Answer for any Question of test
     * @description Constructor for creating "Answer" objects. It supports a parameter with a 
     * configuration object with certain properties or attributes. 
     * @param parent {Object} "Question" object
     * @param conf {Object} Configuration object (see {@link #conf conf})
     * @see #conf */
   function Answer(parent, conf) {
     /** @summary "testron" ancestor object {namespace}
       * @type {namespace:testron} */
     this.root = parent.root; //"testron" {namespace}
     /** @summary Exclusive id (+ or -)
       * @type {string} */
     this.id;
     if (this.root.utils && this.root.utils.generateId) {
         this.id = this.root.utils.generateId(); //Exclusive id (+ or -)
     }
     this.id = (parent ? (parent.id + "-") : "") + this.id;
     /** @summary Number of this answer. 
       * @description This is not equal to 'this.id' (from 0 to +Infinity)
       * @type {number} */
     this.num = counter++; //from 0 to infinity
     /** @summary "Question" Parent object
       * @type {Object:Question} */
     this.parent = parent;
     /** @summary own DOM element
       * @type {Object:HTMLElement} */
     this.element = null;
     /** @summary It keeps track marking for this Answer
       * @type {boolean} */
     this.checked = false;
     /** @summary is valid this Answer ?
       * @type {boolean} */
     this.valid = true;
     /** @summary Configuration Options
       * @description a Javascript object with follow structure:
       * <pre>
       * {
       *    num: 1,
       *    name: "A",
       *    charset: "utf-8",
       *   txt: "Answer 1"
       * }
       * </pre>
       * @type {Object} */
     this.conf = this.filterConf(conf || this.parent.conf);
     if (conf.answer) { //objeto JSON
         var str = this.parseAnswer(conf);
         //alert(str);
     }
     /** @summary clone of conf.name
       * @description Its name ('A', '1', 'a', 'IV', 'pepito', ...)
       * @type {string} */
     this.name = this.conf.name;
   }
  
   /** @method
     * @summary Get the self own-counter */
   Answer.prototype.getCounter = function () { return counter; };
  
   /** @method
     * @summary Filter the Configuration Options
     * @description The Configuration Options will are get from parent
     * ("Question"), if not exists
     * @param conf {Object} Configuration object
     * @see #conf*/
   Answer.prototype.filterConf = function (conf) {
       return {
           /** Number of this Answer. This is not equal to this.id */
           num: conf.num,
           name: conf.name,
           charset: conf.charset || this.parent.conf.charset || "utf-8",
           txt: conf.txt || ""
       };
   };
   
   /** @method
     * @summary Remove this Answer */
   Answer.prototype.remove = function () {
       this.root = this.parent = this.conf = this.element = null; //NULLIFY
       this.valid = false;
       //...MORE OPERATIONS FOR FREE MEMORY
   };
   
   /** @method
     * @summary Change the style to OK for this Answer DOMElement */
   Answer.prototype.toOK = function () {
       if (this.valid && this.element) {
           this.element.style.backgroundColor = "lightGreen";
           //this.root.onOk(null, this);
       }
   };
   
   /** @method
     * @summary Change the style to FAIL for this Answer DOMElement */
   Answer.prototype.toFail = function () {
       if (this.valid && this.element) {
           this.element.style.backgroundColor = "coral";
           //this.root.onFail(null, this);
       }
   };
   
   /** @summary Create answers from 'answers' parameter.
     * @description The parameter can be a Javascript object or a JSON string object with follow structure:
     * <pre>
     * answers: [
     *       { name: "A", txt: "Answer 1"}, {...}, ...
     * ]
     * </pre>
      * @param test {Object|string} a Javascript object or a JSON string object
      * @return {string} a DEBUG string with info
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
     * @summary Create the HTML-UI for this Answer and return it
     * as HTMLElement (HTMLLiElement) */
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
   
   /** @summary Parse this element to JSON 
     * @return {string} a JSON string which represents to this Answer object */
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
     * @summary Emit the Click event for comprobations in this Answer */
   Answer.prototype.emitClick = function () {
       if (this.valid && !this.checked) {
           this.checked = true;
           this.parent.emitClick(this); //propagate
       }
   };
  
   q.prototype.Answer = Answer;

})
(testron.Test.prototype.Question ||
 (testron.Test.prototype.Question = function () {})
);
//END MODULE ANSWER