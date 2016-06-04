
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";


/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}


/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */
function generirajPodatke(stPacienta) {
  ehrId = "";

  // TODO: Potrebno implementirati

  return ehrId;
}


// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija

function vrniPlanTreninga() {
	
	
	var parameter = 'ciljiTek';
	preberiCustom(parameter);
	
	
}



/**
 * Kreiraj nov EHR zapis za pacienta in dodaj osnovne demografske podatke.
 * V primeru uspešne akcije izpiši sporočilo s pridobljenim EHR ID, sicer
 * izpiši napako.
 */
function kreirajEHRzaBolnika() {
	sessionId = getSessionId();

	var ime = $("#kreirajIme").val();
	var priimek = $("#kreirajPriimek").val();
	var spol = $("#kreirajSpol").val();
	var telesnaVisina = $("#kreirajTelesnaVisina").val();
	var trenutnaTelesnaTeza = $("#kreirajTrenutnaTelesnaTeza").val();
	var trenutnaFizPrip = $("#kreirajTrenutnaFizPrip").val();
	var ciljiTek = $("#kreirajCiljiTek").val();
	var ciljiTeza = $("#kreirajCiljiTeza").val();
	var treningiNaTeden = $("#kreirajTreningiNaTeden").val();
	
	
	if(spol == "Moški"){
		spol = "MALE";
	}else if(spol == "Ženski"){
		spol = "FEMALE";
	}else{
		spol = "";
	}
	
	
	if (!ime || !priimek || ime.trim().length == 0 ||
      priimek.trim().length == 0) {
		$("#kreirajSporocilo").html("<span class='obvestilo label " +
      "label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		$.ajax({
		    url: baseUrl + "/ehr",
		    type: 'POST',
		    success: function (data) {
		        var ehrId = data.ehrId;
		        
		        var partyData = {
		            firstNames: ime,
		            lastNames: priimek,
		            gender: spol,
		            partyAdditionalInfo: [
		            	{key: "ehrId", value: ehrId},
		            	{key: "telesnaVisina", value: telesnaVisina},
		            	{key: "trenutnaTelesnaTeza", value: trenutnaTelesnaTeza},
		            	{key: "trenutnaFizPrip", value: trenutnaFizPrip},
		            	{key: "ciljiTek", value: ciljiTek},
		            	{key: "ciljiTeza", value: ciljiTeza},
		            	{key: "treningiNaTeden", value: treningiNaTeden}
		            ]
		        };
		        $.ajax({
		            url: baseUrl + "/demographics/party",
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify(partyData),
		            success: function (party) {
		                if (party.action == 'CREATE') {
		                    $("#kreirajSporocilo").html("<span class='obvestilo " +
                          "label label-success fade-in'>Uspešno kreiran EHR '" +
                          ehrId + "'.</span>");
		                    $("#preberiEHRid").val(ehrId);
		                }
		            },
		            error: function(err) {
		            	$("#kreirajSporocilo").html("<span class='obvestilo label " +
                    "label-danger fade-in'>Napaka '" +
                    JSON.parse(err.responseText).userMessage + "'!");
		            }
		        });
		    }
		});
	}
}


/**
 * Za podan EHR ID preberi demografske podrobnosti pacienta in izpiši sporočilo
 * s pridobljenimi podatki (ime, priimek in datum rojstva).
 */
function preberiEHRodBolnika() {
	sessionId = getSessionId();

	var ehrId = $("#preberiEHRid").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#preberiSporocilo").html("<span class='obvestilo label label-warning " +
      "fade-in'>Prosim vnesite zahtevan podatek!");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				$("#preberiSporocilo").html("<span class='obvestilo label " +
          "label-success fade-in'>Bolnik '" + party.firstNames + " " + party.gender + " " +
          party.lastNames + "', ki se je rodil '" + party.dateOfBirth +
          "'.</span>");
			},
			error: function(err) {
				$("#preberiSporocilo").html("<span class='obvestilo label " +
          "label-danger fade-in'>Napaka '" +
          JSON.parse(err.responseText).userMessage + "'!");
			}
		});
	}
}


