"use strict";
/* Custom script */
(function ($) {
    "use strict";
    /* global variables */
    var $document = $(document),
        $window = $(window),
        $htmlBody = $('html, body'),
        $body = $('body'),
        navHeight = 80,
        $scrollToTop = $('.scroll-up'),
        $navbar = $('#menubar'),
        $logomenubar = $('#menubar').find('.custom-logo'),
        $bodyheight = $(window).height(),
        $widgetContactTogglerHeight = $(".widget-contact-toggler").innerHeight(),
        $videoPrimary = $('#video-primary');

    /* Functions */

    /**
     * Remove parameter from Url
     * @param {*} key 
     * @param {*} sourceURL 
     */
    function removeParam(key, sourceURL) {
        var rtn = sourceURL.split("?")[0],
            param,
            params_arr = [],
            queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
        if (queryString !== "") {
            params_arr = queryString.split("&");
            for (var i = params_arr.length - 1; i >= 0; i -= 1) {
                param = params_arr[i].split("=")[0];
                if (param === key) {
                    params_arr.splice(i, 1);
                }
            }
            rtn = rtn + "?" + params_arr.join("&");
        }
        return rtn;
    }

    // Fire Owl Carousel
    function fireOwlCarousel() {
        $('.owl-carousel').owlCarousel({
            rtl: false,
            loop: false,
            margin: 30,
            mouseDrag: true,
            touchDrag: false,
            nav: true,
            navText: ['<i class="fas fa-angle-left fa-3x py-2" aria-hidden="true"></i>', '<i class="fas fa-angle-right fa-3x py-2" aria-hidden="true"></i>'],
            responsive: {
                0: {
                    items: 1,
                    mouseDrag: false,
                    touchDrag: true
                },
                600: {
                    items: 2,
                    mouseDrag: false,
                    touchDrag: true
                },
                1000: {
                    items: 3
                }
            }
        });
    }

    // Open New Window
    function openNewWindow($url) {
        var win = window.open($url, '_blank');
        if (win) {
            //Browser has allowed it to be opened
            win.focus();
        } else {
            //Browser has blocked it
            alert('Please allow popups for this website');
        }
    }

    // Maps destination
    function getDirectionMaps($action) {
        var $latitude = $('#latitude').val();
        var $longitude = $('#longitude').val();
        var $url = '';

        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            if ((navigator.platform.indexOf("iPhone") != -1) ||
                (navigator.platform.indexOf("iPod") != -1) ||
                (navigator.platform.indexOf("iPad") != -1)) {
                $url = "maps://maps.google.com/maps?daddr=" + $latitude + ',' + $longitude + "&amp;ll=";
            } else {
                $url = "https://maps.google.com/maps?daddr=" + $latitude + ',' + $longitude + "&amp;ll=";
            }
        }
        else {
            if (navigator.geolocation) {
                if ($action === 'initUrl') return $url;

                var options = {
                    enableHighAccuracy: true,
                    timeout: 60000,
                    maximumAge: 100
                };

                navigator.geolocation.getCurrentPosition(function (position) {
                        $url = "https://www.google.co.ma/maps/dir/" + position.coords.latitude + ',' + position.coords.longitude + '/' + $latitude + ',' + $longitude;
                        $('#link-map').attr('href', $url);
                        openNewWindow($url);
                    },
                    function (error) {
                        console.log(error.message);
                        $url = "https://www.google.com/maps/dir/?api=1&origin=&destination=" + $latitude + ',' + $longitude;
                        $('#link-map').attr('href', $url);
                        openNewWindow($url);
                    }, options);

            } else {
                $url = "https://www.google.com/maps/dir/?api=1&origin=&destination=" + $latitude + ',' + $longitude;
            }
        }
        
        return $url;
    }

    // Get what the user want from us
    function getwishvalues() {
        var $options = [];

        $('.form-check-input', "#wish-form1").each(function () {
            if ($(this).is(":checked")) {
                $options.push($(this).val());
            }
        });

        return $options;
    }

    // Check Custom Validity
    function isEmail($email) {
        var $regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return $regex.test($email);
    }

    function isPhone($phone) {
        var $regex = /^[0]([0-9]{9})$/;
        return $regex.test($phone);
    }

    function checkCustomValidity($form) {

        var $res = 0;
        $(".require").hide();
        $(".invalid").hide();
        
        // check email fild if invalid
        var $email = $('#email-form1');
        if (!isEmail($email.val()) && $email.val() != '') {
            $email.prev("label").find(".invalid").fadeIn();
            scrollToCheck($form, $email);
            $(this).focus();
            return false;
        }

        // check phone fild if invalid
        var $phone = $('#phone-form1');
        if (!isPhone($phone.val()) && $phone.val() != '') {
            $phone.prev("label").find(".invalid").fadeIn();
            scrollToCheck($form, $phone);
            $(this).focus();
            return false;
        }

        // check require filds if empty
        $(".form-control", $form).each(function () {

            if ($(this).val() == "") {
                $(this).prev("label").find(".require").fadeIn();
                scrollToCheck($form, $(this));
                $(this).focus();
                $res = 1;
                return false;
            }
        });

        if ($res == 1) return false;

        return true;
    }

    // Scroll to check
    function scrollToCheck($form, $field) {

        var $scrollbar = $htmlBody,
            $fieldId = $field.attr('id'),
            $scrollpoint = $field.prev('label').offset().top - $navbar.outerHeight();

        if ($form.attr('id') == 'contact_form_widget') {
            $scrollbar = $form.parent();
            $scrollpoint = document.getElementById($fieldId).offsetTop - 40;
        }

        scrollToTop($scrollpoint, $scrollbar);

    }

    // Scroll to top
    function scrollToTop($scrollpoint = 0, $scrollbar = $htmlBody) {
        
        $scrollbar.animate({
            scrollTop: $scrollpoint
        }, 800);
    }

    /* Contact - send mail */

    // Send mail
    function send_mail($form, $btnForm) {

        $btnForm.attr('disabled', 'disabled');
        var dataString = $form.serialize();

        return $.ajax({
            type: "POST",
            url: $form.attr('action'),
            datatype: "html",
            data: {
                'action': 'mnazsending_mail',
                'info': dataString,
                'options': getwishvalues()
            }
        });
    }

    // Get contact widget ready to adapt it with screen
    function getContactWidgetReady($display) {

        // variables declaration
        var $display = typeof $display !== 'undefined' ? $display : 'default';
        var $bodyHeight = $(window).height(),
            $widgetContact = $("#widget-contact"),
            $widgetContactHeight = $widgetContact.height(),
            $distTop = $widgetContact.position().top,
            $distBtm = 0,
            $widgetContactForm = $(".widget-contact-form"),
            $widgetContactToggler = $(".widget-contact-toggler");
            
        // Responsive widget Contact Toggler vertically
        if ($bodyHeight > $widgetContactTogglerHeight + $distTop + $distBtm) {
            $widgetContactToggler.find('.verticalAdapt').show();
        } else {
            $widgetContactToggler.find('.verticalAdapt').hide();
        }

        // if widget Contact Form is hide (there is no need)
        if ($widgetContactForm.css('display') == 'none') return;

        // Update height widget and update scroll
        // if body height is not enough to show widget completely
        // or body height is enough to show widget completely
        if (($bodyHeight <= ($widgetContactHeight + $distTop)) ||
            ($("#contact_form_widget").height() > $widgetContactHeight)) {
            var $wedgetheight = $bodyHeight - $distTop - $distBtm;
            $widgetContact.height($wedgetheight);

            $widgetContactForm.css('overflow-y', 'scroll');
        } else {
            $distTop = ($bodyHeight - $widgetContactHeight) / 2;
            $widgetContact.css({ top: $distTop + 'px' });

            $widgetContactForm.css('overflow-y', 'hidden');
            $widgetContact.css('height', 'auto');
        }

        $widgetContactForm.css('overflow-x', 'hidden');

        // Default state is hide widget and close
        if ($display == 'default') {
            $widgetContactToggler.find(".fa-angle-right").hide();
        }
    }

    // Get video ready to adapt it with screen
    function getVideoHeightReady() {

        var iframeheight = $videoPrimary.width() * 56.25 / 100;
        if (iframeheight > $bodyheight - 100) {
            iframeheight = $bodyheight - 100;
        }

        $videoPrimary.find('iframe').height(iframeheight);
    }

    // widget Contact Toggler
    function widgetContactToggler($state = 'toggle') {

        var $widgetContact = $("#widget-contact"),
            $val = $widgetContact.css("right");

        if ($state == 'close') $val = '0px';
        if ($state == 'open') $val = 'open';

        if ($val == '0px') {
            $widgetContact.animate({
                right: '-315px'
            }, function () {
                $(this).find(".fa-angle-left").show();
                $(this).find(".fa-angle-right").hide();
            });

        } else {

            $widgetContact.find('*').filter(':input:visible:first').focus();
            $widgetContact.find(".fa-angle-left").hide();
            $widgetContact.find(".fa-angle-right").show();
            getContactWidgetReady('keepit');

            $widgetContact.animate({
                right: '0'
            });
        }
    }

    /*
     * Window load
     */
    $(window).on("load", function () {

        /* Clear filter */
        var $clearFilterBtn = $('#clear-filter');
        if ($clearFilterBtn.length > 0) {
            var $url = location.href;
            $clearFilterBtn.on('click', function () {
                var $allFilters = $(this).attr('data-filters').split(',');
                for (let i = 0; i < $allFilters.length; i++) {
                    $url = removeParam($allFilters[i], $url);
                }
                window.location.replace($url);
            })
        }

        /* EXEC: Maps destination */
        if ($('#link-map').length > 0) {
            $('#link-map').on('click', function (e) {
                if ($(this).attr('href') !== '') return;

                e.preventDefault();        
                getDirectionMaps();
            })

            var $url = getDirectionMaps('initUrl');
            $('#link-map').attr('href', $url).removeClass('hide');
            $('#linkmap_loading').hide();
        }

        /* Carousel project fire swipe behavior */
        if ($('#carouselproject').length === 1) {
            $("#carouselproject").carousel({
                swipe: 30 // percent-per-second, default is 50. Pass false to disable swipe
            });
        }

        /* Carousel testimonial fire swipe behavior */
        if ($('#carouseltestimonial').length === 1) {
            $("#carouseltestimonial").carousel({
                swipe: 30 // percent-per-second, default is 50. Pass false to disable swipe
            });
        }

        /* Add title to iframe & noopener rel to href link */
        if ($('.acf-map').length >= 1) {
            $('.acf-map').each(function () {
                $(this).find('iframe').attr("title", "Localisation");
            });

            setTimeout(function () {
                $('a, .acf-map').each(function () {
                    $(this).attr("rel", "noopener noreferrer");
                });
            }, 3000);
        }

        /* Videos */
        var $videogallery = $('#video-gallery');
        if ($videogallery.length === 1) {

            var videos = [];
            // to get it as array in php
            videos.push($("#videolinks").val());

            $.ajax({
                type: "POST",
                url: $('#urlwebroot').val() + "/wp-admin/admin-ajax.php",
                datatype: "html",
                data: { 'action': 'mnazget_videos', 'videos': videos },
                success: function (response) {
                    $videogallery.addClass("owl-carousel owl-theme")
                    .hide().html(response).fadeIn('slow');

                    /* Fire: owl-carousel */
                    fireOwlCarousel();

                    // Hide play from current video
                    $videogallery.find('.currentvideo .fa-play').hide();
                    $videogallery.find('.currentvideo .video-dark-overlay').hide();

                    // Play Video function
                    $videogallery.on('click', '.fa-play', function (e) {

                        // Reset current video style
                        $videogallery.find('.currentvideo')
                            .removeClass("currentvideo rounded")
                            .find('.fa-play').show()
                            .parent().find('.video-dark-overlay').show();

                        // Activate clicked video style
                        $(this).parent().addClass("currentvideo rounded")
                            .find('.video-dark-overlay').hide();

                        // play video by changing iframe
                        $videoPrimary.find('iframe').attr('src', 'https://www.youtube.com/embed/' + $(this).parent().find('img').attr('alt') + '?rel=0&autoplay=1');
                        // hide fa-play tag
                        $(this).hide();

                        // Scroll to the top of the video iframe
                        scrollToTop($videoPrimary.offset().top - 90);

                    });

                }, error: function (response) {
                    $('#res_contact').html(response);
                }
            });
        }

        // Video intro popup
        var $videoIntro = $('#video-intro');
        if ($videoIntro.length === 1) {
            $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
                disableOn: 700,
                type: 'iframe',
                mainClass: 'mfp-fade',
                removalDelay: 160,
                preloader: false,
                fixedContentPos: false
            });
        }
    });

    /*
    * Document ready
    */
    $document.ready(function () {

        // Loading hide
        $(".preloader").fadeOut();
        $("html, body").css('overflow', 'visible');

        // Window scroll 
        $window.on('scroll', function () {

            // Description: Stop the currently-running animation on the matched elements.
            // $logomenubar.stop();

            // if( $window.width() > 768 )  // TABLETS - MOBILE LANDSCAPE
            //{
            if ($document.scrollTop() > navHeight) {
                /** logo_react navigation */
                // $logomenubar.stop().addClass('logo_react');
                /** Scroll to top */
                $scrollToTop.fadeIn();
            } else if ($document.scrollTop() < 60) {
                /** logo_react navigation */
                // $logomenubar.stop().removeClass('logo_react');
                /** Scroll to top */
                $scrollToTop.fadeOut();
            }
            // }
        });

        // Enable tooltips everywhere
        $('[data-toggle="tooltip"]').tooltip();

        // Share button
        $(".share-action").on("click", function () {
            $(this).parent().find('.share_unit').toggle();
        });

        // Read More
        var $readmore = $(".readmore");
        if ($readmore.length >= 1) {

            var originheight = $readmore.outerHeight();
            $readmore.css({
                height: '800px',
                overflow: 'hidden'
            });

            $(".readmore-toggel").on("click", function () {

                $readmore = $(this).parent('.readmore');

                if ($readmore.height() > 800) {

                    $readmore.animate({
                        height: '800px',
                        overflow: 'hidden'
                    });

                    $(this).html('Lire la suite');
                }
                else {
                    $readmore.animate({
                        height: originheight,
                        overflow: 'none'
                    });

                    $(this).html('Moins');
                }
            });
        }

        // Primary Video
        if ($videoPrimary.length >= 1) {
            // EXEC get Video Height Ready
            getVideoHeightReady();
            // EXEC if window resize
            $(window).resize(function () {
                getVideoHeightReady();
            });
        }

        // Click event to scroll to top
        $('.go-contactus, .scroll-up').click(function (e) {

            if ($(this).hasClass('go-contactus') == 'go-contactus') {
                e.preventDefault();
                $("#fname-form1").focus();
            }

            scrollToTop();
            return false;
        });

        // partenaires-logos animation
        if (typeof $('.customer-logos').slick == 'function') {
            $('.customer-logos').slick({
                slidesToShow: 4,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 1000,
                arrows: false,
                dots: false,
                pauseOnHover: false,
                responsive: [{
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 2,
                        autoplay: false
                    }
                }, {
                    breakpoint: 520,
                    settings: {
                        slidesToShow: 1,
                        autoplay: false
                    }
                }]
            });
        }

        // Saled host slider
        if (typeof $('.owl-carousel').owlCarousel == 'function') {
            fireOwlCarousel();
        }

        /* Contact - send mail */

        // EXEC Send mail via contact page & contact widget
        $("#contact_form, #contact_form_widget").on('submit', function (e) {

            e.preventDefault();

            var $resForm = $('#res_contact');
            var $btnForm = $(this).find(':submit');
            var $form = $(this);

            // EXEC check Custom Validity
            if (checkCustomValidity($form) == false) return;

            send_mail($form, $btnForm).done(function (response) {

                var $default_alert,
                    $alert,
                    $project_id;

                if ($form.attr('id') == 'contact_form_widget') {
                    $default_alert = '';
                    $alert = $.trim($(response).text());
                    $project_id = $form.find('#interet-form1').val();
                } else {
                    $default_alert = $resForm.html();
                    $alert = response;
                    $project_id = $form.find('#interet').val();
                }

                if (response === 'sent')
                {
                    var origin = location.origin === "http://localhost" ? 'http://localhost/taoui/immobilier': location.origin;
                    window.location = origin + '/page-de-remerciement/' + $project_id;
                    return;
                }

                $resForm.html($alert);
                setTimeout(function () {
                    $resForm.fadeOut('slow', function () {
                        $(this).html($default_alert).fadeIn('slow');
                    });
                }, 5000);

            }).fail(function (response) {
                $resForm.html(response);
            }).always(function () {
                $btnForm.removeAttr('disabled');
                if ($form.attr('id') == 'contact_form') scrollToTop();
                else scrollToTop(0, $form.parent());
            });

        });

        /* Contact Widget */
        var $contact_widget = $('#widget-contact');
        if ($contact_widget.length === 1) {

            // Display contact widget in the single page
            // Display contact widget from project card
            $('#contact_widget, .contact-action').on("click", function () {

                widgetContactToggler('open');
                var $message = $("#contact_widget_message").html();
                var $interet = $(this).attr('data-interet');
                $("#message-form1").html($.trim($message));
                $("#interet-form1").val($.trim($interet));

            });

            // EXEC get Contact Widget Ready
            getContactWidgetReady();
            // EXEC if window resize
            $(window).resize(function () {
                getContactWidgetReady('keepit');
            });

            /* Close widget if click outside it */
            $(window).click(function(e) {

                var $wc = $("#widget-contact");
                var $btnopen = $("#contact_widget");
                var $iconopen = $(".contact-action-icon");
                
                if ($.inArray(e.target, $iconopen)>-1 || $btnopen.is(e.target) || $wc.is(e.target) || $wc.has(e.target).length >= 1) 
                    return;
                
                // close widget contact
                if ($wc.find(".widget-contact-form").css('display') == "none") return;
                widgetContactToggler('close');
            });

            // keep dropdownwish open while user can choose multiple
            $("#dropdownwish").next('.dropdown-menu').on("click", function (event) {
                event.stopPropagation();
            });

            // CALL widget Contact Toggler
            $(".widget-contact-toggler").on("click", widgetContactToggler);
        }

        // Licence
        $('#Mohcine_NAZ').load($('#urlwebroot').val() + '/LICENSE.html');
        $('html').attr('data-madeby', 'Made by Mohcine NAZ - Mr.NAZ as (Freelancer) Senior Full Stack Web Developer');
        
    });

})(jQuery);

