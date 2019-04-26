/*------------------------------------------------------------------------------
    JS Document (https://developer.mozilla.org/en/JavaScript)

    project:    STPo-boilerplate
    created:    xxxx-xx-xx
    author:     Christophe ANDRIEU (http://www.stpo.fr)

    summary:    CONSTANTES
                UTILITIES
                DOCUMENT.READY
                WINDOW.LOAD
                EASIN_CUSTOMZ
                PX_VALUE
                ON_ELEMENT_HEIGHT_CHANGE
                SVG
                SHOW/HIDE
                SCROLL_TO
                EMAIL
                IFRAME_RESIZE
                STICKY_ANCHORS
                STICKY_POSITION
                STICKY_DISPLAY
----------------------------------------------------------------------------- */


;(function($, undefined){

    //
    // == CONSTANTES
    // --------------------------------------------------
    $.noConflict();

    var d = document,
        w = window,
        stpo = {};


    //
    // == UTILITIES
    // --------------------------------------------------
    var log = function(x) {
        if (typeof console != 'undefined') {
            console.log(x);
        }
    };


    //
    // == DOCUMENT.READY
    // --------------------------------------------------
    // This is executed when HTML-Document is loaded and DOM is ready.
    $(d).ready(function(){


        stpo.popin();                   // modal windows

        stpo.svg();                     // replace svg img source by png on error
        stpo.showHide();                // generic show/hide stuff
        stpo.scrollTo();                // back to top button behaviour
        stpo.email();                   // email encode
        stpo.iframeResize();            // responsive iframes

    });


    //
    // == WINDOW.LOAD
    // --------------------------------------------------
    //  This is executed when complete page is fully loaded, including all frames, objects and images.
    $(w).load(function(){

        // called here because of container height calc that has to wait scripts to be finished
        stpo.stickyAnchors();           // inside nav anchors
        stpo.stickyPosition();          // stick and unstick complex sticky blocks
        stpo.stickyDisplay();           // show/hide basic sticky blocks

    });


    //
    // == EASIN_CUSTOMZ
    // --------------------------------------------------
    // This extends the easing methods of jQuery with a fanciest one.
    $.extend( $.easing,{
        def: 'easeOutExpo',
        easeOutExpo: function (x, t, b, c, d) {
            return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
        }
    });


    //
    // == PX_VALUE
    // --------------------------------------------------
    // This returns the width in px units from em units.
    // Useful when observing window width for responsive items (sliders, etc.).
    // for info (for 16px basic font-size):
    // 81.25em  = "1300px"
    // 75em     = "1200px"
    // 64em     = "1024px"
    // 48em     = "768px"
    // 37.5em   = "600px"
    stpo.pxValue = function(emValue){
        return emValue * parseFloat($('body').css('font-size'));
    };


    //
    // == ON_ELEMENT_HEIGHT_CHANGE
    // --------------------------------------------------
    // This function watches the elm height changes.
    // Useful when scripts depend on elements dimensions and when elements are updated by other scripts.
    // WARNING: this uses a setTimeout so it can become pretty heavy. Handle with care.
    stpo.onElementHeightChange = function (elm, callback){

        var lastHeight = elm.clientHeight, newHeight;

        (function run(){
            newHeight = elm.clientHeight;
            if( lastHeight != newHeight )
                callback();
            lastHeight = newHeight;

            if( elm.onElementHeightChangeTimer )
                clearTimeout(elm.onElementHeightChangeTimer);

            elm.onElementHeightChangeTimer = setTimeout(run, 200);
        })();

    };


    //
    // == SVG
    // --------------------------------------------------
    // This function switches to a png bitmap image source fallback when svg isn’t supported.
    stpo.svg = function(){

        // if svg is supported
        if(document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image", "1.1")) return;

        // else
        $('.img-svg').each(function(e){
            $(this).attr('src', $(this).attr('src').replace('.svg','.png'));
        });

    };


    //
    // == SHOW/HIDE
    // --------------------------------------------------
    // This function helps toggling elements.
    // It adds an `active` class to the target and the caller, then remove it on second click.
    // Target can be given explicitly and if not '.show-hide-target' siblings are used by default.
    // A 'close' button can be used to remove the class too.
    // A 'collection' option can be used if opening an item should close the others.
    stpo.showHide = function(){

        var $body = $('body');

        $('.show-hide').each(function(){

            var $this = $(this),
                $target = $($this.data('target')),
                $parent = $this.closest('.show-hide-collection');

            // if not defined target, take next and prev .show-hide-target
            if ($target.length == 0) $target = $this.prev('.show-hide-target').add($this.next('.show-hide-target'));

            // close buttons but NOT nested ones
            var $close = $target.find(".show-hide-close").not($target.find('.show-hide-target .show-hide-close')),
                $targetInnerLinks = $target.find('a, button');

            // init: without JS all is shown, let’s hide it
            $this.add($target).not('.default-active').removeClass('active');

            // init: kill focusable if not default-active
            if (!($this.hasClass('default-active'))) $targetInnerLinks.attr('tabindex','-1');

            // behaviour
            $this.add($close).off('click').on('click', function(e){

                if ($target.hasClass('active')){
                    $this.add($target).removeClass('active');
                    $targetInnerLinks.attr('tabindex','-1');
                }
                else{
                    $this.add($target).addClass('active');
                    $targetInnerLinks.attr('tabindex','0');

                    // if this is a collection, hide other active items by triggering a click
                    if ($parent.length != 0) {
                        $parent.find('.show-hide.active').not($this).trigger('click');
                    }
                }

                $this.blur();
                return false;

            });
        });
    };


    //
    // == SCROLL_TO
    // --------------------------------------------------
    // This function enables smooth scrolling when clicking links bearing the `link-scroll-to-anchor` class.
    // It is used, for example, for the links `back to top`.
    // It relies on the `easeOutExpo` easing defined above.
    stpo.scrollTo = function(){

        var $body = $('html, body'),
            $links = $('.link-scroll-to-anchor');

        $links.each(function(){

            var $this = $(this),
                href = $this.attr('href');

            // click
            $this.on('click', function(){

                $links.filter('.active').removeClass('active');
                $this.addClass('active');

                $body.stop().animate({

                    scrollTop: $(href).offset().top

                }, 1000, 'easeOutExpo', function(){

                    // nothun' dude

                });

                $this.blur();
                return false;
            });
        });
    };


    //
    // == EMAIL
    // --------------------------------------------------
    // This function creates mailto links for email addresses in order to avoid spam.
    // Works on every address matching this pattern: `<span class="email">name[AT]provider[DOT]dn</span>`.
    // If link title should be different from email address, just add a data-title attribute.
    // If link contains an svg icon, be sure it has the .svg-icon class.
    stpo.email = function() {

        $('.email').each(function(i){

            var $this = $(this),
                $svg = $this.find('.svg-icon'),
                mySvg = '',
                myTitle = $this.data('title');

            if ($svg.length > 0){
                mySvg = $svg[0].outerHTML + ' ';
                $svg.remove();
            }

            var myString = $this.html().replace( /\s/g, ''),
                newString = myString.split('[AT]')[0] + '@' + myString.split('[AT]')[1].split('[DOT]')[0] + '.' + myString.split('[AT]')[1].split('[DOT]')[1];

            if (myTitle == undefined) myTitle = newString;

            $this.html('<a href="mailto:' + newString + '">' + mySvg + myTitle +'</a>');

        });
    };


    //
    // == IFRAME_RESIZE
    // --------------------------------------------------
    // This function gives a ratio to CSS when embedding an iframe (for Youtube, Vimeo and Dailymotion videos…).
    // Goes with some CSS magic (see stylesheet for more).
    stpo.iframeResize = function(){

        $('.iframe-container').each(function(){

            var $this = $(this),
                $iframe = $this.find('iframe'),
                ratio = parseInt($iframe.attr('height')) / parseInt($iframe.attr('width')) * 100;

            $this.css('padding-bottom', ratio+'%');
        });
    };


    //
    // == STICKY_ANCHORS
    // --------------------------------------------------
    // This function modifies the .nav-inside elements depending on page scroll.
    // When scrolling, anchors are updated and nav is fixed. This is pretty tricky but works fine.
    // WARNING: has to wait the sliders inside $container to be created!
    // Call this function AFTER they're done (or updated, like in sliders'smooth height items).
    stpo.stickyAnchors = function(){

        if (document.getElementsByClassName('sticky-anchors').length == 0) return false;

        var $item = $('.sticky-anchors'),
            topMargin = parseInt($item.data('margin-top')), // height in em

        // for sections highlight
            $navLinks = $item.find('.sticky-anchors-link'),
            $body = $('html, body'),
            offsetTopValues = [],
            sections = [],
            docH = $(d).height(),

        // section table
            resetSections = function(){

                offsetTopValues = [];
                sections = [];

                // store sections offset
                $navLinks.each(function(){

                    var $this = $(this),
                        href = $this.attr('href');

                    offsetTopValues.push(parseInt($(href).offset().top))

                });

                // build sections array
                for (i=0; i<$navLinks.length; i++) {

                    if (i == $navLinks.length-1) sections.push([offsetTopValues[i], docH]);
                    else sections.push([offsetTopValues[i], offsetTopValues[i+1]]);

                }
            },

        // on scroll actions
            onScroll = function(){

                var windowTop = $(window).scrollTop() + 1 + stpo.pxValue(topMargin) // header height compensation

                for(var i in sections){

                    if ((parseInt(sections[i][0]) < parseInt(windowTop)) && (parseInt(windowTop) < parseInt(sections[i][1]))){

                        $navLinks.filter('.active').removeClass('active');
                        $navLinks.eq(i).addClass('active');

                    }
                }
            };

        // init & click the nav
        $navLinks.add('.internal-link').each(function(){

            var $this = $(this),
                href = $this.attr('href');

            // click
            $this.bind('click', function(){

                $navLinks.removeClass('focus');
                $this.addClass('focus');

                $body.stop().animate({

                    scrollTop: $(href).offset().top - stpo.pxValue(topMargin) // header height compensation

                }, 1000, 'easeOutExpo', function(){

                    $this.removeClass('focus');

                });

                $this.blur();
                return false;
            });
        });

        // resetSections
        $(w).on('resize', $.debounce(100, resetSections));
        resetSections();

        // on scroll
        $(w).on('resize', $.debounce(100, onScroll));
        $(d).on('scroll', $.debounce(10, onScroll));
        onScroll();

        // on document height change, update sections
        stpo.onElementHeightChange(document.body, function(){
            resetSections();
        });
    };


    //
    // == STICKY_POSITION
    // --------------------------------------------------
    // This function modifies the .sticky-position element depending on page scroll.
    // When scrolling over .sticky-position-container, .sticky-position block is set to .fixed.
    // When not, .sticky-position block is set to default [no class] (above container) or .bottom (below it).
    // When block or document height are changed, the script variables are updated with the new values.
    // WARNING: has to wait the sliders inside $container to be created!
    // Call this function AFTER they're done (or updated, like in sliders'smooth height items).
    stpo.stickyPosition = function(){

        if (document.getElementsByClassName('sticky-position').length == 0) return false;

        var $item = $('.sticky-position'),

        // for positioning
            $container = $item.closest('.sticky-position-container'),
            itemHeight = $item.outerHeight(),
            topPadding = parseInt($item.css('padding-top')), // distance from top of screen
            topLimit = $container.offset().top,
            bottomLimit = $container.offset().top + $container.outerHeight() - itemHeight,

        // on scroll actions
            onScroll = function(){

                // make me fixed!
                if ($(w).scrollTop() > topLimit) $item.addClass('fixed');
                else $item.removeClass('fixed');

                if ($(w).scrollTop() > bottomLimit) $item.removeClass('fixed').addClass('bottom');
                else $item.removeClass('bottom');

            };

        // on scroll
        $(w).on('resize', $.debounce(100, onScroll));
        $(d).on('scroll', $.debounce(10, onScroll));
        onScroll();

        // on document height change, update top and bottom limits
        stpo.onElementHeightChange(document.body, function(){
            topLimit = $container.offset().top - topPadding;
            bottomLimit = $container.offset().top + $container.outerHeight() - itemHeight;
        });

        // on $item height change, update itemHeight and bottomLimit
        stpo.onElementHeightChange($item[0], function(){
            itemHeight = $item.outerHeight();
            bottomLimit = $container.offset().top + $container.outerHeight() - itemHeight;
        });

        // on window resize, update all
        $(w).on('resize', $.debounce(100, function(){
            itemHeight = $item.outerHeight();
            topLimit = $container.offset().top - topPadding;
            bottomLimit = $container.offset().top + $container.outerHeight() - itemHeight;
        }));
    };


    //
    // == STICKY_DISPLAY
    // --------------------------------------------------
    // This function lets the sticky blocks appear when browsing their container and disappear when not.
    // When block or document height are changed, the script variables are updated with the new values.
    // WARNING: has to wait the sliders inside $container to be created!
    // Call this function AFTER they're done (or updated, like in sliders'smooth height items).
    stpo.stickyDisplay = function(){

        if (document.getElementsByClassName('sticky-display').length == 0) return false;

        var $item = $('.sticky-display'),

        // for positioning
            $container = $item.closest('.sticky-display-container'),
            itemHeight = $item.outerHeight(),
            topPadding = parseInt($item.css('padding-top')), // please use ONLY padding, not margin, thanx
            topLimit = $container.offset().top - topPadding,
            bottomLimit = $container.offset().top + $container.outerHeight() - itemHeight,

        // on scroll actions
            onScroll = function(){

                // make me sticky!
                if (($(w).scrollTop() > topLimit)&&($(w).scrollTop() < bottomLimit)) $item.addClass('active');
                else $item.removeClass('active');

            };

        // on scroll
        $(w).on('resize', $.debounce(100, onScroll));
        $(d).on('scroll', $.debounce(10, onScroll));
        onScroll();

        // on document height change, update top and bottom limits
        stpo.onElementHeightChange(document.body, function(){
            topLimit = $container.offset().top - topPadding;
            bottomLimit = $container.offset().top + $container.outerHeight() - itemHeight;
        });

        // on $item height change, update itemHeight and bottomLimit
        stpo.onElementHeightChange($item[0], function(){
            itemHeight = $item.outerHeight();
            bottomLimit = $container.offset().top + $container.outerHeight() - itemHeight;
        });
    };


    //
    // == POPIN
    // --------------------------------------------------
    // This function creates the modal windows.
    stpo.popin = function(){

        var $body = $('body');

        $('.link-popin').each(function(){

            var $this = $(this),
                $target = $($this.attr('href'));

            // behave
            $this.bind('click',function(){

                // not on mobile thanks
                if (($this.hasClass('link-popin--not-mobile'))&&($(w).width()) < parseInt(stpo.pxValue(51.9069)))
                    return false

                // set layout
                $this.addClass('link-popin_active');
                $body.addClass('freezed');
                $target.addClass('active');

                $this.blur();
                return false;

            });
        });

        $('.popin-closer').each(function(){

            var $this = $(this),
                $target = $this.closest('.popin-overlay');

            // behave
            $this.bind('click', function(){

                // unset layout
                $this.removeClass('link-popin_active');
                $body.removeClass('freezed');
                $target.removeClass('active');

                $this.blur();
                return false;

            });
        });

        // ESC key
        $('body').keydown(function(e){
            if (e.which==27){
                $('.popin-closer').trigger('click');
            }
        });
    };

})(jQuery);