function preberiCustom(parameter) {
	var sessionId = getSessionId();
	$.ajaxSetup({
    headers: {"Ehr-Session": sessionId}
	});
	var ehr = $("#dodajPodatkeEHR").val();
	var searchData = [
	    {key: "ehrId", value: ehr}
	];
	$.ajax({
	    url: baseUrl + "/demographics/party/query",
	    type: 'POST',
	    contentType: 'application/json',
	    data: JSON.stringify(searchData),
	    success: function (res) {
	        for (i in res.parties) {
	            var party = res.parties[i];
	            var podatkiVrni;
	            for (j in party.partyAdditionalInfo) {
	                if (party.partyAdditionalInfo[j].key === parameter) {
	                    podatkiVrni = party.partyAdditionalInfo[j].value;
	                    break;
	                }
	            }
	            $("#izpisiPlanTreninga").append(
	            	'<div class="panel panel-default"><div class="panel-heading"><div class="row"><div class="col-lg-6 col-md-6 col-sm-6"><b>Plan treninga je sestavljen za uporabnika: '+party.firstNames + ' ' + party.lastNames + ', katerega cilj je: ' + podatkiVrni + '. <br></b>Treningi so sestavljeni, glede na vašo fizično pripravljenost in naj vam služijo kot vodilo pri dosegu vašega zastavljenega cilja. Podatke o tem koliko minut ste bili aktivni posamezni dan, kakšen je bil vaš povprečen srčni utrip in vaša telena teža vnašate v obrazec za vnašanje sprotnih meritev.</div></div></div></div>');
	            
	            	
				if(podatkiVrni == "Preteči 5km ni važno v kakšnem času - Nisem fizično aktiven"){
					var zapst = 1;
					for(j in treningi1){
						$("#izpisiPlanTreninga").append(
							'<div class="panel panel-default"><div class="panel-heading"><div class="row"><div class="col-lg-6 col-md-6 col-sm-6"><b>Trening</b>: '+zapst+'</div></div></div><div class="panel-body"><div>'+treningi1[j]+'</div></div></div>');
						zapst++;
					}
					
					
					
				}else if(podatkiVrni == "Preteči 5km v času 30-35min (6:00-7:00/km) - Nisem fizično aktiven"){
					
					
				}else if(podatkiVrni == "Preteči 5km v času 27:30-30min (5:30-6:00/km) - Občasna lažja fizična aktivnost"){
					
					
				}else if(podatkiVrni == "Preteči 5km v času 25-27:30min (5:00-5:30/km) - Občasna lažja fizična aktivnost"){
					
					
				}else if(podatkiVrni == "Preteči 5km v času 22:30-25min (4:30-5:00/km) - Večkrat na teden sem fizično aktiven"){
					
					
				}else if(podatkiVrni == "Preteči 5km v času 20-22:30min (4:00-4:30/km) - Večkrat na teden sem fizično aktiven"){
					
					
				}else if(podatkiVrni == "Preteči 5km v času pod 20min (pod 4:00/km) - Večkrat na teden sem fizično aktiven"){
					
					
				}
	  
	        }
	
	    }
	   
	});
	

}


/**
 * Za dodajanje vitalnih znakov pacienta je pripravljena kompozicija, ki
 * vključuje množico meritev vitalnih znakov (EHR ID, datum in ura,
 * telesna višina, telesna teža, sistolični in diastolični krvni tlak,
 * nasičenost krvi s kisikom in merilec).
 */
