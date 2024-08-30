
const fs = require('fs');  
const podaci = JSON.parse(fs.readFileSync('groups.json', 'utf8'));

function simulacija_igre(tim1, tim2){
    const ishod_igre = Math.random();

    const tim1_Rezultat = tim1.FIBARanking * (1 - ishod_igre);
    const tim2_Rezultat = tim2.FIBARanking * ishod_igre;

    return {tim1_Rezultat, tim2_Rezultat};
}

function simulacija_grupe(grupe){
    for(const grupa of Object.keys(grupe)){
        const timovi = grupe[grupa];
        console.log(`Grupa ${grupa}`);

        for (let i = 0; i < timovi.lenght; i++){
            for(let j = i +1; j < timovi.lenght; j++){
                const rezultat = simulacija_igre(timovi[i], timovi[j]);
                console.log(`${timovi[i].Team} - ${timovi[j].Team}  (${Math.round(rezultat.tim1_Rezultat)} : ${Math.round(rezultat.tim2_Rezultat)}`)
            }
        }
    }
}

simulacija_grupe(podaci.grupe)