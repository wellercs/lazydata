// LazyData v1.0 - jQuery lazydata plugin
// (c) 2014 Chris Weller
// License: http://www.opensource.org/licenses/mit-license.php
// Credits: http://dumpk.com/2013/06/02/how-to-create-infinite-scroll-with-ajax-on-jquery/
(function ( $ ) {

    $.lazydata = function( options ) {
        $.lazydata.defaults = {
            ajaxBaseURL : "index.cfm?",
            alertSelector : ".alert",
            alertErrorClass : "alert-danger",
            chainLoad : false,
            pageIndexVariable : "PageIndex",
            pageIndexValue : 0,
            appendToSelector : ".results",
            lazyImageSelector : "img.lazy",
            loadingSelector : ".loading",
            triggerSelector : ".scroll-next:last",
            noResultsClass : "alert-warning",
            noResultsMessage : "No results",
            onLoadResults : function() {},
            onLoadResultsError : function(jqXHR, textStatus, errorThrown) { handleLoadResultsError(jqXHR, textStatus, errorThrown); },
            onLoadResultsFailure : function(data) { handleLoadResultsFailure(data); },
            onLoadResultsSuccess : function(data) { handleLoadResultsSuccess(data); },
            debug: false
        };

        var
            settings = $.extend( {}, $.lazydata.defaults, options ),
            ajaxProcessing = false;
            dataComplete = false;
            pageIndex = settings.pageIndexValue;
            nextPageStartRow = 0;
            nextPageEndRow = 0;

        if ( settings.debug === true ) {
            debug(settings);
        }

        $(document).scroll(function(e){
            if ( $.lazydata.isInScroll(settings.triggerSelector,settings.debug) && !ajaxProcessing && !dataComplete ) {
                loadResults();
            };
        });

        function loadResults() {
            $(settings.loadingSelector).show();

            ajaxProcessing = true;

            if ( nextPageStartRow !== 0 ) {
                $(settings.loadingSelector).html("Loading " + nextPageStartRow + " of " + nextPageEndRow + "...");
            }

            $.ajax({
                url: settings.ajaxBaseURL + "&" + settings.pageIndexVariable + "=" + pageIndex,
                type: 'GET',
                dataType: 'json',
                error: function(jqXHR, textStatus, errorThrown) {
                    settings.onLoadResultsError.call( this, jqXHR, textStatus, errorThrown );
                },
                success: function(data, textStatus, jqXHR) {
                    if ( data.SUCCESS ) {
                        settings.onLoadResultsSuccess.call( this, data );
                    }
                    else {
                        settings.onLoadResultsFailure.call( this, data );
                    }
                }
            });

            settings.onLoadResults.call( this );
        }

        function handleLoadResultsError(jqXHR, textStatus, errorThrown) {
            var errorMessage = "";
            if ( typeof textStatus !== 'undefined' ) {
                errorMessage += textStatus;
            }
            if ( typeof errorThrown !== 'undefined' ) {
                errorMessage += errorThrown;        
            }
            if ( errorMessage === "" ) {
                errorMessage = "error";
            }
            $(settings.alertSelector).addClass(settings.alertErrorClass).html(errorMessage).fadeIn("slow", function(){});
            if ( settings.debug === true ) {
                debug(errorMessage);
            }
        }

        function handleLoadResultsFailure(data) {
            var message = "failure";
            if ( typeof data.ERRORMESSAGE !== 'undefined' ) {
                message = data.ERRORMESSAGE;
            }
            $(settings.alertSelector).addClass(settings.alertErrorClass).html(message).fadeIn("slow", function(){});
            if ( settings.debug === true ) {
                debug(data);
            }
        }

        function handleLoadResultsSuccess(data) {
            $(settings.appendToSelector).append(data.DATA.RESULTS);
            $(settings.loadingSelector).hide();
            $(settings.lazyImageSelector).show().lazyload({});
            ajaxProcessing = false;
            if ( data.DATA.COMPLETE ) {
                dataComplete = true;
                if ( data.DATA.RECORDCOUNT === 0 ) {
                    $(settings.alertSelector).addClass(settings.noResultsClass).html(settings.noResultsMessage).fadeIn("slow", function(){});
                }
            } else {
                nextPageStartRow = data.DATA.NEXTPAGESTARTROW;
                nextPageEndRow = data.DATA.NEXTPAGEENDROW;
                if ( settings.chainLoad === true ) {
                    window.setTimeout(loadResults,100);
                }
            }
            pageIndex = data.DATA.NEXTPAGEINDEX;
            if ( settings.debug === true ) {
                debug(data);
            }
        }

        loadResults();

        // returns the jQuery object to allow for chainability
        return this;
    };

    // Private function for debugging.
    function debug( $obj ) {
        if ( window.console && window.console.log ) {
            window.console.log( $obj );
        }
    };

    $.lazydata.isInScroll = function( elem, debug ) {
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();

        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(elem).height();

        if ( debug === true ) {
            var scrollDebug = {};
            scrollDebug.elem = elem;
            scrollDebug.docViewTop = docViewTop;
            scrollDebug.docViewBottom = docViewBottom;
            scrollDebug.elemTop = elemTop;
            scrollDebug.elemBottom = elemBottom;
            if ( window.console && window.console.log ) {
                window.console.log( scrollDebug );
            }
        }

        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    };   

}( jQuery ));