function dodajMeritveVitalnihZnakov() {
	sessionId = getSessionId();

	var ehrId = $("#dodajVitalnoEHR").val();
	var datumInUra = $("#dodajVitalnoDatumInUra").val();
	var telesnaVisina = $("#dodajVitalnoTelesnaVisina").val();
	var telesnaTeza = $("#dodajVitalnoTelesnaTeza").val();
	var telesnaTemperatura = $("#dodajVitalnoTelesnaTemperatura").val();
	var sistolicniKrvniTlak = $("#dodajVitalnoKrvniTlakSistolicni").val();
	var diastolicniKrvniTlak = $("#dodajVitalnoKrvniTlakDiastolicni").val();
	var nasicenostKrviSKisikom = $("#dodajVitalnoNasicenostKrviSKisikom").val();
	var merilec = $("#dodajVitalnoMerilec").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo " +
      "label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		var podatki = {
			// Struktura predloge je na voljo na naslednjem spletnem naslovu:
      // https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
		    "ctx/language": "en",
		    "ctx/territory": "SI",
		    "ctx/time": datumInUra,
		    "vital_signs/height_length/any_event/body_height_length": telesnaVisina,
		    "vital_signs/body_weight/any_event/body_weight": telesnaTeza,
		   	"vital_signs/body_temperature/any_event/temperature|magnitude": telesnaTemperatura,
		    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
		    "vital_signs/blood_pressure/any_event/systolic": sistolicniKrvniTlak,
		    "vital_signs/blood_pressure/any_event/diastolic": diastolicniKrvniTlak,
		    "vital_signs/indirect_oximetry:0/spo2|numerator": nasicenostKrviSKisikom
		};
		var parametriZahteve = {
		    ehrId: ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT',
		    committer: merilec
		};
		$.ajax({
		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    success: function (res) {
		        $("#dodajMeritveVitalnihZnakovSporocilo").html(
              "<span class='obvestilo label label-success fade-in'>" +
              res.meta.href + ".</span>");
		    },
		    error: function(err) {
		    	$("#dodajMeritveVitalnihZnakovSporocilo").html(
            "<span class='obvestilo label label-danger fade-in'>Napaka '" +
            JSON.parse(err.responseText).userMessage + "'!");
		    }
		});
	}
}


/**
 * Pridobivanje vseh zgodovinskih podatkov meritev izbranih vitalnih znakov
 * (telesna temperatura, filtriranje telesne temperature in telesna teža).
 * Filtriranje telesne temperature je izvedena z AQL poizvedbo, ki se uporablja
 * za napredno iskanje po zdravstvenih podatkih.
 */
function preberiMeritveVitalnihZnakov() {
	sessionId = getSessionId();

	var ehrId = $("#meritveVitalnihZnakovEHRid").val();
	var tip = $("#preberiTipZaVitalneZnake").val();

	if (!ehrId || ehrId.trim().length == 0 || !tip || tip.trim().length == 0) {
		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo " +
      "label label-warning fade-in'>Prosim vnesite zahtevan podatek!");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
	    	type: 'GET',
	    	headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				$("#rezultatMeritveVitalnihZnakov").html("<br/><span>Pridobivanje " +
          "podatkov za <b>'" + tip + "'</b> bolnika <b>'" + party.firstNames +
          " " + party.lastNames + "'</b>.</span><br/><br/>");
				if (tip == "telesna temperatura") {
					$.ajax({
  					    url: baseUrl + "/view/" + ehrId + "/" + "body_temperature",
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	if (res.length > 0) {
						    	var results = "<table class='table table-striped " +
                    "table-hover'><tr><th>Datum in ura</th>" +
                    "<th class='text-right'>Telesna temperatura</th></tr>";
						        for (var i in res) {
						            results += "<tr><td>" + res[i].time +
                          "</td><td class='text-right'>" + res[i].temperature +
                          " " + res[i].unit + "</td>";
						        }
						        results += "</table>";
						        $("#rezultatMeritveVitalnihZnakov").append(results);
					    	} else {
					    		$("#preberiMeritveVitalnihZnakovSporocilo").html(
                    "<span class='obvestilo label label-warning fade-in'>" +
                    "Ni podatkov!</span>");
					    	}
					    },
					    error: function() {
					    	$("#preberiMeritveVitalnihZnakovSporocilo").html(
                  "<span class='obvestilo label label-danger fade-in'>Napaka '" +
                  JSON.parse(err.responseText).userMessage + "'!");
					    }
					});
				} else if (tip == "telesna teža") {
					$.ajax({
					    url: baseUrl + "/view/" + ehrId + "/" + "weight",
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	if (res.length > 0) {
						    	var results = "<table class='table table-striped " +
                    "table-hover'><tr><th>Datum in ura</th>" +
                    "<th class='text-right'>Telesna teža</th></tr>";
						        for (var i in res) {
						            results += "<tr><td>" + res[i].time +
                          "</td><td class='text-right'>" + res[i].weight + " " 	+
                          res[i].unit + "</td>";
						        }
						        results += "</table>";
						        $("#rezultatMeritveVitalnihZnakov").append(results);
					    	} else {
					    		$("#preberiMeritveVitalnihZnakovSporocilo").html(
                    "<span class='obvestilo label label-warning fade-in'>" +
                    "Ni podatkov!</span>");
					    	}
					    },
					    error: function() {
					    	$("#preberiMeritveVitalnihZnakovSporocilo").html(
                  "<span class='obvestilo label label-danger fade-in'>Napaka '" +
                  JSON.parse(err.responseText).userMessage + "'!");
					    }
					});
				} else if (tip == "telesna temperatura AQL") {
					var AQL =
						"select " +
    						"t/data[at0002]/events[at0003]/time/value as cas, " +
    						"t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude as temperatura_vrednost, " +
    						"t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/units as temperatura_enota " +
						"from EHR e[e/ehr_id/value='" + ehrId + "'] " +
						"contains OBSERVATION t[openEHR-EHR-OBSERVATION.body_temperature.v1] " +
						"where t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude<35 " +
						"order by t/data[at0002]/events[at0003]/time/value desc " +
						"limit 10";
					$.ajax({
					    url: baseUrl + "/query?" + $.param({"aql": AQL}),
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	var results = "<table class='table table-striped table-hover'>" +
                  "<tr><th>Datum in ura</th><th class='text-right'>" +
                  "Telesna temperatura</th></tr>";
					    	if (res) {
					    		var rows = res.resultSet;
						        for (var i in rows) {
						            results += "<tr><td>" + rows[i].cas +
                          "</td><td class='text-right'>" +
                          rows[i].temperatura_vrednost + " " 	+
                          rows[i].temperatura_enota + "</td>";
						        }
						        results += "</table>";
						        $("#rezultatMeritveVitalnihZnakov").append(results);
					    	} else {
					    		$("#preberiMeritveVitalnihZnakovSporocilo").html(
                    "<span class='obvestilo label label-warning fade-in'>" +
                    "Ni podatkov!</span>");
					    	}

					    },
					    error: function() {
					    	$("#preberiMeritveVitalnihZnakovSporocilo").html(
                  "<span class='obvestilo label label-danger fade-in'>Napaka '" +
                  JSON.parse(err.responseText).userMessage + "'!");
					    }
					});
				}
	    	},
	    	error: function(err) {
	    		$("#preberiMeritveVitalnihZnakovSporocilo").html(
            "<span class='obvestilo label label-danger fade-in'>Napaka '" +
            JSON.parse(err.responseText).userMessage + "'!");
	    	}
		});
	}
}