/* Google Maps Wordpress */
(function ($) {

    /*
    *  new_map
    *
    *  This function will render a Google Map onto the selected jQuery element
    *
    *  @type    function
    *  @date    8/11/2013
    *  @since   4.3.0
    *
    *  @param   $el (jQuery element)
    *  @return  n/a
    */

    var displayfirstmarker = 0;
    var marksinfo = [];
    function new_map($el) {

        // var
        var $markers = $el.find('.marker');


        // vars
        var args = {
            zoom: 5,
            center: new google.maps.LatLng(0, 0),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.BOTTOM_CENTER
            },
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.LEFT_CENTER
            },
            scaleControl: true,
            streetViewControl: false,
            streetViewControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER
            },
            fullscreenControl: true,
            fullscreenControlOptions: {
                position: google.maps.ControlPosition.LEFT_CENTER
            }
        };


        // create map               
        var map = new google.maps.Map($el[0], args);


        // add a markers reference
        map.markers = [];


        // add markers
        $markers.each(function () {

            add_marker($(this), map);

        });


        // center map
        center_map(map);


        // return
        return map;

    }

    /*
    *  add_marker
    *
    *  This function will add a marker to the selected Google Map
    *
    *  @type    function
    *  @date    8/11/2013
    *  @since   4.3.0
    *
    *  @param   $marker (jQuery element)
    *  @param   map (Google Map object)
    *  @return  n/a
    */

    function add_marker($marker, map) {

        // var
        var latlng = new google.maps.LatLng($marker.attr('data-lat'), $marker.attr('data-lng'));

        // create marker
        var marker = new google.maps.Marker({
            position: latlng,
            map: map
        });

        // add to array
        map.markers.push(marker);

        // if marker contains HTML, add it to an infoWindow
        if ($marker.html()) {
            // create info window
            var infowindow = new google.maps.InfoWindow({
                content: $marker.html(),
                maxWidth: $(window).width() - 100
            });

            marksinfo.push(infowindow);

            // show info window when marker is clicked
            google.maps.event.addListener(marker, 'click', function () {

                marksinfo.forEach(function (element) {
                    element.close();
                });

                infowindow.open(map, marker);

            });

            /*google.maps.event.addDomListener(window, 'resize', function() {
                infoWindowLinea.setContent(infoWindowLinea.getContent());
            });*/

            if (displayfirstmarker == 0) infowindow.open(map, marker);

            displayfirstmarker++;

        }

    }

    /*
    *  center_map
    *
    *  This function will center the map, showing all markers attached to this map
    *
    *  @type    function
    *  @date    8/11/2013
    *  @since   4.3.0
    *
    *  @param   map (Google Map object)
    *  @return  n/a
    */

    function center_map(map) {

        // vars
        var bounds = new google.maps.LatLngBounds();

        // loop through all markers and create bounds
        $.each(map.markers, function (i, marker) {

            var latlng = new google.maps.LatLng(marker.position.lat(), marker.position.lng());

            bounds.extend(latlng);

        });

        // only 1 marker?
        if (map.markers.length == 1) {
            // set center of map
            map.setCenter(bounds.getCenter());
            map.setZoom(16);
        }
        else {
            // fit to bounds
            google.maps.event.addListener(map, 'zoom_changed', function () {
                const zoomChangeBoundsListener =
                    google.maps.event.addListener(map, 'bounds_changed', function (event) {
                        if (this.initialZoom == true) {
                            // Change max/min zoom here
                            this.setZoom(11);
                            this.initialZoom = false;
                        }
                        google.maps.event.removeListener(zoomChangeBoundsListener);
                    });
            });
            map.initialZoom = true;
            map.fitBounds(bounds);
            // OR 
            //map.setCenter( bounds.getCenter() );
            //map.setZoom( 12 );
        }

    }


    /*
    *  document ready
    *
    *  This function will render each map when the document is ready (page has loaded)
    *
    *  @type    function
    *  @date    8/11/2013
    *  @since   5.0.0
    *
    *  @param   n/a
    *  @return  n/a
    */
    // global var
    var map = null;

    $(document).ready(function () {

        $('.acf-map').each(function () {

            // create map
            map = new_map($(this));

        });

    });

})(jQuery);

