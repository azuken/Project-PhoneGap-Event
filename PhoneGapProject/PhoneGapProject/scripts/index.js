// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.

; (function ($) {
    "use strict";

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

    $('#lnkNextEvent').on('click', function () {
        $('#menu').hide(200);
        $('#divNextEvent').show(200);
    });

    $('#lnkMyEvents').on('click', function () {
        $('#menu').hide(200);
        $('#divMyEvents').show(200);
    });

    $('#lnkAllEvents').on('click', function () {
        $('#menu').hide(200);
        $('#divAllEvents').show(200);
    });

    $('.btnBack').on('click', function () {
        var btnBack = $(this);

        var page = btnBack.closest('.page');
        $(page).hide(200);
        $('#menu').show(200);
    });

    $('.listEvents li').on('click', function () {
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
                showEvent(element, id, page);
            }
        }
    });

    $('.listEvents li ul li').on('click', function () {
        var element = $(this);

        var page = element.closest('.page');
        var id = element.parent('ul').parent('li').prev().attr('id');

        $('#divShowEvent h4').text('Sub-event of ' + element.parent('ul').parent('li').prev().find('.title').text());
        showEvent(element, id, page);
    });

    $('.btnSubscribe').on('click', function () {
        var element = $(this);

        if (element.text() == 'Subscribe') {
            element.text('Unsubscribe');
        } else {
            element.text('Subscribe');
        }
    });

    function showEvent(element, id, page) {
        $(page).hide(200);

        $('#divShowEvent div.btnSubscribe').attr('id', id);
        $('#divShowEvent img').attr('src', 'images/' + id + '.jpg');
        $('#divShowEvent h3').text(element.find('span.title').text());
        $('#divShowEvent h6').text(element.find('span.date').text());

        $('#divShowEvent div#divLocation').text("Location");
        $('#divShowEvent div#divDescription').text("Here is the description.");

        $('#divShowEvent').show(200);
    }

})(jQuery);