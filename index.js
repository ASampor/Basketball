const fajl_sistem = require('fs');
const podaci = JSON.parse(fajl_sistem.readFileSync('groups.json', 'utf8'));
const prijateljske_utakmice = JSON.parse(fajl_sistem.readFileSync('exibitions.json', 'utf8'));

const timovi = {
    "CAN": { Team: "Kanada", FIBARanking: 7 },
    "AUS": { Team: "Australija", FIBARanking: 5 },
    "GRE": { Team: "Grčka", FIBARanking: 14 },
    "ESP": { Team: "Španija", FIBARanking: 2 },
    "GER": { Team: "Nemačka", FIBARanking: 3 },
    "FRA": { Team: "Francuska", FIBARanking: 9 },
    "BRA": { Team: "Brazil", FIBARanking: 12 },
    "JPN": { Team: "Japan", FIBARanking: 26 },
    "USA": { Team: "Sjedinjene Države", FIBARanking: 1 },
    "SRB": { Team: "Srbija", FIBARanking: 4 },
    "SSD": { Team: "Južni Sudan", FIBARanking: 34 },
    "PRI": { Team: "Puerto Riko", FIBARanking: 16 }
};

function simulacija_igre(tim1, tim2) {
    const tim1_data = timovi[tim1];
    const tim2_data = timovi[tim2];

    const tim1_se_povukao = Math.random() < 0.05;
    const tim2_se_povukao = Math.random() < 0.05;

    if (tim1_se_povukao && tim2_se_povukao) {
        return { tim1_Rezultat: 0, tim2_Rezultat: 0 };
    } else if (tim1_se_povukao) {
        return { tim1_Rezultat: 0, tim2_Rezultat: tim2_data.FIBARanking * 1 };
    } else if (tim2_se_povukao) {
        return { tim1_Rezultat: tim1_data.FIBARanking * 1, tim2_Rezultat: 0 };
    } else {
        const ishod_igre = Math.random();
        const tim1_Rezultat = tim1_data.FIBARanking * (1 - ishod_igre);
        const tim2_Rezultat = tim2_data.FIBARanking * ishod_igre;
        return { tim1_Rezultat, tim2_Rezultat };
    }
}

function simulacija_utakmice(tim1, tim2, forma) {
    
    const verovatnoca_pobede = vreovatnoca(tim1, tim2, forma);
    const tim1_Rezultat = Math.round(Math.random() *  50 + 50 * verovatnoca_pobede);
    const tim2_Rezultat = Math.round(Math.random() * 50 + 50 * (1- verovatnoca_pobede));
    return {
        tim1_Rezultat: tim1_Rezultat + (verovatnoca_pobede * 20),
        tim2_Rezultat: tim2_Rezultat + ((1 - verovatnoca_pobede) * 20)
    };
}

function ucitaj_iz_forme(tim, prijateljske_utakmice) {
    const utakmice = prijateljske_utakmice[tim];
    if (!utakmice) return 0;

    let ukupna_razlika = 0;
    utakmice.forEach(utakmica => {
        const [pobeda, poraz] = utakmica.Result.split('-').map(Number);
        ukupna_razlika += (pobeda - poraz);
    });

    return ukupna_razlika / utakmice.length;
}

function vreovatnoca(tim1, tim2, forma) {
    const osnovna_verovatnoca = Math.random();
    const razlika_izmedju = ((forma[tim1] || 0) - (forma[tim2] || 0));
    const konacna_verovatnoca = osnovna_verovatnoca + (razlika_izmedju / 100);
    return Math.min(Math.max(konacna_verovatnoca, 0), 1);
}

