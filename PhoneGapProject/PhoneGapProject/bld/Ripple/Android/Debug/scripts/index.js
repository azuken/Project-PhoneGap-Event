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
	var pictureSource;   // picture source
    var destinationType; // sets the format of returned value 

    // Wait for Cordova to connect with the device
    //
    document.addEventListener("deviceready",onDeviceReady,false);

    // Cordova is ready to be used!
    //
    function onDeviceReady() {
        pictureSource=navigator.camera.PictureSourceType;
        destinationType=navigator.camera.DestinationType;
    }

    // Called when a photo is successfully retrieved
    //
    function onPhotoDataSuccess(imageData) {
      // Uncomment to view the base64 encoded image data
      // console.log(imageData);

      // Get image handle
      //
      var smallImage = document.getElementById('smallImage');

      // Unhide image elements
      //
      smallImage.style.display = 'block';

      // Show the captured photo
      // The inline CSS rules are used to resize the image
      //
      smallImage.src = "data:image/jpeg;base64," + imageData;
    }

    // Called when a photo is successfully retrieved
    //
    function onPhotoURISuccess(imageURI) {
      // Uncomment to view the image file URI 
      // console.log(imageURI);

      // Get image handle
      //
      var largeImage = document.getElementById('largeImage');

      // Unhide image elements
      //
      largeImage.style.display = 'block';

      // Show the captured photo
      // The inline CSS rules are used to resize the image
      //
      largeImage.src = imageURI;
    }

    // A button will call this function
    //
    function capturePhoto() {
      // Take picture using device camera and retrieve image as base64-encoded string
      navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50,
        destinationType: Camera.DestinationType.DATA_URL });
    }

    // A button will call this function
    //
    function capturePhotoEdit() {
      // Take picture using device camera, allow edit, and retrieve image as base64-encoded string  
      navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 20, allowEdit: true,
        destinationType: destinationType.DATA_URL });
    }

    // A button will call this function
    //
    function getPhoto(source) {
      // Retrieve image file location from specified source
      navigator.camera.getPicture(onPhotoURISuccess, onFail, { quality: 50, 
        destinationType: destinationType.FILE_URI,
        sourceType: source });
    }

    // Called if something bad happens.
    // 
    function onFail(message) {
      alert('Failed because: ' + message);
    }
	
})(jQuery);