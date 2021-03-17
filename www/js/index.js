"use strict"

$(document).ready(function () {
    //aggancio dei sensori
    document.addEventListener("deviceready", function () {
        let _wrapper = $("#wrapper");
        let map = $(".map")[0];
        let mapID;
        let _boxImg = $("#boxImg");
        let _dettagli = $(".dettagli");
        let vetImg = [];
        let numImg = 0;
        let posizioneCorrente = {};
        let codOperator;
        let IdImgSelected;
        let contItem=0;

        let req = inviaRichiesta("GET", "https://rilievi-perizie-mina.herokuapp.com/api/operatorLogged");
        req.fail(errore);
        req.done(function (data) {
            codOperator = data[0]["codOperatore"];
        })

        let cameraOptions = {
            "quality": 50
        }

        let mapOptions = {
            center: { lat: 41.7012594, lng: 10.7566298 },
            "zoom": 5,
            "mapTypeId": google.maps.MapTypeId.ROADMAP
        }
        mapID = new google.maps.Map(map, mapOptions);
        navigator.geolocation.getCurrentPosition(success, onError, mapOptions);

        $("#btnScatta").on("click", function () {
            cameraOptions.sourceType = Camera.PictureSourceType.CAMERA;
            cameraOptions.destinationType = Camera.DestinationType.DATA_URL;
            navigator.camera.getPicture(onSuccess, error, cameraOptions);
        });


        $("#btnCerca").on("click", function () {
            cameraOptions.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
            cameraOptions.destinationType = Camera.DestinationType.DATA_URL;
            navigator.camera.getPicture(onSuccess, error, cameraOptions);
        });

        $("#btnLogout").on("click", function () {
            let request = inviaRichiesta("POST", "https://rilievi-perizie-mina.herokuapp.com/api/logout");
            request.fail(errore);
            request.done(function (data) {
                window.location.href = "./login.html";
            })
        })

        $("#btnInvia").on("click", function () {
            for (let item of vetImg) {
                if (item["desc"] != "") {
                    contItem++;
                    let request = inviaRichiesta("POST", "https://rilievi-perizie-mina.herokuapp.com/api/uploadPerizie",{"perizie":item});
                    request.fail(errore);
                    request.done(function (data) {
                        console.log("OK");
                    })
                }
                else
                {
                    alert("Prima devi inserire tutte le descrizioni");
                    return;
                }
            }

            if(contItem==vetImg.length)
            {
                _boxImg.empty();
                contItem=0;
                vetImg=[];
                alert("Tutte le immagini sono state caricate con successo!");
            }
            else
                alert("Errore nel caricamento");
        })

        $("#btnChiudi").on("click", function () {
            if ($("#description").val() != "") {
                vetImg[IdImgSelected]["desc"] = $("#description").val();
            }
            _dettagli.removeClass("show")
        })

        function success(position) {
            let currentPoint = new google.maps.LatLng(position.coords.latitude,
                position.coords.longitude);

            posizioneCorrente = {
                "lat": position.coords.latitude,
                "lng": position.coords.longitude
            }

            let markerID = new google.maps.Marker({
                position: currentPoint,
                map: mapID,
                title: "Questa è la tua posizione!"
            });
            mapID.setZoom(15);
            mapID.panTo(markerID.position);
        }

        function onError(err) {
            alert("ERRORE:" + err.code + " - " + err.message);
        }

        function onSuccess(image) {
            let _img = $("<img>").css({ "height": 60 }).prop("id", numImg).on("click", mostraDettagli);

            _img.prop("src", "data:image/jpeg;base64," + image);

            _img.appendTo(_boxImg);

            let info = {
                "id": numImg,
                "image": "data:image/jpeg;base64," + image,
                "lat": posizioneCorrente["lat"],
                "lng": posizioneCorrente["lng"],
                "codOp": codOperator,
                "desc": ""
            }
            vetImg.push(info);
            numImg++;


        }
        function mostraDettagli() {
            IdImgSelected = $(this).prop("id");
            _dettagli.addClass("show");

            $("#description").val("");
            $("#imgDettagli").prop("src", vetImg[IdImgSelected]["image"]).css({ "height": "300px", "width": "180px" });
            $("#idOp").html("Codice operatore: " + vetImg[IdImgSelected]["codOp"]).addClass("divStyles");
            $("#latitudine").html("Latitudine: " + vetImg[IdImgSelected]["lat"]).addClass("divStyles");
            $("#longitudine").html("Longitudine: " + vetImg[IdImgSelected]["lng"]).addClass("divStyles");
            $("#desc").html("Descrizione: " + vetImg[IdImgSelected]["desc"]).addClass("divStyles");
        }

        function error(err) {
            if (err.code)
                alert(err.code + "-" + err.message);
        }
    });
})