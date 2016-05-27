/*
 * Electricity Tests. A "questions-battery" level 2
 * 2016 (c) GuerraTron <dinertron@gmail.com>
 */
var testrons = {
  testrons: [
    {
      conf: {
        className:"testron test-80",container:"container",markerContainer:"container2",
        remove:true,markerRemove:true,nQ:4,nA:12,digits:2,precision:2,
        stopOnSuccess:true,charset:"utf-8"
      },
      questions: [
        {
          conf: {
            num:1,nA:3,solution:2,charset:"utf-8",
            txt:"How many electrical magnitudes has the \"Ohm's Law\" ?"
          },
          answers: [
            {name:"A",charset:"utf-8",txt:"One (&#x2776;)"},
            {name:"B",charset:"utf-8",txt:"Three (&#x2778;)"},
            {name:"C",charset:"utf-8",txt:"Zero (&#x274D;)"}
          ]
        },
        {
          conf: {
            num:2,nA:3,solution:3,charset:"utf-8",
            txt:"What is the real direction of electrical current ?"
          },
          answers: [
            {name:"A",charset:"utf-8",txt:"Positive to Negative (&CirclePlus; &rarr; &CircleMinus;)"},
            {name:"B",charset:"utf-8",txt:"It depends on whether AC or DC (&DoubleLeftRightArrow;)"},
            {name:"C",charset:"utf-8",txt:"Negative to Positive (&CirclePlus; &larr; &CircleMinus;)"}
          ]
        },
        {
          conf: {
            num:3,nA:3,solution:3,charset:"utf-8",
            txt:"What is the correct formulation to represent the \"Ohm's Law\"?"
          },
          answers: [
            {name:"A",charset:"utf-8",txt:"V = I / R"},
            {name:"B",charset:"utf-8",txt:"I = V * R"},
            {name:"C",charset:"utf-8",txt:"V = I * R"}
          ]
        },
        {
          conf: {
            num:4,nA:3,solution:1,charset:"utf-8",
            txt:"in a DC circuit to which is doubled the load Resistance, what happens to the Potence ?"
          },
          answers: [
            {name:"A",charset:"utf-8",txt:"It is decremented until &frac14;"},
            {name:"B",charset:"utf-8",txt:"It is incremented on double"},
            {name:"C",charset:"utf-8",txt:"It remains constant as it is not affected by resistance"}
          ]
        }
      ]
    }
  ]
}