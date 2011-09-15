/*!
 * Modernizr v1.7
 * http://www.modernizr.com
 *
 * Copyright (c) 2009-2011
 * Dual-licensed under the BSD or MIT licenses.
 * http://www.modernizr.com/license/
 */
window.Modernizr = (function(window,document,undefined){
    
    var version = '1.7',

    ret = {},

    /**
     * !! DEPRECATED !!
     * 
     * enableHTML5 is a private property for advanced use only. If enabled,
     * it will make Modernizr.init() run through a brief while() loop in
     * which it will create all HTML5 elements in the DOM to allow for
     * styling them in Internet Explorer, which does not recognize any
     * non-HTML4 elements unless created in the DOM this way.
     * 
     * enableHTML5 is ON by default.
     * 
     * The enableHTML5 toggle option is DEPRECATED as per 1.6, and will be
     * replaced in 2.0 in lieu of the modular, configurable nature of 2.0.
     */
    enableHTML5 = true,
    
    
    docElement = document.documentElement,
    docHead = document.head || document.getElementsByTagName('head')[0],

    /**
     * Create our "modernizr" element that we do most feature tests on.
     */
    mod = 'modernizr',
    modElem = document.createElement( mod ),
    m_style = modElem.style,

    /**
     * Create the input element for various Web Forms feature tests.
     */
    inputElem = document.createElement( 'input' ),
    
    smile = ':)',
    
    tostring = Object.prototype.toString,
    
    // List of property values to set for css tests. See ticket #21
    prefixes = ' -webkit- -moz- -o- -ms- -khtml- '.split(' '),

    // Following spec is to expose vendor-specific style properties as:
    //   elem.style.WebkitBorderRadius
    // and the following would be incorrect:
    //   elem.style.webkitBorderRadius
    
    // Webkit ghosts their properties in lowercase but Opera & Moz do not.
    // Microsoft foregoes prefixes entirely <= IE8, but appears to 
    //   use a lowercase `ms` instead of the correct `Ms` in IE9
    
    // More here: http://github.com/Modernizr/Modernizr/issues/issue/21
    domPrefixes = 'Webkit Moz O ms Khtml'.split(' '),

    ns = {'svg': 'http://www.w3.org/2000/svg'},

    tests = {},
    inputs = {},
    attrs = {},
    
    classes = [],
    
    featurename, // used in testing loop
    
    
    
    // todo: consider using http://javascript.nwbox.com/CSSSupport/css-support.js instead
    testMediaQuery = function(mq){

      var st = document.createElement('style'),
          div = document.createElement('div'),
          ret;

      st.textContent = mq + '{#modernizr{height:3px}}';
      docHead.appendChild(st);
      div.id = 'modernizr';
      docElement.appendChild(div);

      ret = div.offsetHeight === 3;

      st.parentNode.removeChild(st);
      div.parentNode.removeChild(div);

      return !!ret;

    },
    
    
    /**
      * isEventSupported determines if a given element supports the given event
      * function from http://yura.thinkweb2.com/isEventSupported/
      */
    isEventSupported = (function(){

      var TAGNAMES = {
        'select':'input','change':'input',
        'submit':'form','reset':'form',
        'error':'img','load':'img','abort':'img'
      };

      function isEventSupported(eventName, element) {

        element = element || document.createElement(TAGNAMES[eventName] || 'div');
        eventName = 'on' + eventName;

        // When using `setAttribute`, IE skips "unload", WebKit skips "unload" and "resize", whereas `in` "catches" those
        var isSupported = (eventName in element);

        if (!isSupported) {
          // If it has no `setAttribute` (i.e. doesn't implement Node interface), try generic element
          if (!element.setAttribute) {
            element = document.createElement('div');
          }
          if (element.setAttribute && element.removeAttribute) {
            element.setAttribute(eventName, '');
            isSupported = is(element[eventName], 'function');

            // If property was created, "remove it" (by setting value to `undefined`)
            if (!is(element[eventName], undefined)) {
              element[eventName] = undefined;
            }
            element.removeAttribute(eventName);
          }
        }

        element = null;
        return isSupported;
      }
      return isEventSupported;
    })();
    
    
    // hasOwnProperty shim by kangax needed for Safari 2.0 support
    var _hasOwnProperty = ({}).hasOwnProperty, hasOwnProperty;
    if (!is(_hasOwnProperty, undefined) && !is(_hasOwnProperty.call, undefined)) {
      hasOwnProperty = function (object, property) {
        return _hasOwnProperty.call(object, property);
      };
    }
    else {
      hasOwnProperty = function (object, property) { /* yes, this can give false positives/negatives, but most of the time we don't care about those */
        return ((property in object) && is(object.constructor.prototype[property], undefined));
      };
    }
    
    /**
     * set_css applies given styles to the Modernizr DOM node.
     */
    function set_css( str ) {
        m_style.cssText = str;
    }

    /**
     * set_css_all extrapolates all vendor-specific css strings.
     */
    function set_css_all( str1, str2 ) {
        return set_css(prefixes.join(str1 + ';') + ( str2 || '' ));
    }

    /**
     * is returns a boolean for if typeof obj is exactly type.
     */
    function is( obj, type ) {
        return typeof obj === type;
    }

    /**
     * contains returns a boolean for if substr is found within str.
     */
    function contains( str, substr ) {
        return (''+str).indexOf( substr ) !== -1;
    }

    /**
     * test_props is a generic CSS / DOM property test; if a browser supports
     *   a certain property, it won't return undefined for it.
     *   A supported CSS property returns empty string when its not yet set.
     */
    function test_props( props, callback ) {
        for ( var i in props ) {
            if ( m_style[ props[i] ] !== undefined && ( !callback || callback( props[i], modElem ) ) ) {
                return true;
            }
        }
    }

    /**
     * test_props_all tests a list of DOM properties we want to check against.
     *   We specify literally ALL possible (known and/or likely) properties on 
     *   the element including the non-vendor prefixed one, for forward-
     *   compatibility.
     */
    function test_props_all( prop, callback ) {
      
        var uc_prop = prop.charAt(0).toUpperCase() + prop.substr(1),
            props   = (prop + ' ' + domPrefixes.join(uc_prop + ' ') + uc_prop).split(' ');

        return !!test_props( props, callback );
    }
    

    /**
     * Tests
     * -----
     */ 

    tests['flexbox'] = function() {
        /**
         * set_prefixed_value_css sets the property of a specified element
         * adding vendor prefixes to the VALUE of the property.
         * @param {Element} element
         * @param {string} property The property name. This will not be prefixed.
         * @param {string} value The value of the property. This WILL be prefixed.
         * @param {string=} extra Additional CSS to append unmodified to the end of
         * the CSS string.
         */
        function set_prefixed_value_css(element, property, value, extra) {
            property += ':';
            element.style.cssText = (property + prefixes.join(value + ';' + property)).slice(0, -property.length) + (extra || '');
        }

        /**
         * set_prefixed_property_css sets the property of a specified element
         * adding vendor prefixes to the NAME of the property.
         * @param {Element} element
         * @param {string} property The property name. This WILL be prefixed.
         * @param {string} value The value of the property. This will not be prefixed.
         * @param {string=} extra Additional CSS to append unmodified to the end of
         * the CSS string.
         */
        function set_prefixed_property_css(element, property, value, extra) {
            element.style.cssText = prefixes.join(property + ':' + value + ';') + (extra || '');
        }

        var c = document.createElement('div'),
            elem = document.createElement('div');

        set_prefixed_value_css(c, 'display', 'box', 'width:42px;padding:0;');
        set_prefixed_property_css(elem, 'box-flex', '1', 'width:10px;');

        c.appendChild(elem);
        docElement.appendChild(c);

        var ret = elem.offsetWidth === 42;

        c.removeChild(elem);
        docElement.removeChild(c);

        return ret;
    };
    
    // On the S60 and BB Storm, getContext exists, but always returns undefined
    // http://github.com/Modernizr/Modernizr/issues/issue/97/ 
    
    tests['canvas'] = function() {
        var elem = document.createElement( 'canvas' );
        return !!(elem.getContext && elem.getContext('2d'));
    };
    
    tests['canvastext'] = function() {
        return !!(ret['canvas'] && is(document.createElement( 'canvas' ).getContext('2d').fillText, 'function'));
    };
    
    // This WebGL test false positives in FF depending on graphics hardware. But really it's quite impossible to know
    // wether webgl will succeed until after you create the context. You might have hardware that can support
    // a 100x100 webgl canvas, but will not support a 1000x1000 webgl canvas. So this feature inference is weak, 
    // but intentionally so.
    tests['webgl'] = function(){
        return !!window.WebGLRenderingContext;
    };
    
    /*
     * The Modernizr.touch test only indicates if the browser supports
     *    touch events, which does not necessarily reflect a touchscreen
     *    device, as evidenced by tablets running Windows 7 or, alas,
     *    the Palm Pre / WebOS (touch) phones.
     *    
     * Additionally, Chrome (desktop) used to lie about its support on this,
     *    but that has since been rectified: http://crbug.com/36415
     *    
     * We also test for Firefox 4 Multitouch Support.
     *
     * For more info, see: http://modernizr.github.com/Modernizr/touch.html
     */
     
    tests['touch'] = function() {

        return ('ontouchstart' in window) || testMediaQuery('@media ('+prefixes.join('touch-enabled),(')+'modernizr)');

    };


    /**
     * geolocation tests for the new Geolocation API specification.
     *   This test is a standards compliant-only test; for more complete
     *   testing, including a Google Gears fallback, please see:
     *   http://code.google.com/p/geo-location-javascript/
     * or view a fallback solution using google's geo API:
     *   http://gist.github.com/366184
     */
    tests['geolocation'] = function() {
        return !!navigator.geolocation;
    };

    // Per 1.6: 
    // This used to be Modernizr.crosswindowmessaging but the longer
    // name has been deprecated in favor of a shorter and property-matching one.
    // The old API is still available in 1.6, but as of 2.0 will throw a warning,
    // and in the first release thereafter disappear entirely.
    tests['postmessage'] = function() {
      return !!window.postMessage;
    };

    // Web SQL database detection is tricky:

    // In chrome incognito mode, openDatabase is truthy, but using it will 
    //   throw an exception: http://crbug.com/42380
    // We can create a dummy database, but there is no way to delete it afterwards. 
    
    // Meanwhile, Safari users can get prompted on any database creation.
    //   If they do, any page with Modernizr will give them a prompt:
    //   http://github.com/Modernizr/Modernizr/issues/closed#issue/113
    
    // We have chosen to allow the Chrome incognito false positive, so that Modernizr
    //   doesn't litter the web with these test databases. As a developer, you'll have
    //   to account for this gotcha yourself.
    tests['websqldatabase'] = function() {
      var result = !!window.openDatabase;
      /*  if (result){
            try {
              result = !!openDatabase( mod + "testdb", "1.0", mod + "testdb", 2e4);
            } catch(e) {
            }
          }  */
      return result;
    };
    
    // Vendors have inconsistent prefixing with the experimental Indexed DB:
    // - Firefox is shipping indexedDB in FF4 as moz_indexedDB
    // - Webkit's implementation is accessible through webkitIndexedDB
    // We test both styles.
    tests['indexedDB'] = function(){
      for (var i = -1, len = domPrefixes.length; ++i < len; ){ 
        var prefix = domPrefixes[i].toLowerCase();
        if (window[prefix + '_indexedDB'] || window[prefix + 'IndexedDB']){
          return true;
        } 
      }
      return false;
    };

    // documentMode logic from YUI to filter out IE8 Compat Mode
    //   which false positives.
    tests['hashchange'] = function() {
      return isEventSupported('hashchange', window) && ( document.documentMode === undefined || document.documentMode > 7 );
    };

    // Per 1.6: 
    // This used to be Modernizr.historymanagement but the longer
    // name has been deprecated in favor of a shorter and property-matching one.
    // The old API is still available in 1.6, but as of 2.0 will throw a warning,
    // and in the first release thereafter disappear entirely.
    tests['history'] = function() {
      return !!(window.history && history.pushState);
    };

    tests['draganddrop'] = function() {
        return isEventSupported('dragstart') && isEventSupported('drop');
    };
    
    tests['websockets'] = function(){
        return ('WebSocket' in window);
    };
    
    
    // http://css-tricks.com/rgba-browser-support/
    tests['rgba'] = function() {
        // Set an rgba() color and check the returned value
        
        set_css(  'background-color:rgba(150,255,150,.5)' );
        
        return contains( m_style.backgroundColor, 'rgba' );
    };
    
    tests['hsla'] = function() {
        // Same as rgba(), in fact, browsers re-map hsla() to rgba() internally,
        //   except IE9 who retains it as hsla
        
        set_css('background-color:hsla(120,40%,100%,.5)' );
        
        return contains( m_style.backgroundColor, 'rgba' ) || contains( m_style.backgroundColor, 'hsla' );
    };
    
    tests['multiplebgs'] = function() {
        // Setting multiple images AND a color on the background shorthand property
        //  and then querying the style.background property value for the number of
        //  occurrences of "url(" is a reliable method for detecting ACTUAL support for this!
        
        set_css( 'background:url(//:),url(//:),red url(//:)' );
        
        // If the UA supports multiple backgrounds, there should be three occurrences
        //   of the string "url(" in the return value for elem_style.background

        return new RegExp("(url\\s*\\(.*?){3}").test(m_style.background);
    };
    
    
    // In testing support for a given CSS property, it's legit to test:
    //    `elem.style[styleName] !== undefined`
    // If the property is supported it will return an empty string,
    // if unsupported it will return undefined.
    
    // We'll take advantage of this quick test and skip setting a style 
    // on our modernizr element, but instead just testing undefined vs
    // empty string.
    

    tests['backgroundsize'] = function() {
        return test_props_all( 'backgroundSize' );
    };
    
    tests['borderimage'] = function() {
        return test_props_all( 'borderImage' );
    };
    
    
    // Super comprehensive table about all the unique implementations of 
    // border-radius: http://muddledramblings.com/table-of-css3-border-radius-compliance
    
    tests['borderradius'] = function() {
        return test_props_all( 'borderRadius', '', function( prop ) {
            return contains( prop, 'orderRadius' );
        });
    };
    
    // WebOS unfortunately false positives on this test.
    tests['boxshadow'] = function() {
        return test_props_all( 'boxShadow' );
    };
    
    // FF3.0 will false positive on this test 
    tests['textshadow'] = function(){
        return document.createElement('div').style.textShadow === '';
    };
    
    
    tests['opacity'] = function() {
        // Browsers that actually have CSS Opacity implemented have done so
        //  according to spec, which means their return values are within the
        //  range of [0.0,1.0] - including the leading zero.
        
        set_css_all( 'opacity:.55' );
        
        // The non-literal . in this regex is intentional:
        //   German Chrome returns this value as 0,55
        // https://github.com/Modernizr/Modernizr/issues/#issue/59/comment/516632
        return /^0.55$/.test(m_style.opacity);
    };
    
    
    tests['cssanimations'] = function() {
        return test_props_all( 'animationName' );
    };
    
    
    tests['csscolumns'] = function() {
        return test_props_all( 'columnCount' );
    };
    
    
    tests['cssgradients'] = function() {
        /**
         * For CSS Gradients syntax, please see:
         * http://webkit.org/blog/175/introducing-css-gradients/
         * https://developer.mozilla.org/en/CSS/-moz-linear-gradient
         * https://developer.mozilla.org/en/CSS/-moz-radial-gradient
         * http://dev.w3.org/csswg/css3-images/#gradients-
         */
        
        var str1 = 'background-image:',
            str2 = 'gradient(linear,left top,right bottom,from(#9f9),to(white));',
            str3 = 'linear-gradient(left top,#9f9, white);';
        
        set_css(
            (str1 + prefixes.join(str2 + str1) + prefixes.join(str3 + str1)).slice(0,-str1.length)
        );
        
        return contains( m_style.backgroundImage, 'gradient' );
    };
    
    
    tests['cssreflections'] = function() {
        return test_props_all( 'boxReflect' );
    };
    
    
    tests['csstransforms'] = function() {
        return !!test_props([ 'transformProperty', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform' ]);
    };
    
    
    tests['csstransforms3d'] = function() {
        
        var ret = !!test_props([ 'perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective' ]);
        
        // Webkit’s 3D transforms are passed off to the browser's own graphics renderer.
        //   It works fine in Safari on Leopard and Snow Leopard, but not in Chrome in
        //   some conditions. As a result, Webkit typically recognizes the syntax but 
        //   will sometimes throw a false positive, thus we must do a more thorough check:
        if (ret && 'webkitPerspective' in docElement.style){
          
          // Webkit allows this media query to succeed only if the feature is enabled.    
          // `@media (transform-3d),(-o-transform-3d),(-moz-transform-3d),(-ms-transform-3d),(-webkit-transform-3d),(modernizr){ ... }`    
          ret = testMediaQuery('@media ('+prefixes.join('transform-3d),(')+'modernizr)');
        }
        return ret;
    };
    
    
    tests['csstransitions'] = function() {
        return test_props_all( 'transitionProperty' );
    };


    // @font-face detection routine by Diego Perini
    // http://javascript.nwbox.com/CSSSupport/
    tests['fontface'] = function(){

        var 
        sheet, bool,
        head = docHead || docElement,
        style = document.createElement("style"),
        impl = document.implementation || { hasFeature: function() { return false; } };
        
        style.type = 'text/css';
        head.insertBefore(style, head.firstChild);
        sheet = style.sheet || style.styleSheet;

        var supportAtRule = impl.hasFeature('CSS2', '') ?
                function(rule) {
                    if (!(sheet && rule)) return false;
                    var result = false;
                    try {
                        sheet.insertRule(rule, 0);
                        result = (/src/i).test(sheet.cssRules[0].cssText);
                        sheet.deleteRule(sheet.cssRules.length - 1);
                    } catch(e) { }
                    return result;
                } :
                function(rule) {
                    if (!(sheet && rule)) return false;
                    sheet.cssText = rule;
                    
                    return sheet.cssText.length !== 0 && (/src/i).test(sheet.cssText) &&
                      sheet.cssText
                            .replace(/\r+|\n+/g, '')
                            .indexOf(rule.split(' ')[0]) === 0;
                };
        
        bool = supportAtRule('@font-face { font-family: "font"; src: url(data:,); }');
        head.removeChild(style);
        return bool;
    };
    

    // These tests evaluate support of the video/audio elements, as well as
    // testing what types of content they support.
    //
    // We're using the Boolean constructor here, so that we can extend the value
    // e.g.  Modernizr.video     // true
    //       Modernizr.video.ogg // 'probably'
    //
    // Codec values from : http://github.com/NielsLeenheer/html5test/blob/9106a8/index.html#L845
    //                     thx to NielsLeenheer and zcorpan
    
    // Note: in FF 3.5.1 and 3.5.0, "no" was a return value instead of empty string.
    //   Modernizr does not normalize for that.
    
    tests['video'] = function() {
        var elem = document.createElement('video'),
            bool = !!elem.canPlayType;
        
        if (bool){  
            bool      = new Boolean(bool);  
            bool.ogg  = elem.canPlayType('video/ogg; codecs="theora"');
            
            // Workaround required for IE9, which doesn't report video support without audio codec specified.
            //   bug 599718 @ msft connect
            var h264 = 'video/mp4; codecs="avc1.42E01E';
            bool.h264 = elem.canPlayType(h264 + '"') || elem.canPlayType(h264 + ', mp4a.40.2"');
            
            bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"');
        }
        return bool;
    };
    
    tests['audio'] = function() {
        var elem = document.createElement('audio'),
            bool = !!elem.canPlayType;
        
        if (bool){  
            bool      = new Boolean(bool);  
            bool.ogg  = elem.canPlayType('audio/ogg; codecs="vorbis"');
            bool.mp3  = elem.canPlayType('audio/mpeg;');
            
            // Mimetypes accepted: 
            //   https://developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
            //   http://bit.ly/iphoneoscodecs
            bool.wav  = elem.canPlayType('audio/wav; codecs="1"');
            bool.m4a  = elem.canPlayType('audio/x-m4a;') || elem.canPlayType('audio/aac;');
        }
        return bool;
    };


    // Firefox has made these tests rather unfun.

    // In FF4, if disabled, window.localStorage should === null.

    // Normally, we could not test that directly and need to do a 
    //   `('localStorage' in window) && ` test first because otherwise Firefox will
    //   throw http://bugzil.la/365772 if cookies are disabled

    // However, in Firefox 4 betas, if dom.storage.enabled == false, just mentioning
    //   the property will throw an exception. http://bugzil.la/599479
    // This looks to be fixed for FF4 Final.

    // Because we are forced to try/catch this, we'll go aggressive.

    // FWIW: IE8 Compat mode supports these features completely:
    //   http://www.quirksmode.org/dom/html5.html
    // But IE8 doesn't support either with local files

    tests['localstorage'] = function() {
        try {
            return !!localStorage.getItem;
        } catch(e) {
            return false;
        }
    };

    tests['sessionstorage'] = function() {
        try {
            return !!sessionStorage.getItem;
        } catch(e){
            return false;
        }
    };


    tests['webWorkers'] = function () {
        return !!window.Worker;
    };


    tests['applicationcache'] =  function() {
        return !!window.applicationCache;
    };

 
    // Thanks to Erik Dahlstrom
    tests['svg'] = function(){
        return !!document.createElementNS && !!document.createElementNS(ns.svg, "svg").createSVGRect;
    };

    tests['inlinesvg'] = function() {
      var div = document.createElement('div');
      div.innerHTML = '<svg/>';
      return (div.firstChild && div.firstChild.namespaceURI) == ns.svg;
    };

    // Thanks to F1lt3r and lucideer
    // http://github.com/Modernizr/Modernizr/issues#issue/35
    tests['smil'] = function(){
        return !!document.createElementNS && /SVG/.test(tostring.call(document.createElementNS(ns.svg,'animate')));
    };

    tests['svgclippaths'] = function(){
        // Possibly returns a false positive in Safari 3.2?
        return !!document.createElementNS && /SVG/.test(tostring.call(document.createElementNS(ns.svg,'clipPath')));
    };


    // input features and input types go directly onto the ret object, bypassing the tests loop.
    // Hold this guy to execute in a moment.
    function webforms(){
    
        // Run through HTML5's new input attributes to see if the UA understands any.
        // We're using f which is the <input> element created early on
        // Mike Taylr has created a comprehensive resource for testing these attributes
        //   when applied to all input types: 
        //   http://miketaylr.com/code/input-type-attr.html
        // spec: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#input-type-attr-summary
        ret['input'] = (function(props) {
            for (var i = 0, len = props.length; i<len; i++) {
                attrs[ props[i] ] = !!(props[i] in inputElem);
            }
            return attrs;
        })('autocomplete autofocus list placeholder max min multiple pattern required step'.split(' '));

        // Run through HTML5's new input types to see if the UA understands any.
        //   This is put behind the tests runloop because it doesn't return a
        //   true/false like all the other tests; instead, it returns an object
        //   containing each input type with its corresponding true/false value 
        
        // Big thanks to @miketaylr for the html5 forms expertise. http://miketaylr.com/
        ret['inputtypes'] = (function(props) {
          
            for (var i = 0, bool, inputElemType, defaultView, len=props.length; i < len; i++) {
              
                inputElem.setAttribute('type', inputElemType = props[i]);
                bool = inputElem.type !== 'text';
                
                // We first check to see if the type we give it sticks.. 
                // If the type does, we feed it a textual value, which shouldn't be valid.
                // If the value doesn't stick, we know there's input sanitization which infers a custom UI
                if (bool){  
                  
                    inputElem.value         = smile;
                    inputElem.style.cssText = 'position:absolute;visibility:hidden;';
     
                    if (/^range$/.test(inputElemType) && inputElem.style.WebkitAppearance !== undefined){
                      
                      docElement.appendChild(inputElem);
                      defaultView = document.defaultView;
                      
                      // Safari 2-4 allows the smiley as a value, despite making a slider
                      bool =  defaultView.getComputedStyle && 
                              defaultView.getComputedStyle(inputElem, null).WebkitAppearance !== 'textfield' &&                  
                              // Mobile android web browser has false positive, so must
                              // check the height to see if the widget is actually there.
                              (inputElem.offsetHeight !== 0);
                              
                      docElement.removeChild(inputElem);
                              
                    } else if (/^(search|tel)$/.test(inputElemType)){
                      // Spec doesnt define any special parsing or detectable UI 
                      //   behaviors so we pass these through as true
                      
                      // Interestingly, opera fails the earlier test, so it doesn't
                      //  even make it here.
                      
                    } else if (/^(url|email)$/.test(inputElemType)) {
                      // Real url and email support comes with prebaked validation.
                      bool = inputElem.checkValidity && inputElem.checkValidity() === false;
                      
                    } else if (/^color$/.test(inputElemType)) {
                        // chuck into DOM and force reflow for Opera bug in 11.00
                        // github.com/Modernizr/Modernizr/issues#issue/159
                        docElement.appendChild(inputElem);
                        docElement.offsetWidth; 
                        bool = inputElem.value != smile;
                        docElement.removeChild(inputElem);

                    } else {
                      // If the upgraded input compontent rejects the :) text, we got a winner
                      bool = inputElem.value != smile;
                    }
                }
                
                inputs[ props[i] ] = !!bool;
            }
            return inputs;
        })('search tel url email datetime date month week time datetime-local number range color'.split(' '));

    }



    // End of test definitions
    // -----------------------



    // Run through all tests and detect their support in the current UA.
    // todo: hypothetically we could be doing an array of tests and use a basic loop here.
    for ( var feature in tests ) {
        if ( hasOwnProperty( tests, feature ) ) {
            // run the test, throw the return value into the Modernizr,
            //   then based on that boolean, define an appropriate className
            //   and push it into an array of classes we'll join later.
            featurename  = feature.toLowerCase();
            ret[ featurename ] = tests[ feature ]();

            classes.push( ( ret[ featurename ] ? '' : 'no-' ) + featurename );
        }
    }
    
    // input tests need to run.
    if (!ret.input) webforms();
    

   
    // Per 1.6: deprecated API is still accesible for now:
    ret.crosswindowmessaging = ret.postmessage;
    ret.historymanagement = ret.history;



    /**
     * Addtest allows the user to define their own feature tests
     * the result will be added onto the Modernizr object,
     * as well as an appropriate className set on the html element
     * 
     * @param feature - String naming the feature
     * @param test - Function returning true if feature is supported, false if not
     */
    ret.addTest = function (feature, test) {
      feature = feature.toLowerCase();
      
      if (ret[ feature ]) {
        return; // quit if you're trying to overwrite an existing test
      } 
      test = !!(test());
      docElement.className += ' ' + (test ? '' : 'no-') + feature; 
      ret[ feature ] = test;
      return ret; // allow chaining.
    };

    /**
     * Reset m.style.cssText to nothing to reduce memory footprint.
     */
    set_css( '' );
    modElem = inputElem = null;

    //>>BEGIN IEPP
    // Enable HTML 5 elements for styling in IE. 
    // fyi: jscript version does not reflect trident version
    //      therefore ie9 in ie7 mode will still have a jScript v.9
    if ( enableHTML5 && window.attachEvent && (function(){ var elem = document.createElement("div");
                                      elem.innerHTML = "<elem></elem>";
                                      return elem.childNodes.length !== 1; })()) {
        // iepp v1.6.2 by @jon_neal : code.google.com/p/ie-print-protector
        (function(win, doc) {
          var elems = 'abbr|article|aside|audio|canvas|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video',
            elemsArr = elems.split('|'),
            elemsArrLen = elemsArr.length,
            elemRegExp = new RegExp('(^|\\s)('+elems+')', 'gi'), 
            tagRegExp = new RegExp('<(\/*)('+elems+')', 'gi'),
            ruleRegExp = new RegExp('(^|[^\\n]*?\\s)('+elems+')([^\\n]*)({[\\n\\w\\W]*?})', 'gi'),
            docFrag = doc.createDocumentFragment(),
            html = doc.documentElement,
            head = html.firstChild,
            bodyElem = doc.createElement('body'),
            styleElem = doc.createElement('style'),
            body;
          function shim(doc) {
            var a = -1;
            while (++a < elemsArrLen)
              // Use createElement so IE allows HTML5-named elements in a document
              doc.createElement(elemsArr[a]);
          }
          function getCSS(styleSheetList, mediaType) {
            var a = -1,
              len = styleSheetList.length,
              styleSheet,
              cssTextArr = [];
            while (++a < len) {
              styleSheet = styleSheetList[a];
              // Get css from all non-screen stylesheets and their imports
              if ((mediaType = styleSheet.media || mediaType) != 'screen') cssTextArr.push(getCSS(styleSheet.imports, mediaType), styleSheet.cssText);
            }
            return cssTextArr.join('');
          }
          // Shim the document and iepp fragment
          shim(doc);
          shim(docFrag);
          // Add iepp custom print style element
          head.insertBefore(styleElem, head.firstChild);
          styleElem.media = 'print';
          win.attachEvent(
            'onbeforeprint',
            function() {
              var a = -1,
                cssText = getCSS(doc.styleSheets, 'all'),
                cssTextArr = [],
                rule;
              body = body || doc.body;
              // Get only rules which reference HTML5 elements by name
              while ((rule = ruleRegExp.exec(cssText)) != null)
                // Replace all html5 element references with iepp substitute classnames
                cssTextArr.push((rule[1]+rule[2]+rule[3]).replace(elemRegExp, '$1.iepp_$2')+rule[4]);
              // Write iepp custom print CSS
              styleElem.styleSheet.cssText = cssTextArr.join('\n');
              while (++a < elemsArrLen) {
                var nodeList = doc.getElementsByTagName(elemsArr[a]),
                  nodeListLen = nodeList.length,
                  b = -1;
                while (++b < nodeListLen)
                  if (nodeList[b].className.indexOf('iepp_') < 0)
                    // Append iepp substitute classnames to all html5 elements
                    nodeList[b].className += ' iepp_'+elemsArr[a];
              }
              docFrag.appendChild(body);
              html.appendChild(bodyElem);
              // Write iepp substitute print-safe document
              bodyElem.className = body.className;
              // Replace HTML5 elements with <font> which is print-safe and shouldn't conflict since it isn't part of html5
              bodyElem.innerHTML = body.innerHTML.replace(tagRegExp, '<$1font');
            }
          );
          win.attachEvent(
            'onafterprint',
            function() {
              // Undo everything done in onbeforeprint
              bodyElem.innerHTML = '';
              html.removeChild(bodyElem);
              html.appendChild(body);
              styleElem.styleSheet.cssText = '';
            }
          );
        })(window, document);
    }
    //>>END IEPP

    // Assign private properties to the return object with prefix
    ret._enableHTML5     = enableHTML5;
    ret._version         = version;

    // Remove "no-js" class from <html> element, if it exists:
    docElement.className = docElement.className.replace(/\bno-js\b/,'') 
                            + ' js '

                            // Add the new classes to the <html> element.
                            + classes.join( ' ' );
    
    return ret;

})(this,this.document);


/*
yepnope.js 1.0.2
http://yepnopejs.com/
https://github.com/SlexAxton/yepnope.js/
Tri-license - WTFPL | MIT | BSD
*/
( function ( window, doc, undef ) {

var docElement            = doc.documentElement,
    sTimeout              = window.setTimeout,
    firstScript           = doc.getElementsByTagName( 'script' )[ 0 ],
    toString              = {}.toString,
    execStack             = [],
    started               = 0,
    // Before you get mad about browser sniffs, please read:
    // https://github.com/Modernizr/Modernizr/wiki/Undetectables
    // If you have a better solution, we are actively looking to solve the problem
    isGecko               = ( 'MozAppearance' in docElement.style ),
    isGeckoLTE18          = isGecko && !! doc.createRange().compareNode,
    isGeckoGT18           = isGecko && ! isGeckoLTE18,
    insBeforeObj          = isGeckoLTE18 ? docElement : firstScript.parentNode,
    // Thanks to @jdalton for showing us this opera detection (by way of @kangax) (and probably @miketaylr too, or whatever...)
    isOpera               = window.opera && toString.call( window.opera ) == '[object Opera]',
    isWebkit              = ( 'webkitAppearance' in docElement.style ),
    isNewerWebkit         = isWebkit && 'async' in doc.createElement('script'),
    strJsElem             = isGecko ? 'object' : ( isOpera || isNewerWebkit ) ? 'img' : 'script',
    strCssElem            = isWebkit ? 'img' : strJsElem,
    isArray               = Array.isArray || function ( obj ) {
      return toString.call( obj ) == '[object Array]';
    },
    isObject              = function ( obj ) {
      return Object(obj) === obj;
    },
    isString              = function ( s ) {
      return typeof s == 'string';
    },
    isFunction            = function ( fn ) {
      return toString.call( fn ) == '[object Function]';
    },
    globalFilters         = [],
    prefixes              = {},
    handler,
    yepnope;

  /* Loader helper functions */
  function isFileReady ( readyState ) {
    // Check to see if any of the ways a file can be ready are available as properties on the file's element
    return ( ! readyState || readyState == 'loaded' || readyState == 'complete' );
  }

  function execWhenReady () {
    var execStackReady = 1,
        i              = -1;

    // Loop through the stack of scripts in the cue and execute them when all scripts in a group are ready
    while ( execStack.length - ++i ) {
      if ( execStack[ i ].s && ! ( execStackReady = execStack[ i ].r ) ) {
        // As soon as we encounter a script that isn't ready, stop looking for more
        break;
      }
    }
    
    // If we've set the stack as ready in the loop, make it happen here
    execStackReady && executeStack();
    
  }

  // Takes a preloaded js obj (changes in different browsers) and injects it into the head
  // in the appropriate order
  function injectJs ( oldObj ) {
    var script = doc.createElement( 'script' ),
        done;

    script.src = oldObj.s;

    // Bind to load events
    script.onreadystatechange = script.onload = function () {

      if ( ! done && isFileReady( script.readyState ) ) {

        // Set done to prevent this function from being called twice.
        done = 1;
        execWhenReady();

        // Handle memory leak in IE
        script.onload = script.onreadystatechange = null;
      }
    };

    // 404 Fallback
    sTimeout( function () {
      if ( ! done ) {
        done = 1;
        execWhenReady();
      }
    }, yepnope.errorTimeout );

    // Inject script into to document
    // or immediately callback if we know there
    // was previously a timeout error
    oldObj.e ? script.onload() : firstScript.parentNode.insertBefore( script, firstScript );
  }

  // Takes a preloaded css obj (changes in different browsers) and injects it into the head
  // in the appropriate order
  // Many credits to John Hann (@unscriptable) for a lot of the ideas here - found in the css! plugin for RequireJS
  function injectCss ( oldObj ) {

    // Create stylesheet link
    var link = doc.createElement( 'link' ),
        done;

    // Add attributes
    link.href = oldObj.s;
    link.rel  = 'stylesheet';
    link.type = 'text/css';

    // Poll for changes in webkit and gecko
    if ( ! oldObj.e && ( isWebkit || isGecko ) ) {
      // A self executing function with a sTimeout poll to call itself
      // again until the css file is added successfully
      var poll = function ( link ) {
        sTimeout( function () {
          // Don't run again if we're already done
          if ( ! done ) {
            try {
              // In supporting browsers, we can see the length of the cssRules of the file go up
              if ( link.sheet.cssRules.length ) {
                // Then turn off the poll
                done = 1;
                // And execute a function to execute callbacks when all dependencies are met
                execWhenReady();
              }
              // otherwise, wait another interval and try again
              else {
                poll( link );
              }
            }
            catch ( ex ) {
              // In the case that the browser does not support the cssRules array (cross domain)
              // just check the error message to see if it's a security error
              if ( ( ex.code == 1e3 ) || ( ex.message == 'security' || ex.message == 'denied' ) ) {
                // if it's a security error, that means it loaded a cross domain file, so stop the timeout loop
                done = 1;
                // and execute a check to see if we can run the callback(s) immediately after this function ends
                sTimeout( function () {
                  execWhenReady();
                }, 0 );
              }
              // otherwise, continue to poll
              else {
                poll( link );
              }
            }
          }
        }, 0 );
      };
      poll( link );

    }
    // Onload handler for IE and Opera
    else {
      // In browsers that allow the onload event on link tags, just use it
      link.onload = function () {
        if ( ! done ) {
          // Set our flag to complete
          done = 1;
          // Check to see if we can call the callback
          sTimeout( function () {
            execWhenReady();
          }, 0 );
        }
      };

      // if we shouldn't inject due to error or settings, just call this right away
      oldObj.e && link.onload();
    }

    // 404 Fallback
    sTimeout( function () {
      if ( ! done ) {
        done = 1;
        execWhenReady();
      }
    }, yepnope.errorTimeout );
    
    // Inject CSS
    // only inject if there are no errors, and we didn't set the no inject flag ( oldObj.e )
    ! oldObj.e && firstScript.parentNode.insertBefore( link, firstScript );
  }

  function executeStack ( ) {
    // shift an element off of the stack
    var i   = execStack.shift();
    started = 1;

    // if a is truthy and the first item in the stack has an src
    if ( i ) {
      // if it's a script, inject it into the head with no type attribute
      if ( i.t ) {
        // Inject after a timeout so FF has time to be a jerk about it and
        // not double load (ignore the cache)
        sTimeout( function () {
          i.t == 'c' ?  injectCss( i ) : injectJs( i );
        }, 0 );
      }
      // Otherwise, just call the function and potentially run the stack
      else {
        i();
        execWhenReady();      	
      }
    }
    else {
      // just reset out of recursive mode
      started = 0;
    }
  }

  function preloadFile ( elem, url, type, splicePoint, docElement, dontExec ) {

    // Create appropriate element for browser and type
    var preloadElem = doc.createElement( elem ),
        done        = 0,
        stackObject = {
          t: type,     // type
          s: url,      // src
        //r: 0,        // ready
          e : dontExec // set to true if we don't want to reinject
        };

    function onload () {

      // If the script/css file is loaded
      if ( ! done && isFileReady( preloadElem.readyState ) ) {

        // Set done to prevent this function from being called twice.
        stackObject.r = done = 1;

        ! started && execWhenReady();

        // Handle memory leak in IE
        preloadElem.onload = preloadElem.onreadystatechange = null;
        sTimeout(function(){ insBeforeObj.removeChild( preloadElem ) }, 0);
      }
    }

    // Just set the src and the data attributes so we don't have differentiate between elem types
    preloadElem.src = preloadElem.data = url;

    // Don't let it show up visually
    ! isGeckoLTE18 && ( preloadElem.style.display = 'none' );
    preloadElem.width = preloadElem.height = '0';


    // Only if we have a type to add should we set the type attribute (a real script has no type)
    if ( elem != 'object' ) {
      preloadElem.type = type;
    }

    // Attach handlers for all browsers
    preloadElem.onload = preloadElem.onreadystatechange = onload;

    // If it's an image
    if ( elem == 'img' ) {
      // Use the onerror callback as the 'completed' indicator
      preloadElem.onerror = onload;
    }
    // Otherwise, if it's a script element
    else if ( elem == 'script' ) {
      // handle errors on script elements when we can
      preloadElem.onerror = function () {
        stackObject.e = stackObject.r = 1;
        executeStack();
      };
    }

    // inject the element into the stack depending on if it's
    // in the middle of other scripts or not
    execStack.splice( splicePoint, 0, stackObject );

    // The only place these can't go is in the <head> element, since objects won't load in there
    // so we have two options - insert before the head element (which is hard to assume) - or
    // insertBefore technically takes null/undefined as a second param and it will insert the element into
    // the parent last. We try the head, and it automatically falls back to undefined.
    insBeforeObj.insertBefore( preloadElem, isGeckoLTE18 ? null : firstScript );

    // If something fails, and onerror doesn't fire,
    // continue after a timeout.
    sTimeout( function () {
      if ( ! done ) {
        // Remove the node from the dom
        insBeforeObj.removeChild( preloadElem );
        // Set it to ready to move on
        // indicate that this had a timeout error on our stack object
        stackObject.r = stackObject.e = done = 1;
        // Continue on
        execWhenReady();
      }
    }, yepnope.errorTimeout );
  }

  function load ( resource, type, dontExec ) {

    var elem  = ( type == 'c' ? strCssElem : strJsElem );
    
    // If this method gets hit multiple times, we should flag
    // that the execution of other threads should halt.
    started = 0;
    
    // We'll do 'j' for js and 'c' for css, yay for unreadable minification tactics
    type = type || 'j';
    if ( isString( resource ) ) {
      // if the resource passed in here is a string, preload the file
      preloadFile( elem, resource, type, this.i++, docElement, dontExec );
    } else {
      // Otherwise it's a resource object and we can splice it into the app at the current location
      execStack.splice( this.i++, 0, resource );
      execStack.length == 1 && executeStack();
    }

    // OMG is this jQueries? For chaining...
    return this;
  }

  // return the yepnope object with a fresh loader attached
  function getYepnope () {
    var y = yepnope;
    y.loader = {
      load: load,
      i : 0
    };
    return y;
  }

  /* End loader helper functions */
    // Yepnope Function
  yepnope = function ( needs ) {

    var i,
        need,
        // start the chain as a plain instance
        chain = this.yepnope.loader;

    function satisfyPrefixes ( url ) {
      // split all prefixes out
      var parts   = url.split( '!' ),
      gLen    = globalFilters.length,
      origUrl = parts.pop(),
      pLen    = parts.length,
      res     = {
        url      : origUrl,
        // keep this one static for callback variable consistency
        origUrl  : origUrl,
        prefixes : parts
      },
      mFunc,
      j;

      // loop through prefixes
      // if there are none, this automatically gets skipped
      for ( j = 0; j < pLen; j++ ) {
        mFunc = prefixes[ parts[ j ] ];
        if ( mFunc ) {
          res = mFunc( res );
        }
      }

      // Go through our global filters
      for ( j = 0; j < gLen; j++ ) {
        res = globalFilters[ j ]( res );
      }

      // return the final url
      return res;
    }

    function loadScriptOrStyle ( input, callback, chain, index, testResult ) {
      // run through our set of prefixes
      var resource     = satisfyPrefixes( input ),
          autoCallback = resource.autoCallback;

      // if no object is returned or the url is empty/0 just exit the load
      if ( resource.bypass ) {
        return;
      }

      // Determine callback, if any
      if ( callback ) {
        callback = isFunction( callback ) ? callback : callback[ input ] || callback[ index ] || callback[ ( input.split( '/' ).pop().split( '?' )[ 0 ] ) ];
      }

      // if someone is overriding all normal functionality
      if ( resource.instead ) {
        return resource.instead( input, callback, chain, index, testResult );
      }
      else {

        chain.load( resource.url, ( ( resource.forceCSS || ( ! resource.forceJS && /css$/.test( resource.url ) ) ) ) ? 'c' : undef, resource.noexec );

        // If we have a callback, we'll start the chain over
        if ( isFunction( callback ) || isFunction( autoCallback ) ) {
          // Call getJS with our current stack of things
          chain.load( function () {
            // Hijack yepnope and restart index counter
            getYepnope();
            // Call our callbacks with this set of data
            callback && callback( resource.origUrl, testResult, index );
            autoCallback && autoCallback( resource.origUrl, testResult, index );
          } );
        }
      }
    }

    function loadFromTestObject ( testObject, chain ) {
        var testResult = !! testObject.test,
            group      = testResult ? testObject.yep : testObject.nope,
            always     = testObject.load || testObject.both,
            callback   = testObject.callback,
            callbackKey;

        // Reusable function for dealing with the different input types
        // NOTE:: relies on closures to keep 'chain' up to date, a bit confusing, but
        // much smaller than the functional equivalent in this case.
        function handleGroup ( needGroup ) {
          // If it's a string
          if ( isString( needGroup ) ) {
            // Just load the script of style
            loadScriptOrStyle( needGroup, callback, chain, 0, testResult );
          }
          // See if we have an object. Doesn't matter if it's an array or a key/val hash
          // Note:: order cannot be guaranteed on an key value object with multiple elements
          // since the for-in does not preserve order. Arrays _should_ go in order though.
          else if ( isObject( needGroup ) ) {
            for ( callbackKey in needGroup ) {
              // Safari 2 does not have hasOwnProperty, but not worth the bytes for a shim
              // patch if needed. Kangax has a nice shim for it. Or just remove the check
              // and promise not to extend the object prototype.
              if ( needGroup.hasOwnProperty( callbackKey ) ) {
                loadScriptOrStyle( needGroup[ callbackKey ], callback, chain, callbackKey, testResult );
              }
            }
          }
        }

        // figure out what this group should do
        handleGroup( group );

        // Run our loader on the load/both group too
        handleGroup( always );

        // Fire complete callback
        if ( testObject.complete ) {
          chain.load( testObject.complete );
        }

    }

    // Someone just decides to load a single script or css file as a string
    if ( isString( needs ) ) {
      loadScriptOrStyle( needs, 0, chain, 0 );
    }
    // Normal case is likely an array of different types of loading options
    else if ( isArray( needs ) ) {
      // go through the list of needs
      for( i = 0; i < needs.length; i++ ) {
        need = needs[ i ];

        // if it's a string, just load it
        if ( isString( need ) ) {
          loadScriptOrStyle( need, 0, chain, 0 );
        }
        // if it's an array, call our function recursively
        else if ( isArray( need ) ) {
          yepnope( need );
        }
        // if it's an object, use our modernizr logic to win
        else if ( isObject( need ) ) {
          loadFromTestObject( need, chain );
        }
      }
    }
    // Allow a single object to be passed in
    else if ( isObject( needs ) ) {
      loadFromTestObject( needs, chain );
    }
  };

  // This publicly exposed function is for allowing
  // you to add functionality based on prefixes on the
  // string files you add. 'css!' is a builtin prefix
  //
  // The arguments are the prefix (not including the !) as a string
  // and
  // A callback function. This function is passed a resource object
  // that can be manipulated and then returned. (like middleware. har.)
  //
  // Examples of this can be seen in the officially supported ie prefix
  yepnope.addPrefix = function ( prefix, callback ) {
    prefixes[ prefix ] = callback;
  };

  // A filter is a global function that every resource
  // object that passes through yepnope will see. You can
  // of course conditionally choose to modify the resource objects
  // or just pass them along. The filter function takes the resource
  // object and is expected to return one.
  //
  // The best example of a filter is the 'autoprotocol' officially
  // supported filter
  yepnope.addFilter = function ( filter ) {
    globalFilters.push( filter );
  };

  // Default error timeout to 10sec - modify to alter
  yepnope.errorTimeout = 1e4;

  // Webreflection readystate hack
  // safe for jQuery 1.4+ ( i.e. don't use yepnope with jQuery 1.3.2 )
  // if the readyState is null and we have a listener
  if ( doc.readyState == null && doc.addEventListener ) {
    // set the ready state to loading
    doc.readyState = 'loading';
    // call the listener
    doc.addEventListener( 'DOMContentLoaded', handler = function () {
      // Remove the listener
      doc.removeEventListener( 'DOMContentLoaded', handler, 0 );
      // Set it to ready
      doc.readyState = 'complete';
    }, 0 );
  }

  // Attach loader &
  // Leak it
  window.yepnope = getYepnope();

} )( this, this.document );

/*
*******************
***** Yepnope CSS Force prefix
*******************
*/
( function ( yepnope ) {
  // add each prefix
  yepnope.addPrefix( 'css', function ( resource ) {
    // Set the force flag
    resource.forceCSS = true;
    //carry on
    return resource;
  } );
} )( this.yepnope );

/*
*******************
***** usage: log('inside coolFunc', this, arguments);
***** paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog
*******************
*/
window.log = function(){
  log.history = log.history || [];   // store logs to an array for reference
  log.history.push(arguments);
  if(this.console) {
    arguments.callee = arguments.callee.caller;
    var newarr = [].slice.call(arguments);
    (typeof console.log === 'object' ? log.apply.call(console.log, console, newarr) : console.log.apply(console, newarr));
  }
};

// make it safe to use console.log always
(function(b){function c(){}for(var d="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,timeStamp,profile,profileEnd,time,timeEnd,trace,warn".split(","),a;a=d.pop();){b[a]=b[a]||c}})((function(){try
{console.log();return window.console;}catch(err){return window.console={};}})());

/*
*解决ie6下不支持背景缓存
*/
if (!+'\v1' && !('maxHeight' in document.body.style)) {
	try{ 
		document.execCommand("BackgroundImageCache", false, true);
	}catch(e){}
}


/*
*全局常用js、css路由
*/
(function(win){
	var root = '/github/phpwind-front-end/js/',
	ver = '8.7beta',
	alias = {
    	'tabs': 'uilibs/tabs/tabs',
    	'tabs_slideshow': 'uilibs/tabs/tabs.slideshow',
    	
    	'overlay': 'uilibs/overlay/overlay',
    	'overlay_apple': 'uilibs/overlay/overlay.apple',
    	
    	'dateinput': 'uilibs/dateinput/dateinput',
    	
    	'chosen': 'uilibs/chosen/chosen',
    	
    	'rangeinput': 'uilibs/rangeinput/rangeinput',
    	
    	'scrollable': 'uilibs/scrollable/scrollable',
    	'scrollable-autoscroll': 'uilibs/scrollable/scrollable.autoscroll',
    	'scrollable-navigator': 'uilibs/scrollable/scrollable.navigator',
  
    	'tooltip': 'uilibs/tooltip/tooltip',
    	'tooltip_slide': 'uilibs/tooltip/tooltip.slide',
    	'tooltip_dynamic': 'uilibs/tooltip/tooltip.dynamic',
    	
    	'expose':'uilibs/toolbox/expose',
    	'flashembed':'uilibs/toolbox/flashembed',
    	'mousewheel':'uilibs/toolbox/mousewheel',
    	
    	'validate':'utils/jquery.validate',
    	'form':'utils/jquery.form'
   	},
	alias_css = {
		'chosen':'uilibs/chosen/chosen'
	};
	for(var i in alias){
		if (alias.hasOwnProperty(i)) {
			alias[i] = root + alias[i] +'.js?v='+ver;
		}
	}
	for(var i in alias_css){
		if (alias_css.hasOwnProperty(i)) {
			alias_css[i] = 'css!' + root + alias_css[i] +'.css?v='+ver;
		}
	}
	win.alias = alias;
	win.alias_css = alias_css;
})(this);