/* Adding swipe behavior to Bootstrap's Carousel */
+function ($) {
    'use strict';

    if (!$.fn.carousel) {
        throw new Error("carousel-swipe required bootstrap carousel")
    }

    // CAROUSEL CLASS DEFINITION
    // =========================

    var CarouselSwipe = function (element) {
        this.$element = $(element)
        this.carousel = this.$element.data('bs.carousel')
        this.options = $.extend({}, CarouselSwipe.DEFAULTS, this.carousel.options)
        this.startX =
            this.startY =
            this.startTime =
            this.cycling =
            this.$active =
            this.$items =
            this.$next =
            this.$prev =
            this.dx = null
        this.sliding = false

        this.$element
            .on('touchstart', $.proxy(this.touchstart, this))
            .on('touchmove', $.proxy(this.touchmove, this))
            .on('touchend', $.proxy(this.touchend, this))
            .on('slide.bs.carousel', $.proxy(this.startSliding, this))
            .on('slid.bs.carousel', $.proxy(this.stopSliding, this))
    }

    CarouselSwipe.DEFAULTS = {
        swipe: 50 // percent per second
    }

    CarouselSwipe.prototype.startSliding = function () {
        this.sliding = true
    }

    CarouselSwipe.prototype.stopSliding = function () {
        this.sliding = false
    }

    CarouselSwipe.prototype.touchstart = function (e) {
        if (this.sliding || !this.options.swipe) return;
        var touch = e.originalEvent.touches ? e.originalEvent.touches[0] : e
        this.dx = 0
        this.startX = touch.pageX
        this.startY = touch.pageY
        this.cycling = null
        this.width = this.$element.width()
        this.startTime = e.timeStamp
    }

    CarouselSwipe.prototype.touchmove = function (e) {
        if (this.sliding || !this.options.swipe || !this.startTime) return;
        var touch = e.originalEvent.touches ? e.originalEvent.touches[0] : e
        var dx = touch.pageX - this.startX
        var dy = touch.pageY - this.startY
        if (Math.abs(dx) < Math.abs(dy)) return; // vertical scroll

        if (this.cycling === null) {
            this.cycling = !!this.carousel.interval
            this.cycling && this.carousel.pause()
        }

        e.preventDefault()
        this.dx = dx / (this.width || 1) * 100
        this.swipe(this.dx)
    }

    CarouselSwipe.prototype.touchend = function (e) {
        if (this.sliding || !this.options.swipe || !this.startTime) return;
        if (!this.$active) return; // nothing moved
        var all = $()
            .add(this.$active).add(this.$prev).add(this.$next)
            .carousel_transition(true)

        var dt = (e.timeStamp - this.startTime) / 1000
        var speed = Math.abs(this.dx / dt) // percent-per-second
        if (this.dx > 40 || (this.dx > 0 && speed > this.options.swipe)) {
            this.carousel.prev()
        } else if (this.dx < -40 || (this.dx < 0 && speed > this.options.swipe)) {
            this.carousel.next();
        } else {
            this.$active
                .one($.support.transition.end, function () {
                    all.removeClass('prev next')
                })
                .emulateTransitionEnd(this.$active.css('transition-duration').slice(0, -1) * 1000)
        }

        all.css('transform', '')
        this.cycling && this.carousel.cycle()
        this.$active = null // reset the active element
        this.startTime = null
    }

    CarouselSwipe.prototype.swipe = function (percent) {
        var $active = this.$active || this.getActive()
        if (percent < 0) {
            this.$prev
                .css('transform', 'translate3d(0,0,0)')
                .removeClass('prev')
                .carousel_transition(true)
            if (!this.$next.length || this.$next.hasClass('active')) return
            this.$next
                .carousel_transition(false)
                .addClass('next')
                .css('transform', 'translate3d(' + (percent + 100) + '%,0,0)')
        } else {
            this.$next
                .css('transform', '')
                .removeClass('next')
                .carousel_transition(true)
            if (!this.$prev.length || this.$prev.hasClass('active')) return
            this.$prev
                .carousel_transition(false)
                .addClass('prev')
                .css('transform', 'translate3d(' + (percent - 100) + '%,0,0)')
        }

        $active
            .carousel_transition(false)
            .css('transform', 'translate3d(' + percent + '%, 0, 0)')
    }

    CarouselSwipe.prototype.getActive = function () {
        this.$active = this.$element.find('.item.active')
        this.$items = this.$active.parent().children()

        this.$next = this.$active.next()
        if (!this.$next.length && this.options.wrap) {
            this.$next = this.$items.first();
        }

        this.$prev = this.$active.prev()
        if (!this.$prev.length && this.options.wrap) {
            this.$prev = this.$items.last();
        }

        return this.$active;
    }

    // CAROUSEL PLUGIN DEFINITION
    // ==========================

    var old = $.fn.carousel
    $.fn.carousel = function () {
        old.apply(this, arguments);
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.carousel.swipe')
            if (!data) $this.data('bs.carousel.swipe', new CarouselSwipe(this))
        })
    }

    $.extend($.fn.carousel, old);

    $.fn.carousel_transition = function (enable) {
        enable = enable ? '' : 'none';
        return this.each(function () {
            $(this)
                .css('-webkit-transition', enable)
                .css('transition', enable)
        })
    };

}(jQuery);