function simulacija_grupe(grupe) {
    const plasman_grupe = {};
    console.log(`Grupna faza - I kolo:`)
    console.log(`---------------------`)

    for (const grupa in grupe) {
        const timovi_u_grupi = grupe[grupa];
        console.log(`Grupa ${grupa}:`);
        console.log(`---------------------`);

        const rezultati = {};
        timovi_u_grupi.forEach(tim => {
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

        for (let i = 0; i < timovi_u_grupi.length; i++) {
            for (let j = i + 1; j < timovi_u_grupi.length; j++) {
                const rezultat = simulacija_igre(timovi_u_grupi[i].ISOCode, timovi_u_grupi[j].ISOCode);
                const tim1_Rezultat = Math.round(rezultat.tim1_Rezultat * 10);
                const tim2_Rezultat = Math.round(rezultat.tim2_Rezultat * 10 );

                console.log(`${timovi_u_grupi[i].Team} - ${timovi_u_grupi[j].Team} (${tim1_Rezultat} : ${tim2_Rezultat})`);

                if (tim1_Rezultat > tim2_Rezultat) {
                    rezultati[timovi_u_grupi[i].Team].bodovi += 2;
                    rezultati[timovi_u_grupi[i].Team].pobede++;
                    rezultati[timovi_u_grupi[j].Team].porazi++;
                } else if (tim1_Rezultat < tim2_Rezultat) {
                    rezultati[timovi_u_grupi[j].Team].bodovi += 2;
                    rezultati[timovi_u_grupi[j].Team].pobede++;
                    rezultati[timovi_u_grupi[i].Team].porazi++;
                } else {
                    rezultati[timovi_u_grupi[i].Team].bodovi++;
                    rezultati[timovi_u_grupi[j].Team].bodovi++;
                    rezultati[timovi_u_grupi[i].Team].nereseni++;
                    rezultati[timovi_u_grupi[j].Team].nereseni++;
                }

                rezultati[timovi_u_grupi[i].Team].postignuti_kosevi += tim1_Rezultat;
                rezultati[timovi_u_grupi[i].Team].primljeni_kosevi += tim2_Rezultat;
                rezultati[timovi_u_grupi[j].Team].postignuti_kosevi += tim2_Rezultat;
                rezultati[timovi_u_grupi[j].Team].primljeni_kosevi += tim1_Rezultat;
            }
        }

        for (const ime_tima in rezultati) {
            rezultati[ime_tima].kos_razlika = rezultati[ime_tima].postignuti_kosevi - rezultati[ime_tima].primljeni_kosevi;
        }

        const sortiranje_timova = Object.keys(rezultati).sort((a, b) => {
            const tim1 = rezultati[a];
            const tim2 = rezultati[b];

            if (tim1.bodovi !== tim2.bodovi)
                return tim2.bodovi - tim1.bodovi;
            if (tim1.kos_razlika !== tim2.kos_razlika)
                return tim2.kos_razlika - tim1.kos_razlika;
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
        if (a.bodovi !== b.bodovi)
            return b.bodovi - a.bodovi;
        if (a.kos_razlika !== b.kos_razlika)
            return b.kos_razlika - a.kos_razlika;
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

    podeli_u_sesire(najbolji_timovi);
}

function podeli_u_sesire(timovi) {
    const sortiraniTimovi = timovi.sort((a, b) => a.FIBARanking - b.FIBARanking);

    const sesirD = sortiraniTimovi.slice(0, 2);
    const sesirE = sortiraniTimovi.slice(2, 4);
    const sesirF = sortiraniTimovi.slice(4, 6);
    const sesirG = sortiraniTimovi.slice(6, 8);

    console.log("---------------");
    console.log("Šeširi:");
    console.log("---------------");
    console.log(`    Šešir D`);
    console.log("---------------");
    sesirD.forEach(tim => console.log(`        ${tim.Team}`));
    console.log("---------------");
    console.log(`    Šešir E`);
    console.log("---------------");
    sesirE.forEach(tim => console.log(`        ${tim.Team}`));
    console.log("---------------");
    console.log(`    Šešir F`);
    console.log("---------------");
    sesirF.forEach(tim => console.log(`        ${tim.Team}`));
    console.log("---------------");
    console.log(`    Šešir G`);
    console.log("---------------");
    sesirG.forEach(tim => console.log(`        ${tim.Team}`));

    return { sesirD, sesirE, sesirF, sesirG };
}

function prikupi_timove(podaci) {
    const svi_timovi = [];
    for (const grupa in podaci) {
        podaci[grupa].forEach((tim, index) => {
            svi_timovi.push({
                Team: tim.Team,
                rang: index + 1 
            });
        });
    }

    const rangiranje = svi_timovi.sort((a, b) => a.rang - b.rang);

    return rangiranje;
}

function ucitaj_iz_forme(tim, prijateljske_utakmice){
    const utakmice = prijateljske_utakmice[tim];
    if (!utakmice) return 0;

    let ukupna_razlika = 0;
    utakmice.forEach(utakmica => {
        const [pobeda, poraz] = utakmica.Result.split('-').map(Number);
        ukupna_razlika += (pobeda - poraz);
    });

    return ukupna_razlika / utakmice.length;
}

function vreovatnoca(tim1, tim2, forma){
    const osnovna_verovatnoca = 0.5;
    const razlika_izmedju = ((forma[tim1] || 0)- (forma[tim2] || 0));
    const konacna_verovatnoca = osnovna_verovatnoca + (razlika_izmedju /100);
    return Math.min(Math.max(konacna_verovatnoca, 0.05 ), 0.95);
}

function simulacija_utakmice(tim1, tim2, forma) {
    const verovatnoca_pobede = vreovatnoca(tim1, tim2, forma);
    const tim1_Rezultat = Math.round(Math.random() * 50 + 50 * verovatnoca_pobede);
    const tim2_Rezultat = Math.round(Math.random() * 50 + 50 * (1 - verovatnoca_pobede));
    return {
        tim1_Rezultat: tim1_Rezultat + (verovatnoca_pobede *20),
        tim2_Rezultat: tim2_Rezultat +((1- verovatnoca_pobede)*20)
    };
}

function prikazi_rezultate(utakmice) {
    utakmice.forEach(par => {
        const { tim1, tim2, rezultat } = par;
        console.log(`    ${tim1.Team} - ${tim2.Team} (${rezultat.tim1_Rezultat} : ${rezultat.tim2_Rezultat})`);
    });
}

function timovi_su_igrali_vec(podaci, tim1, tim2) {
    for (const grupa in podaci) {
        const timovi = podaci[grupa];
        if (timovi.some(t => t.Team === tim1) && timovi.some(t => t.Team === tim2)) {
            const tim1Index = timovi.findIndex(t => t.Team === tim1);
            const tim2Index = timovi.findIndex(t => t.Team === tim2);
            if (tim1Index !== -1 && tim2Index !== -1) {
                return true;
            }
        }
    }
    return false;
}

function parove_za_cetvrtfinale(sesirD, sesirG, propozicija) {
    const parovi = [];
    const preostali_D = [...sesirD];
    const preostali_G = [...sesirG];

    while (preostali_D.length > 0 && preostali_G.length > 0) {
        const timD = preostali_D.splice(Math.floor(Math.random() * preostali_D.length), 1)[0];
        const timG = preostali_G.splice(Math.floor(Math.random() * preostali_G.length), 1)[0];

        if (!propozicija.some(par => timovi_su_igrali_vec(podaci, par[0], timD) || timovi_su_igrali_vec(podaci, par[1], timG))) {
            parovi.push([timD, timG]);
        } else {
            preostali_D.push(timD);
            preostali_G.push(timG);
        }
    }

    return parovi;
}

function eliminaciona_faza(timovi) {
    const { sesirD, sesirE, sesirF, sesirG } = podeli_u_sesire(timovi);

    const forma = {};
    const svi_timovi = [...sesirD, ...sesirE, ...sesirF, ...sesirG];
    svi_timovi.forEach(tim => {
        forma[tim.Team] = ucitaj_iz_forme(tim.Team, prijateljske_utakmice);
    });

    const propozicija = [];
    const paroviCE = parove_za_cetvrtfinale(sesirD, sesirG, propozicija);
    const paroviDF = parove_za_cetvrtfinale(sesirE, sesirF, propozicija);

    let cetvrtfinale = [];
    cetvrtfinale = cetvrtfinale.concat(paroviCE.map(par => ({
        tim1: par[0],
        tim2: par[1],
        rezultat: simulacija_utakmice(par[0], par[1], forma)
    })));
    cetvrtfinale = cetvrtfinale.concat(paroviDF.map(par => ({
        tim1: par[0],
        tim2: par[1],
        rezultat: simulacija_utakmice(par[0], par[1], forma)
    })));

    console.log("\nČetvrtfinale:");
    prikazi_rezultate(cetvrtfinale);

    const pobednici_cetvrtfinala = cetvrtfinale.map(par => {
        return par.rezultat.tim1_Rezultat > par.rezultat.tim2_Rezultat ? par.tim1 : par.tim2;
    });

    let polufinale = [];
    for (let i = 0; i < pobednici_cetvrtfinala.length; i += 2) {
        polufinale.push({
            tim1: pobednici_cetvrtfinala[i],
            tim2: pobednici_cetvrtfinala[i + 1],
            rezultat: simulacija_utakmice(pobednici_cetvrtfinala[i], pobednici_cetvrtfinala[i + 1], forma)
        });
    }

    console.log("\nPolufinale:");
    prikazi_rezultate(polufinale);

    const pobednici_polufinala = polufinale.map(par => {
        return par.rezultat.tim1_Rezultat > par.rezultat.tim2_Rezultat ? par.tim1 : par.tim2;
    });
    const gubitnici_polufinala = polufinale.map(par => {
        return par.rezultat.tim1_Rezultat < par.rezultat.tim2_Rezultat ? par.tim1 : par.tim2;
    });

    let utakmica_za_treće_mesto = {
        tim1: gubitnici_polufinala[0],
        tim2: gubitnici_polufinala[1],
        rezultat: simulacija_utakmice(gubitnici_polufinala[0], gubitnici_polufinala[1], forma)
    };

    console.log("\nUtakmica za treće mesto:");
    prikazi_rezultate([utakmica_za_treće_mesto]);

    const pobednik_za_treće_mesto = utakmica_za_treće_mesto.rezultat.tim1_Rezultat > utakmica_za_treće_mesto.rezultat.tim2_Rezultat ? utakmica_za_treće_mesto.tim1 : utakmica_za_treće_mesto.tim2;

    let finale = {
        tim1: pobednici_polufinala[0],
        tim2: pobednici_polufinala[1],
        rezultat: simulacija_utakmice(pobednici_polufinala[0], pobednici_polufinala[1], forma)
    };

    console.log("\nFinale:");
    prikazi_rezultate([finale]);

    const pobednik_finala = finale.rezultat.tim1_Rezultat > finale.rezultat.tim2_Rezultat ? finale.tim1 : finale.tim2;

    console.log("\nMedalje:");
    console.log(`    1. ${pobednik_finala.Team}`);
    console.log(`    2. ${pobednici_polufinala.find(tim => tim !== pobednik_finala).Team}`);
    console.log(`    3. ${pobednik_za_treće_mesto.Team}`);
}

simulacija_grupe(podaci);
const svi_timovi = prikupi_timove(podaci);
eliminaciona_faza(svi_timovi);



