$(document).ready(function() {

  /**
   * Napolni testne vrednosti (ime, priimek in datum rojstva) pri kreiranju
   * EHR zapisa za novega bolnika, ko uporabnik izbere vrednost iz
   * padajočega menuja (npr. Pujsa Pepa).
   */
  $('#preberiPredlogoBolnika').change(function() {
    $("#kreirajSporocilo").html("");
    var podatki = $(this).val().split(",");
    $("#kreirajIme").val(podatki[0]);
    $("#kreirajPriimek").val(podatki[1]);
    $("#kreirajDatumRojstva").val(podatki[2]);
  });

  /**
   * Napolni testni EHR ID pri prebiranju EHR zapisa obstoječega bolnika,
   * ko uporabnik izbere vrednost iz padajočega menuja
   * (npr. Dejan Lavbič, Pujsa Pepa, Ata Smrk)
   */
	$('#preberiObstojeciEHR').change(function() {
		$("#preberiSporocilo").html("");
		$("#preberiEHRid").val($(this).val());
	});

  /**
   * Napolni testne vrednosti (EHR ID, datum in ura, telesna višina,
   * telesna teža, telesna temperatura, sistolični in diastolični krvni tlak,
   * nasičenost krvi s kisikom in merilec) pri vnosu meritve vitalnih znakov
   * bolnika, ko uporabnik izbere vrednosti iz padajočega menuja (npr. Ata Smrk)
   */
	$('#preberiObstojeciVitalniZnak').change(function() {
		$("#dodajMeritveVitalnihZnakovSporocilo").html("");
		var podatki = $(this).val().split("|");
		$("#dodajVitalnoEHR").val(podatki[0]);
		$("#dodajVitalnoDatumInUra").val(podatki[1]);
		$("#dodajVitalnoTelesnaVisina").val(podatki[2]);
		$("#dodajVitalnoTelesnaTeza").val(podatki[3]);
		$("#dodajVitalnoTelesnaTemperatura").val(podatki[4]);
		$("#dodajVitalnoKrvniTlakSistolicni").val(podatki[5]);
		$("#dodajVitalnoKrvniTlakDiastolicni").val(podatki[6]);
		$("#dodajVitalnoNasicenostKrviSKisikom").val(podatki[7]);
		$("#dodajVitalnoMerilec").val(podatki[8]);
	});

  /**
   * Napolni testni EHR ID pri pregledu meritev vitalnih znakov obstoječega
   * bolnika, ko uporabnik izbere vrednost iz padajočega menuja
   * (npr. Ata Smrk, Pujsa Pepa)
   */
	$('#preberiEhrIdZaVitalneZnake').change(function() {
		$("#preberiMeritveVitalnihZnakovSporocilo").html("");
		$("#rezultatMeritveVitalnihZnakov").html("");
		$("#meritveVitalnihZnakovEHRid").val($(this).val());
	});

});