/*! lazysizes - v4.0.2 */
!function (a, b) { var c = b(a, a.document); a.lazySizes = c, "object" == typeof module && module.exports && (module.exports = c) }(window, function (a, b) { "use strict"; if (b.getElementsByClassName) { var c, d, e = b.documentElement, f = a.Date, g = a.HTMLPictureElement, h = "addEventListener", i = "getAttribute", j = a[h], k = a.setTimeout, l = a.requestAnimationFrame || k, m = a.requestIdleCallback, n = /^picture$/i, o = ["load", "error", "lazyincluded", "_lazyloaded"], p = {}, q = Array.prototype.forEach, r = function (a, b) { return p[b] || (p[b] = new RegExp("(\\s|^)" + b + "(\\s|$)")), p[b].test(a[i]("class") || "") && p[b] }, s = function (a, b) { r(a, b) || a.setAttribute("class", (a[i]("class") || "").trim() + " " + b) }, t = function (a, b) { var c; (c = r(a, b)) && a.setAttribute("class", (a[i]("class") || "").replace(c, " ")) }, u = function (a, b, c) { var d = c ? h : "removeEventListener"; c && u(a, b), o.forEach(function (c) { a[d](c, b) }) }, v = function (a, d, e, f, g) { var h = b.createEvent("CustomEvent"); return e || (e = {}), e.instance = c, h.initCustomEvent(d, !f, !g, e), a.dispatchEvent(h), h }, w = function (b, c) { var e; !g && (e = a.picturefill || d.pf) ? e({ reevaluate: !0, elements: [b] }) : c && c.src && (b.src = c.src) }, x = function (a, b) { return (getComputedStyle(a, null) || {})[b] }, y = function (a, b, c) { for (c = c || a.offsetWidth; c < d.minSize && b && !a._lazysizesWidth;)c = b.offsetWidth, b = b.parentNode; return c }, z = function () { var a, c, d = [], e = [], f = d, g = function () { var b = f; for (f = d.length ? e : d, a = !0, c = !1; b.length;)b.shift()(); a = !1 }, h = function (d, e) { a && !e ? d.apply(this, arguments) : (f.push(d), c || (c = !0, (b.hidden ? k : l)(g))) }; return h._lsFlush = g, h }(), A = function (a, b) { return b ? function () { z(a) } : function () { var b = this, c = arguments; z(function () { a.apply(b, c) }) } }, B = function (a) { var b, c = 0, e = d.throttleDelay, g = d.ricTimeout, h = function () { b = !1, c = f.now(), a() }, i = m && g > 49 ? function () { m(h, { timeout: g }), g !== d.ricTimeout && (g = d.ricTimeout) } : A(function () { k(h) }, !0); return function (a) { var d; (a = a === !0) && (g = 33), b || (b = !0, d = e - (f.now() - c), 0 > d && (d = 0), a || 9 > d ? i() : k(i, d)) } }, C = function (a) { var b, c, d = 99, e = function () { b = null, a() }, g = function () { var a = f.now() - c; d > a ? k(g, d - a) : (m || e)(e) }; return function () { c = f.now(), b || (b = k(g, d)) } }; !function () { var b, c = { lazyClass: "lazyload", loadedClass: "lazyloaded", loadingClass: "lazyloading", preloadClass: "lazypreload", errorClass: "lazyerror", autosizesClass: "lazyautosizes", srcAttr: "data-src", srcsetAttr: "data-srcset", sizesAttr: "data-sizes", minSize: 40, customMedia: {}, init: !0, expFactor: 1.5, hFac: .8, loadMode: 2, loadHidden: !0, ricTimeout: 0, throttleDelay: 125 }; d = a.lazySizesConfig || a.lazysizesConfig || {}; for (b in c) b in d || (d[b] = c[b]); a.lazySizesConfig = d, k(function () { d.init && F() }) }(); var D = function () { var g, l, m, o, p, y, D, F, G, H, I, J, K, L, M = /^img$/i, N = /^iframe$/i, O = "onscroll" in a && !/glebot/.test(navigator.userAgent), P = 0, Q = 0, R = 0, S = -1, T = function (a) { R-- , a && a.target && u(a.target, T), (!a || 0 > R || !a.target) && (R = 0) }, U = function (a, c) { var d, f = a, g = "hidden" == x(b.body, "visibility") || "hidden" != x(a, "visibility"); for (F -= c, I += c, G -= c, H += c; g && (f = f.offsetParent) && f != b.body && f != e;)g = (x(f, "opacity") || 1) > 0, g && "visible" != x(f, "overflow") && (d = f.getBoundingClientRect(), g = H > d.left && G < d.right && I > d.top - 1 && F < d.bottom + 1); return g }, V = function () { var a, f, h, j, k, m, n, p, q, r = c.elements; if ((o = d.loadMode) && 8 > R && (a = r.length)) { f = 0, S++ , null == K && ("expand" in d || (d.expand = e.clientHeight > 500 && e.clientWidth > 500 ? 500 : 370), J = d.expand, K = J * d.expFactor), K > Q && 1 > R && S > 2 && o > 2 && !b.hidden ? (Q = K, S = 0) : Q = o > 1 && S > 1 && 6 > R ? J : P; for (; a > f; f++)if (r[f] && !r[f]._lazyRace) if (O) if ((p = r[f][i]("data-expand")) && (m = 1 * p) || (m = Q), q !== m && (y = innerWidth + m * L, D = innerHeight + m, n = -1 * m, q = m), h = r[f].getBoundingClientRect(), (I = h.bottom) >= n && (F = h.top) <= D && (H = h.right) >= n * L && (G = h.left) <= y && (I || H || G || F) && (d.loadHidden || "hidden" != x(r[f], "visibility")) && (l && 3 > R && !p && (3 > o || 4 > S) || U(r[f], m))) { if (ba(r[f]), k = !0, R > 9) break } else !k && l && !j && 4 > R && 4 > S && o > 2 && (g[0] || d.preloadAfterLoad) && (g[0] || !p && (I || H || G || F || "auto" != r[f][i](d.sizesAttr))) && (j = g[0] || r[f]); else ba(r[f]); j && !k && ba(j) } }, W = B(V), X = function (a) { s(a.target, d.loadedClass), t(a.target, d.loadingClass), u(a.target, Z), v(a.target, "lazyloaded") }, Y = A(X), Z = function (a) { Y({ target: a.target }) }, $ = function (a, b) { try { a.contentWindow.location.replace(b) } catch (c) { a.src = b } }, _ = function (a) { var b, c = a[i](d.srcsetAttr); (b = d.customMedia[a[i]("data-media") || a[i]("media")]) && a.setAttribute("media", b), c && a.setAttribute("srcset", c) }, aa = A(function (a, b, c, e, f) { var g, h, j, l, o, p; (o = v(a, "lazybeforeunveil", b)).defaultPrevented || (e && (c ? s(a, d.autosizesClass) : a.setAttribute("sizes", e)), h = a[i](d.srcsetAttr), g = a[i](d.srcAttr), f && (j = a.parentNode, l = j && n.test(j.nodeName || "")), p = b.firesLoad || "src" in a && (h || g || l), o = { target: a }, p && (u(a, T, !0), clearTimeout(m), m = k(T, 2500), s(a, d.loadingClass), u(a, Z, !0)), l && q.call(j.getElementsByTagName("source"), _), h ? a.setAttribute("srcset", h) : g && !l && (N.test(a.nodeName) ? $(a, g) : a.src = g), f && (h || l) && w(a, { src: g })), a._lazyRace && delete a._lazyRace, t(a, d.lazyClass), z(function () { (!p || a.complete && a.naturalWidth > 1) && (p ? T(o) : R-- , X(o)) }, !0) }), ba = function (a) { var b, c = M.test(a.nodeName), e = c && (a[i](d.sizesAttr) || a[i]("sizes")), f = "auto" == e; (!f && l || !c || !a[i]("src") && !a.srcset || a.complete || r(a, d.errorClass) || !r(a, d.lazyClass)) && (b = v(a, "lazyunveilread").detail, f && E.updateElem(a, !0, a.offsetWidth), a._lazyRace = !0, R++ , aa(a, b, f, e, c)) }, ca = function () { if (!l) { if (f.now() - p < 999) return void k(ca, 999); var a = C(function () { d.loadMode = 3, W() }); l = !0, d.loadMode = 3, W(), j("scroll", function () { 3 == d.loadMode && (d.loadMode = 2), a() }, !0) } }; return { _: function () { p = f.now(), c.elements = b.getElementsByClassName(d.lazyClass), g = b.getElementsByClassName(d.lazyClass + " " + d.preloadClass), L = d.hFac, j("scroll", W, !0), j("resize", W, !0), a.MutationObserver ? new MutationObserver(W).observe(e, { childList: !0, subtree: !0, attributes: !0 }) : (e[h]("DOMNodeInserted", W, !0), e[h]("DOMAttrModified", W, !0), setInterval(W, 999)), j("hashchange", W, !0), ["focus", "mouseover", "click", "load", "transitionend", "animationend", "webkitAnimationEnd"].forEach(function (a) { b[h](a, W, !0) }), /d$|^c/.test(b.readyState) ? ca() : (j("load", ca), b[h]("DOMContentLoaded", W), k(ca, 2e4)), c.elements.length ? (V(), z._lsFlush()) : W() }, checkElems: W, unveil: ba } }(), E = function () { var a, c = A(function (a, b, c, d) { var e, f, g; if (a._lazysizesWidth = d, d += "px", a.setAttribute("sizes", d), n.test(b.nodeName || "")) for (e = b.getElementsByTagName("source"), f = 0, g = e.length; g > f; f++)e[f].setAttribute("sizes", d); c.detail.dataAttr || w(a, c.detail) }), e = function (a, b, d) { var e, f = a.parentNode; f && (d = y(a, f, d), e = v(a, "lazybeforesizes", { width: d, dataAttr: !!b }), e.defaultPrevented || (d = e.detail.width, d && d !== a._lazysizesWidth && c(a, f, e, d))) }, f = function () { var b, c = a.length; if (c) for (b = 0; c > b; b++)e(a[b]) }, g = C(f); return { _: function () { a = b.getElementsByClassName(d.autosizesClass), j("resize", g) }, checkElems: g, updateElem: e } }(), F = function () { F.i || (F.i = !0, E._(), D._()) }; return c = { cfg: d, autoSizer: E, loader: D, init: F, uP: w, aC: s, rC: t, hC: r, fire: v, gW: y, rAF: z } } });