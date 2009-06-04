/**
 * jquery.numberformatter - Formatting/Parsing Numbers in jQuery
 * Written by Michael Abernethy (mike@abernethysoft.com)
 *
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * Date: 2/6/08
 *
 * @author Michael Abernethy
 * @version 1.1.2
 *
 * many thanks to advweb.nanasi.jp for his bug fixes
 *
 * This plugin can be used to format numbers as text and parse text as Numbers
 * Because we live in an international world, we cannot assume that everyone
 * uses "," to divide thousands, and "." as a decimal point.
 *
 * The format() function will take the text within any selector by calling
 * text() or val() on them, getting the String, and applying the specified format to it.
 * It will return the jQuery object
 *
 * The parse() function will take the text within any selector by calling text()
 * or val() on them, turning the String into a Number, and returning these
 * values in a Number array.
 * It WILL BREAK the jQuery chain, and return an Array of Numbers.
 *
 * The syntax for the formatting is:
 * 0 = Digit
 * # = Digit, zero shows as absent
 * . = Decimal separator
 * - = Negative sign
 * , = Grouping Separator
 * % = Percent (multiplies the number by 100)
 * For example, a format of "#,###.00" and text of 4500.20 will
 * display as "4.500,20" with a locale of "de", and "4,500.20" with a locale of "us"
 *
 *
 * As of now, the only acceptable locales are
 * United States -> "us"
 * Arab Emirates -> "ae"
 * Egypt -> "eg"
 * Israel -> "il"
 * Japan -> "jp"
 * South Korea -> "kr"
 * Thailand -> "th"
 * China -> "cn"
 * Hong Kong -> "hk"
 * Taiwan -> "tw"
 * Australia -> "au"
 * Canada -> "ca"
 * Great Britain -> "gb"
 * India -> "in"
 * Germany -> "de"
 * Vietnam -> "vn"
 * Spain -> "es"
 * Denmark -> "dk"
 * Austria -> "at"
 * Greece -> "gr"
 * Brazil -> "br"
 * Czech -> "cz"
 * France  -> "fr"
 * Finland -> "fi"
 * Russia -> "ru"
 * Sweden -> "se"
 * Switzerland -> "ch"
 *
 * TODO
 * Separate positive and negative patterns separated by a ":" (e.g. use (#,###) for accounting)
 * More options may come in the future (currency)
 **/
  (function(jQuery) {
    jQuery.numberFormatter = {};
    var nf = jQuery.numberFormatter; 
    nf.string = {};
    var s = nf.string;
    
    s.reverse = function(str) {
      var result = "";
      for (var n=str.length-1; n>=0; n--) {
        result += str[n];
      }                  
      return result;
    };
    s.partition = function(str, size, step) {
      var result = [];
      for (var pos = 0; pos < str.length; pos+=step) { 
        result.push(str.substring(pos,pos+size));
      }
      return result;
    };
    s.join = function(coll, delim) {
      var result = [];
      for (var n = 0; n < coll.length; n++) { 
        result += coll[n];
        result += delim;
      }
      return result.substring(0, result.length - delim.length);
    }
    
    nf.bumpTable = {
      "0": "1",
      "1": "2",
      "2": "3",
      "3": "4",
      "4": "5",
      "5": "6",
      "6": "7",
      "7": "8",
      "8": "9",
      "9": "0",
    };
    nf.bump = function(str) {
      for (var n=str.length - 1; n >= 0; n--) {
        str = str.slice(0,n) + (jQuery.numberFormatter.bumpTable[str[n]] || str[n]) + str.substring(n+1);
        if (str[n].match(/[1-9]/)) break;
      }
      return str;
    };
    nf.pad = function(str, length, padding) {
      while (str.length < length) {
        str = str + padding;
      }                   
      return str;
    }; 
    nf.times100 = function(str) {
      var result = str + "00";
      var dotIndex = result.indexOf('.');
      if (dotIndex != -1) {
        result = result.substring(0,dotIndex) + result.substring(dotIndex+1, dotIndex+3) + "." + result.substring(dotIndex+3);
      }                                                                                                                     
      return result;
    }

    nf.countDecimalDigits = function(format) {
      var match = format.match(/\.[#0]+0/)      
      if (match) {
        return match[0].length - 1;
      }
      return 0;
    };

    nf.countOptionalDecimalDigits = function(format) {
      var match = format.match(/\.[#0]/)      
      if (match) {
        return match[0].length - 1;
      }
      return 0;
    };
    
    nf.countDigitsPerGroup = function(format) {
      var match = format.match(/,(.*?)(\.|$)/)
      if (match) {
        return match[1].length;
      }
      return null;
    }
    
    // strip all the invalid characters at the beginning and the end
    // of the format, and we'll stick them back on at the end
    // make a special case for the negative sign "-" though, so
    // we can have formats like -$23.32   
    nf.normalizeOptions = function(options) {
      var options = jQuery.extend({},jQuery.fn.format.defaults, options);
      var match = /^(-?)([^-0#,.]*)([-0#,.]*)([^-0#,.]*)$/.exec(options.format)
			if (!match) throw "invalid number format " + options.format;
      options.negativeInFront = (match[1] == "-");
      options.prefix = match[2];
      options.format = match[3]; 
      options.suffix = match[4];
      options.decimalDigits = nf.countDecimalDigits(options.format);
      options.optionalDecimalDigits = nf.countOptionalDecimalDigits(options.format);
      options.digitsPerGroup = nf.countDigitsPerGroup(options.format);  
      
      var formatData = formatCodes(options.locale.toLowerCase());
      options.dec = formatData.dec;
      options.group = formatData.group;
      options.neg = formatData.neg; 
      return options;
    };
    
    // called only by formatNumber         
    // inserts grouping punctuation, e.g. 12345 => 12,345
    nf.formatLeft = function(left, options) {
      if (options.digitsPerGroup) {
        return s.reverse(s.join(s.partition(s.reverse(left), options.digitsPerGroup, options.digitsPerGroup), options.group));
      } 
      return left;
    }
     
    // called only by formatNumber, which finishes the job by rounding if necessary
    // truncates to the correct amount of digits, possibly padding with 0 on the right
    nf.formatRight = function(right, options) {
      var digits = Math.max(options.decimalDigits, 
                            Math.min(options.optionalDecimalDigits || 0, right.length));
      return nf.pad(right.substring(0, digits), digits, "0");
    }

    nf.formatNumber = function(str, options) {
      var match = str.split(/^(-?)(\d*)\.?(\d*?)0*$/);
      var sign = match[1];
      var left = match[2];
      var right = match[3];
      var result = (nf.formatLeft(left, options) +
                    options.dec + 
                    nf.formatRight(right, options)
                   ).replace(/\.$/, "");                      
      if (right.charAt(options.decimalDigits).match(/[5-9]/)) {
        //need to round up
        result = jQuery.numberFormatter.bump(result);
      }
      return result;                      
    }  


     function FormatData(dec, group, neg) {
       this.dec = dec;
       this.group = group;
       this.neg = neg;
     };

     function formatCodes(locale) {

         // default values
         var dec = ".";
         var group = ",";
         var neg = "-";

         if (locale == "us" ||
             locale == "ae" ||
             locale == "eg" ||
             locale == "il" ||
             locale == "jp" ||
             locale == "sk" ||
             locale == "th" ||
             locale == "cn" ||
             locale == "hk" ||
             locale == "tw" ||
             locale == "au" ||
             locale == "ca" ||
             locale == "gb" ||
             locale == "in"
            )
         {
              dec = ".";
              group = ",";
         }

         else if (locale == "de" ||
             locale == "vn" ||
             locale == "es" ||
             locale == "dk" ||
             locale == "at" ||
             locale == "gr" ||
             locale == "br"
            )
         {
              dec = ",";
              group = ".";
         }
         else if (locale == "cz" ||
              locale == "fr" ||
             locale == "fi" ||
             locale == "ru" ||
             locale == "se"
            )
         {
              group = " ";
              dec = ",";
         }
         else if (locale == "ch")
          {
              group = "'";
              dec = ".";
          }

        return new FormatData(dec, group, neg);

    };  


 jQuery.fn.parse = function(options) {

     var options = jQuery.extend({},jQuery.fn.parse.defaults, options);

     var formatData = formatCodes(options.locale.toLowerCase());

     var dec = formatData.dec;
     var group = formatData.group;
     var neg = formatData.neg;

     var valid = "1234567890.-";

     var array = [];
     this.each(function(){

       var text = new String(jQuery(this).valOrText());
       text = text.replace(new RegExp('[' + group + ']', "g"), "")
                  .replace(dec, ".")
                  .replace(neg, "-");
       var hasPercent = (text.charAt(text.length-1)=="%");
       var number = parseFloat(text, 10);
       if (hasPercent)
       {
          number = number / 100;
          number = number.toFixed(text.length-1);
       }
       array.push(number);      

     });

     return array;
 };
        
  jQuery.fn.valOrText = function() {
    return (jQuery(this).is(":input") ? jQuery.fn.val : jQuery.fn.text).apply(this,arguments);
  };
 
  jQuery.fn.format = function(options) {

    options = nf.normalizeOptions(options); 

    return this.each(function(){

      var text = new String(jQuery(this).valOrText());

      text = text.replace(new RegExp('[' + options.group + ']', "g"), "")
                 .replace(options.dec,".")
                 .replace(options.neg,"-");

      // special case for percentages
      if (options.suffix == "%") {
        text = nf.times100(text);
      }
      
      var negative = parseFloat(text, 10) < 0;
      var returnString = nf.formatNumber(text, options).replace(/^-/,"");
    
      // handle special case where negative is in front of the invalid characters
      if (negative) {
        if (options.negativeInFront && options.prefix.length > 0) {
          options.prefix = options.neg + options.prefix;
        } else {
          returnString = options.neg + returnString;
        }
      } 
      
      if (options.decimalSeparatorAlwaysShown) {
        if (returnString.indexOf(options.dec) == -1) {
          returnString = returnString + options.dec;
        }
      }
      
      returnString = options.prefix + returnString + options.suffix;

      jQuery(this).valOrText(returnString);
    });
  };

  jQuery.fn.parse.defaults = {
    locale: "us",
    decimalSeparatorAlwaysShown: false
  };

  jQuery.fn.format.defaults = {
    format: "#,###.00",
    locale: "us",
    decimalSeparatorAlwaysShown: false
  };
})(jQuery);