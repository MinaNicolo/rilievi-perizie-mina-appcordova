"use strict";

$(document).ready(function () {

    document.addEventListener("deviceready", function () {
        /***** LOGIN *****/
        let _lUsername = $("#lUsername");
        let _lPwd = $("#lPwd").hide();
        let _lNewPwd = $("#lNewPwd").hide();
        let _btnLogin = $("#btnLogin").hide();
        let _btnCheckUser=$("#checkUser");
        let _btnReturnBack=$(".return").hide();

        let isFirstAccess;

        $(document).on('keydown', function (event) {
            if (event.keyCode == 13)
                controllaLogin();
        });

        _btnCheckUser.on("click", function () {
            _lUsername.css("border", "");
            if (_lUsername.val() == "") {
                _lUsername.css("border", "1px solid red");
            }
            else {
                var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                if (isMobile && _lUsername.val().toUpperCase() != "ADMIN") {
                    let req = inviaRichiesta("POST", "https://rilievi-perizie-mina.herokuapp.com/api/accesso", { "username": _lUsername.val() })
                    req.fail(function (jqXHR, test_status, str_error) {
                        if (jqXHR.status == 401) {  // unauthorized
                            alert("Username errato");
                        } else
                            errore(jqXHR, test_status, str_error)
                    });
                    req.done(function (data) {
                        if (data[0]["alreadyAccess"] == false) {
                            _lPwd.show();
                            _lNewPwd.show();
                            isFirstAccess = true;
                        }
                        else {
                            _lPwd.show();
                            isFirstAccess = false;
                        }
                        _btnLogin.show();
                        _btnCheckUser.hide();
                        _btnReturnBack.show();
                        console.log(data);
                    })
                }
                else
                    alert("You can't access from mobile as ADMIN")
            }
        })

        _btnLogin.on("click", controllaLogin);

        _btnReturnBack.on("click",function(){
            _btnCheckUser.show();
            _lPwd.hide();
            _lNewPwd.hide();
            _btnLogin.hide();
            _btnReturnBack.hide();
        })

        function controllaLogin() {
            _lUsername.css("border", "");
            _lPwd.css("border", "");
            _lNewPwd.css("border", "");

            if (_lUsername.val() == "")
                _lUsername.css("border", "1px solid red");
            else if (_lPwd.val() == "")
                _lPwd.css("border", "1px solid red");
            else if (isFirstAccess) {
                if (_lNewPwd.val() == "")
                    _lNewPwd.css("border", "1px solid red");
                else {
                    let request = inviaRichiesta("POST", "https://rilievi-perizie-mina.herokuapp.com/api/login",
                        {
                            "username": _lUsername.val(),
                            "password": _lPwd.val()
                        }
                    );
                    request.fail(function (jqXHR, test_status, str_error) {
                        if (jqXHR.status == 401) {  // unauthorized
                            alert("Username o password errati");
                        } else
                            errore(jqXHR, test_status, str_error)
                    });
                    request.done(function (data) {
                        let req2 = inviaRichiesta("POST", "https://rilievi-perizie-mina.herokuapp.com/api/updatePassword",
                            {
                                "username": _lUsername.val(),
                                "newPwd": _lNewPwd.val()
                            })
                        req2.fail(errore);
                        req2.done(function (data) {
                            window.location.href = "./index.html";
                        })
                    })
                }
            }
            else {
                let request = inviaRichiesta("POST", "https://rilievi-perizie-mina.herokuapp.com/api/login",
                    {
                        "username": _lUsername.val(),
                        "password": _lPwd.val()
                    }
                );
                request.fail(function (jqXHR, test_status, str_error) {
                    if (jqXHR.status == 401) {  // unauthorized
                        alert("Username o password errati");
                    } else
                        errore(jqXHR, test_status, str_error)
                });
                request.done(function (data) {
                    window.location.href = "./index.html";
                })
            }
        }
    })
})