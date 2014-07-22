/// <reference path="capture.js" />
// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.

; (function ($) {
    "use strict";

    var user = '0';

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);

        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
    };

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };

    $('#btnLogin').on('click', function () {
        logIn($('#fieldLogin'));
    });

    $('#lnkNextEvent').on('click', function () {
        getNextEvent($('#menu'));
    });

    $('#lnkMyEvents').on('click', function () {
        getEvents('my');
    });

    $('#lnkAllEvents').on('click', function () {
        getEvents('all');
    });

    $('.btnBack').on('click', function () {
        var btnBack = $(this);

        var page = btnBack.closest('.page');
        $(page).hide(200);
        $('#menu').show(200);
    });

    $('.btnPicture').on('click', function () {
        capturePhoto();
    });


    $(document).on('click', '.listEvents li', function () {
        var element = $(this);

        var page = element.closest('.page');
        var id = element.attr("id");

        if ($('.listEvents li#subList' + id).length > 0) {
            if ($('.listEvents li#subList' + id).css('display') == 'none') {
                $('.listEvents li#subList' + id).show(200);
            } else {
                $('.listEvents li#subList' + id).hide(200);
            }
        } else {

            if (element.parent('ul').parent('li').length == 0 && element.attr('id').indexOf('subList') < 0) {
                $('#divShowEvent h4').text('');
                getEvent(id, page);
            }
        }
    });

    $(document).on('click', '.listEvents li ul li', function () {
        var element = $(this);

        var page = element.closest('.page');
        var id = element.parent('ul').parent('li').prev().attr('id');

        $('#divShowEvent h4').text('Sub-event of ' + element.parent('ul').parent('li').prev().find('.title').text());
        getEvent(element.attr('id'), page);
    });

    $('.btnSubscribe').on('click', function () {
        var element = $(this);
        if (element.text() == 'Subscribe') {
            subscribtionToEvent(element, 'POST');
        } else {
            subscribtionToEvent(element, 'DELETE');
        }
    });

    function logIn(email) {

        $.ajax({
            url: 'http://tpphonegapfaf.azurewebsites.net/api/personnes?email=' + email.val(),
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                
                user = data.ID;
                $('#divLogin').hide(200);
                $('#menu').show(200);

            },
            error: function (data) {
                alert("Error " + data.ID);

            }
        });

    }

    function showEvent(data, page) {
        $(page).hide(200);

        $('#divShowEvent div.btnSubscribe').attr('id', data.ID);
        $('#divShowEvent img').attr('src', 'images/' + data.ID + '.jpg');
        $('#divShowEvent h3').text(data.Titre);
        $('#divShowEvent h6').text(data.DateDebut + ' - ' + data.DateFin);

        $('#divShowEvent div#divLocation').text(data.Lieu);
        $('#divShowEvent div#divDescription').text(data.Description);

        if (page.attr('id') == 'divMyEvents') {
            $('#divShowEvent div.btnSubscribe').text('Unsubscribe');
        } else {
            $('#divShowEvent div.btnSubscribe').text('Subscribe');
        }
        
        $('.btnGeolocalisation').on('click', function () {
            window.location = 'geo:' + data.Latitude + ', ' + data.longitude + '?q=' + data.Lieu;
        });

        $('#divShowEvent').show(200);
    }

    function getEvent(id, page, success, error) {

        $.ajax({
            url: 'http://tpphonegapfaf.azurewebsites.net/api/evenements/' + id,
            type: 'GET',
            dataType: 'json',
            success: function (data) {

                showEvent(data, page);

            },
            error: function (data) {
                alert("Error " + data);

            }
        });
    }

    function getEvents(type, success, error) {

        var url, div, parent, date, dateBegin, dateEnd;

        if (type == 'all') {
            url = 'http://tpphonegapfaf.azurewebsites.net/api/personnes/' + user + '/evenements/nonparticipant'
            div = '#divAllEvents';
        } else {
            url = 'http://tpphonegapfaf.azurewebsites.net/api/personnes/' + user + '/evenements'
            div = '#divMyEvents';
        }

        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            success: function (data) {

                $(div + ' ul.listEvents').empty();

                for (var i = 0; i < data.length; i++) {

                    dateBegin = new Date(data[i].DateDebut);
                    dateEnd = new Date(data[i].DateFin);

                    date = 'Du ' + dateBegin.getDate() + '/' +
                                   dateBegin.getMonth() + '/' +
                                   dateBegin.getFullYear() +
                           ' Au ' + dateEnd.getDate() + '/' +
                                    dateEnd.getMonth() + '/' +
                                    dateEnd.getFullYear();

                    parent = '<li id="' + data[i].ID + '"><span class="title">' +
                        data[i].Titre + '</span> - <span class="date">' + date + '</span></li>';

                    getChildren(data[i].ID, div, parent, type);
                }


                $('#menu').hide(200);
                $(div).show(200);

            },
            error: function () {
                alert("Error " + data);

            }
        });

    }

    function getNextEvent(element, success, error) {

        $.ajax({
            url: 'http://tpphonegapfaf.azurewebsites.net/api/evenements/next',
            type: 'GET',
            dataType: 'json',
            success: function (data) {

                showEvent(data, element);

            },
            error: function (data) {
                alert("Error " + data);

            }
        });

    }

    function getChildren(id, div, parent, type, success, error) {

        var url, hour, hourBegin, hourEnd;

        if (type == 'all') {
            url = 'http://tpphonegapfaf.azurewebsites.net/api/personnes/' + user + '/evenements/' + id + '/fils/nonparticipant'
        } else {
            url = 'http://tpphonegapfaf.azurewebsites.net/api/personnes/' + user + '/evenements/' + id + '/fils'
        }

        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            success: function (data) {

                $(div + ' ul.listEvents').append(parent);

                if (data[0] != null) {
                    $(div + ' ul.listEvents').append('<li id="subList' + data[0].Evenement_ID + '" class="subList"><ul>');
                }

                for (var i = 0; i < data.length; i++) {

                    hourBegin = new Date(data[i].DateDebut);
                    hourEnd = new Date(data[i].DateFin);

                    hour = hourBegin.getHours() + ':' + hourBegin.getMinutes() + ' - ' + hourEnd.getHours() + ':' + hourEnd.getMinutes();

                    $(div + ' ul.listEvents li#subList' + data[i].Evenement_ID + ' ul').append('<li id="' + data[i].ID +
                        '"><span class="title">' + data[i].Titre + '</span> - <span class="date">' + hour + '</span></li>');
                }

                if (data[0] != null) {
                    $(div + ' ul.listEvents').append('</ul></li>');
                }

            },
            error: function (data) {
                alert("Error " + data);

            }
        });
    }

    function subscribtionToEvent(element, type, success, error) {

        $.ajax({
            url: 'http://tpphonegapfaf.azurewebsites.net/api/personnes/' + user + '/evenements?evenementId=' + element.attr('id'),
            type: type,
            dataType: 'json',
            success: function () {

                changeEventState(element, type)

            },
            error: function () {

                alert("Error " + data);

            }
        });
    }

    function changeEventState(element, type) {
        if (type == 'POST') {
            element.text('Unsubscribe');
        } else {
            element.text('Subscribe');
        }
    }

	
	//Pour la capture de photos
	var npath='';
	
	function sendform(){
		var options = new FileUploadOptions();
		options.fileKey="file";
		options.fileName=npath.substr(npath.lastIndexOf('/')+1);
		options.mimeType="image/jpeg";

		var nomimage = Math.floor(Math.random()*15000000);
		var ft = new FileTransfer();
		ft.upload(npath, upload_url + '?nomimage=' + nomimage , 
			successCallback,
			errorCallback,
		    options);
	}
	
	function capturePhoto() {
		//navigator.notification.alert("test", null, '');
	    navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50, targetWidth:600  });
	}
	
	function onFail(){
		var msg ='Impossible de lancer l\'appareil photo';
        navigator.notification.alert(msg, null, '');
	}
	
	function onPhotoDataSuccess(imageData) {
		// On récupère le chemin de la photo
		npath = imageData.replace("file://localhost",'');
		var path = imageData.replace("file://localhost",'');
		
		// On affiche la preview
		$('#myImage').attr('src', path);
		$('#myImage').show();
		
		// On affiche le boutton de suppression
		$('#button_deletePhoto').show();
	}
	
	function deletePhoto(){
		$('#myImage').attr('src', '');
		$('#myImage').hide();
		$('#button_deletePhoto').hide();
	}
	
})(jQuery);