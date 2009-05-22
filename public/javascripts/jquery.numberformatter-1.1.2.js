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
    
    jQuery.numberFormatter.formatNumber = function(str, options) {
      var left_right = str.split(".");
      var left = left_right[0];
      var right = left_right[1]; 
      options.decimalsRightOfZero = options.decimalsRightOfZero || 0;
      if (options.grouping) {
        left = s.reverse(s.join(s.partition(s.reverse(left), options.grouping, options.grouping), options.group));
      }
      var result = (left +
                    "." + 
                    nf.pad(right.substring(0, options.decimalsRightOfZero), options.decimalsRightOfZero, "0")
                   ).replace(/\.$/, "");                      
      if (right.charAt(options.decimalsRightOfZero).match(/[5-9]/)) {
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

    // strip all the invalid characters at the beginning and the end
    // of the format, and we'll stick them back on at the end
    // make a special case for the negative sign "-" though, so
    // we can have formats like -$23.32   
    function parseOptionsFormat(options) {
      var match = /^(-?)([^-0#,.]*)([-0#,.]*)([^-0#,.]*)$/.exec(options.format)
			if (!match) throw "invalid number format " + options.format;
      options.negativeInFront = (match[1] == "-");
      options.prefix = match[2];
      options.format = match[3];
      options.suffix = match[4];
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

     var options = jQuery.extend({},jQuery.fn.format.defaults, options);
		 parseOptionsFormat(options); 

     var formatData = formatCodes(options.locale.toLowerCase());

     var dec = formatData.dec;
     var group = formatData.group;
     var neg = formatData.neg;

     return this.each(function(){

       var text = new String(jQuery(this).valOrText());
       
        // now we need to convert it into a number
        // technical debt: what happens to numbers with more than one decimal or negative sign?
        var number = parseFloat(text.replace(new RegExp('[' + group + ']', "g"), "")
                                    .replace(dec,".")
                                    .replace(neg,"-"), 10);

        // special case for percentages
        if (options.suffix == "%")
           number = number * 100;

        var returnString = "";

        var decimalValue = number % 1;
        if (options.format.indexOf(".") > -1)
        {
           var decimalPortion = dec;
           var decimalFormat = options.format.substring(options.format.lastIndexOf(".")+1);
           var decimalString = new String(decimalValue.toFixed(decimalFormat.length));
           decimalString = decimalString.substring(decimalString.lastIndexOf(".")+1);
           for (var i=0; i<decimalFormat.length; i++)
           {
              if (decimalFormat.charAt(i) == '#' && decimalString.charAt(i) != '0')
              {
                 decimalPortion += decimalString.charAt(i);
                  continue;
               }
               else if (decimalFormat.charAt(i) == '#' && decimalString.charAt(i) == '0')
               {
                  var notParsed = decimalString.substring(i);
                  if (notParsed.match('[1-9]'))
                  {
                      decimalPortion += decimalString.charAt(i);
                      continue;
                  }
                  else
                  {
                      break;
                  }
              }
              else if (decimalFormat.charAt(i) == "0")
              {
                 decimalPortion += decimalString.charAt(i);
              }
           }
           returnString += decimalPortion
        }
        else
           number = Math.round(number);

        var ones = Math.floor(number);
        if (number < 0)
            ones = Math.ceil(number);

        var onePortion = "";
        if (ones == 0)
        {
           onePortion = "0";
        }
        else
        {
           // find how many digits are in the group
           var onesFormat = "";
           if (options.format.indexOf(".") == -1)
              onesFormat = options.format;
           else
              onesFormat = options.format.substring(0, options.format.indexOf("."));
           var oneText = new String(Math.abs(ones));
           var groupLength = 9999;
           if (onesFormat.lastIndexOf(",") != -1)
               groupLength = onesFormat.length - onesFormat.lastIndexOf(",")-1;
           var groupCount = 0;
           for (var i=oneText.length-1; i>-1; i--)
           {
             onePortion = oneText.charAt(i) + onePortion;

             groupCount++;

             if (groupCount == groupLength && i!=0)
             {
                 onePortion = group + onePortion;
                 groupCount = 0;
             }

           }
        }
        returnString = onePortion + returnString;

        // handle special case where negative is in front of the invalid
        // characters
        if (number < 0 && options.negativeInFront && options.prefix.length > 0)
        {
           options.prefix = neg + options.prefix;
        }
        else if (number < 0)
        {
           returnString = neg + returnString;
        }

        if (! options.decimalSeparatorAlwaysShown) {
            if (returnString.lastIndexOf(dec) == returnString.length - 1) {
                returnString = returnString.substring(0, returnString.length - 1);
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