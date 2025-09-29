const letra = [
  "¿Que si tú me encantas? Tú me tiene' loco",
  "Te encuentro hasta en sueño', me siento en el cielo cuando yo te toco",
  "Y si me hace' falta, ah, yo me desenfoco, oh-oh",
  "No todo' lo entienden, tú ere' la indicada, en tus ojo' lo noto, oh-oh",
  "",
  "Tú me diste amor, yo te di mi corazón",
  "Te di mi dolor y un beso se lo llevó, oh-oh",
  "Yo te doy todo, ma, tú solo pídelo, wow",
  "Ya no estoy solo, yo contigo estoy mejor",
  "Porque nеna tus besos a mí me salvan",
  "Estaba perdido y contigo еncontré la calma",
  "Solo en tu mirada puedo ver nacer el alba",
  "Llévame contigo en cada espacio de tu alma (yeah, ey)",
  "",
  "Y aunque no sepa' lo mucho que te pienso,",
  "en todo' lado' veo tu silueta, ey",
  "No se me quitan esta' gana' de comerte",
  "y esa boquita e' parte 'e mi dieta, no",
  "Si está conmigo, bebé, nada me falta",
  "porque tú siempre has sido la meta",
  "Y es que nunca vo'a olvidarme de ti,",
  "que tú ere' mi mitad, solo tú me completa'",
  "",
  "El cielo e' lindo, pero refleja'o en tus ojo' e' distinto",
  "Quiero donarle a la luna tu sonrisa",
  "Espero verla pa' acordarme de ti cuando no esté aquí",
  "Éramo' amigo', pero comenzamo' a sentirno' distinto",
  "Quiero caminar contigo en el mismo sendero",
  "Que nunca te aleje' de mí, quiero hacerte feli'",
  "pero pcoo a pco"
];

let i = 0;

function cantarLetra() {
  if (i < letra.length) {
    console.log(letra[i]);
    i++;
    setTimeout(cantarLetra, 2000); // cambia el tiempo (ms) según qué tan rápido quieras
  }
}

cantarLetra();
