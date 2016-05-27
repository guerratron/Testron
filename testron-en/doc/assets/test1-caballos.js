var tests = {
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
            txt:"¿ Cómo se llamaba el caballo de 'Don Quijote' ?"
          },
          answers: [
            {name:"A",charset:"utf-8",txt:"Babiera"},
            {name:"B",charset:"utf-8",txt:"Rocinante"},
            {name:"C",charset:"utf-8",txt:"No tenía dinero p'a caballo, iba en burro"}
          ]
        },
        {
          conf: {
            num:2,nA:3,solution:3,charset:"utf-8",
            txt:"¿ De qué color era el caballo blanco de <i>Santiago</i> ?"
          },
          answers: [
            {name:"A",charset:"utf-8",txt:"Azul"},
            {name:"B",charset:"utf-8",txt:"transparente"},
            {name:"C",charset:"utf-8",txt:"Blancoooooooo !!!"}
          ]
        },
        {
          conf: {
            num:3,nA:3,solution:3,charset:"utf-8",
            txt:"¿ Cómo se llamaba el famoso caballo del 'Cid Campeador' ?"
          },
          answers: [
            {name:"A",charset:"utf-8",txt:"Rocinante"},
            {name:"B",charset:"utf-8",txt:"Atila"},
            {name:"C",charset:"utf-8",txt:"Babieca"}
          ]
        },
        {
          conf: {
            num:4,nA:3,solution:1,charset:"utf-8",
            txt:"¿ Cuántas patas tiene un caballito pequeño ?"
          },
          answers: [
            {name:"A",charset:"utf-8",txt:"si es de mar, ninguna"},
            {name:"B",charset:"utf-8",txt:"depende de lo pequeño que sea"},
            {name:"C",charset:"utf-8",txt:"infinitas"}
          ]
        }
      ]
    }
  ]
}