const fs = require('fs');
const podaci = JSON.parse(fs.readFileSync('groups.json', 'utf8'));

function simulacija_igre(tim1, tim2) {

    const tim1_se_povukao = Math.random() < 0.05;
    const tim2_se_povukao = Math.random() < 0.05;

    if (tim1_se_povukao && tim2_se_povukao) {
        return { tim1_Rezultat: 0, tim2_Rezultat: 0 };
    } else if (tim1_se_povukao) {
        return { tim1_Rezultat: 0, tim2_Rezultat: tim2.FIBARanking * 1 };
    } else if (tim2_se_povukao) {
        return { tim1_Rezultat: tim1.FIBARanking * 1, tim2_Rezultat: 0 };
    } else {
        const ishod_igre = Math.random();
        const tim1_Rezultat = tim1.FIBARanking * (1 - ishod_igre);
        const tim2_Rezultat = tim2.FIBARanking * ishod_igre;
        return { tim1_Rezultat, tim2_Rezultat };
    }
}

function simulacija_grupe(grupe) {
    const plasman_grupe = {};
    console.log(`Grupna faza - I kolo:`)
    console.log(`---------------------`)


    for (const grupa in grupe) {
        const timovi = grupe[grupa];
        console.log(`Grupa ${grupa}:`);
        console.log(`---------------------`);

        const rezultati = {};
        timovi.forEach(tim => {
            rezultati[tim.Team] = {
                pobede: 0,
                porazi: 0,
                nereseni: 0,
                bodovi: 0,
                postignuti_kosevi: 0,
                primljeni_kosevi: 0,
                kos_razlika: 0
            };
        });

        for (let i = 0; i < timovi.length; i++) {
            for (let j = i + 1; j < timovi.length; j++) {
                const rezultat = simulacija_igre(timovi[i], timovi[j]);
                const tim1_Rezultat = Math.round(rezultat.tim1_Rezultat);
                const tim2_Rezultat = Math.round(rezultat.tim2_Rezultat);

                console.log(`${timovi[i].Team} - ${timovi[j].Team} (${tim1_Rezultat} : ${tim2_Rezultat})`);

                if (tim1_Rezultat > tim2_Rezultat) {
                    rezultati[timovi[i].Team].bodovi += 2;
                    rezultati[timovi[i].Team].pobede++;
                    rezultati[timovi[j].Team].porazi++;
                } else if (tim1_Rezultat < tim2_Rezultat) {
                    rezultati[timovi[j].Team].bodovi += 2;
                    rezultati[timovi[j].Team].pobede++;
                    rezultati[timovi[i].Team].porazi++;
                } else {
                    rezultati[timovi[i].Team].bodovi++;
                    rezultati[timovi[j].Team].bodovi++;
                    rezultati[timovi[i].Team].nereseni++;
                    rezultati[timovi[j].Team].nereseni++;
                }

                rezultati[timovi[i].Team].postignuti_kosevi += tim1_Rezultat;
                rezultati[timovi[i].Team].primljeni_kosevi += tim2_Rezultat;
                rezultati[timovi[j].Team].postignuti_kosevi += tim2_Rezultat;
                rezultati[timovi[j].Team].primljeni_kosevi += tim1_Rezultat;
            }
        }

        for (const ime_tima in rezultati) {
            rezultati[ime_tima].kos_razlika = rezultati[ime_tima].postignuti_kosevi - rezultati[ime_tima].primljeni_kosevi;
        }

        const sortiranje_timova = Object.keys(rezultati).sort((a, b) => {
            const tim1 = rezultati[a];
            const tim2 = rezultati[b];

            if (tim1.bodovi !== tim2.bodovi) return tim2.bodovi - tim1.bodovi;
            if (tim1.kos_razlika !== tim2.kos_razlika) return tim2.kos_razlika - tim1.kos_razlika;
            return tim2.postignuti_kosevi - tim1.postignuti_kosevi;
        });

        console.log(`---------------------`);
        console.log("Konačan plasman u grupi:");
        console.log(`---------------------`);

        sortiranje_timova.forEach((ime_tima, index) => {
            const tim = rezultati[ime_tima];
            console.log(`${index + 1}. ${ime_tima} - ${tim.pobede} / ${tim.porazi} / ${tim.bodovi} / ${tim.postignuti_kosevi} / ${tim.primljeni_kosevi} / ${tim.kos_razlika}`);
        });
        console.log(`---------------------`);
        plasman_grupe[grupa] = sortiranje_timova.map(ime => ({
            Team: ime,
            bodovi: rezultati[ime].bodovi,
            kos_razlika: rezultati[ime].kos_razlika,
            postignuti_kosevi: rezultati[ime].postignuti_kosevi,
            grupa
        }));
    }

    const svi_timovi = [];
    for (const grupa in plasman_grupe) {
        plasman_grupe[grupa].forEach((tim, index) => {
            svi_timovi.push({
                Team: tim.Team,
                grupa,
                pozicija: index + 1,
                bodovi: tim.bodovi,
                kos_razlika: tim.kos_razlika,
                postignuti_kosevi: tim.postignuti_kosevi
            });
        });
    }

    const timovi_po_rasporedu = svi_timovi.sort((a, b) => {
        if (a.bodovi !== b.bodovi) return b.bodovi - a.bodovi;
        if (a.kos_razlika !== b.kos_razlika) return b.kos_razlika - a.kos_razlika;
        return b.postignuti_kosevi - a.postignuti_kosevi;
    });

    console.log("Konačno rangiranje timova:");
    console.log(`---------------------`);

    let rang = 1;
    for (const tim of timovi_po_rasporedu) {
        console.log(`${rang}. ${tim.Team} (Grupa: ${tim.grupa}, Pozicija u grupi: ${tim.pozicija})`);
        rang++;
    }

    const najbolji_timovi = timovi_po_rasporedu.slice(0, 8);
    console.log(`---------------------`);
    console.log("Ekipe koje su prošle dalje su:");
    console.log(`---------------------`);
    najbolji_timovi.forEach((tim, index) => {
        console.log(`${index + 1}. ${tim.Team} iz grupe ${tim.grupa}`);
    });
}

simulacija_grupe(podaci);