var treningi1 = [
	"Za ogrevanje 5 minut hitre hoje. Nato izmenično 60 sekund teci in 90 sekund hodi, skupaj za 20 minut. Vaje za moč in gibljivost (20 do 30 minut)", 
	"Za ogrevanje 5 minut hitre hoje. Nato izmenično 90 sekund teci in 2 minuti hodi. Skupaj za 20 minut. Vaje za moč in gibljivost (20 do 30 minut)", 
	"Za ogrevanje 5 minut hitre hoje, nato 2 ponovitvi sledeče vadbe: Tek 200 metrov (ali 90 sekund), Hoja 200 metrov (ali 90 sekund), Tek 400 metrov (ali 3 minute), Hoja 400 metrov (ali 3 minute). Vaje za moč in gibljivost (20 do 30 minut)",
	"Za ogrevanje 5 minut hitre hoje. Nato: Tek 800 metrov (ali 5 minut), Tek 800 metrov (ali 5 minut), Hoja 400 metrov (ali 3 minute), Tek 800 metrov (ali 5 minut). Vaje za moč in gibljivost (20 do 30 minut)",
	"Za ogrevanje 5 minut hitre hoje, nato : Tek 1,2 kilometra (ali 8 minut), Hoja 800 metrov (ali 5 minut), Tek 1,2 kilometra (ali 8 minut). Vaje za moč in gibljivost (20 do 30 minut)",
	"Za ogrevanje 5 minut hitre hoje, nato teci 3,2 kilometra (ali 20 minut) brez hoje. Vaje za moč in gibljivost (20 do 30 minut)",
	"Za ogrevanje 5 minut hitre hoje, nato teci 3,6 kilometra (ali 25 minutes) brez hoje. Vaje za moč in gibljivost (20 do 30 minut)",
	"Za ogrevanje 5 minut hitre hoje, nato teci 4 kilometre (ali 25 minut). Vaje za moč in gibljivost (20 do 30 minut)",
	"Za ogrevanje 5 minut hitre hoje. Nato tecite 4,5 kilometra (ali 28 minut). Vaje za moč in gibljivost (20 do 30 minut)",
	"Za ogrevanje 5 minut hitre hoje, nato teci 5 kilometrov (ali 30 minut). Vaje za moč in gibljivost (20 do 30 minut)"
	];
	
var treningi2 = [
	"Lahkoten tek (2 km; 6:30 min/km), Vaje za moč in gibljivost (20 do 30 minut)",
	"Lahkoten tek (3 km; 6:30 min/km), Vaje za moč in gibljivost (20 do 30 minut)",
	"Tempo tek (skupaj 4 km) - ogrevanje 1km- 3 km tempo tek (5:35 min/km)- iztek.  Vaje za moč in gibljivost (20 do 30 minut)",
	"Dolgi tek (6 km; 6:30). Raztezne vaje",
	"Intervalni trening (skupaj 5 km)- ogrevanje- 3 x 800m (čas 4:02; odmor 400m lahkotnega teka) - iztek",
	"Lahkoten tek (5 km; 6:30 min/km). Vaje za moč in gibljivost (20 do 30 minut)",
	"Intervalni trening (skupaj 10 km)- ogrevanje- 5 x 800m (čas 3:57; odmor 400m lahkotnega teka) - iztek"
	];