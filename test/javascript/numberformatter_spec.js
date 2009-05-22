require("spec_helper.js");
require("../../public/javascripts/jquery-1.3.2.js");
require("../../public/javascripts/jquery.numberformatter-1.1.2.js");

Screw.Unit(function(){  
  describe("parse", function() {
    it("extracts a plain number", function(){
      $("#value").text("777");
      expect($("#value").parse()).to(equal, [777]);
    });

    it("extracts a number with a decimal", function(){
      $("#value").text("333.55");
      expect($("#value").parse()).to(equal, [333.55]);
    });

    it("extracts a number with the standard group delimiter", function(){
      $("#value").text("111,222,333");
      expect($("#value").parse()).to(equal, [111222333]);
    });

    it("extracts a number with a specified group delimiter", function(){
      $("#value").text("111.222.333");
      expect($("#value").parse({locale: "de"})).to(equal, [111222333]);
    });
  });
  
  describe("format", function(){
    it("defaults to us #,###.00", function(){
      $("#value").text(1999);
      $("#value").format();
      expect($("#value").text()).to(equal, "1,999.00");
    });

    it("supports percents", function(){
      $("#value").text(".25");
      $("#value").format({format: "##%"});
      expect($("#value").text()).to(equal, "25%");
    });

    it("works with input elements", function(){
      $("#input").val(99);
      $("#input").format();
      expect($("#input").val()).to(equal, "99.00");
    });

    it("ignores non-format characters at start and end", function(){
      $("#value").text("42");
      $("#value").format({format: "BOO ## YAA"});
      expect($("#value").text()).to(equal, "BOO 42 YAA");
    });

    it("handles negative prefix, then non-format characters then number, then non-format", function(){
      $("#value").text("-500,000.77");
      $("#value").format({format: "-$#.#"});
      expect($("#value").text()).to(equal, "-$500000.8");
    });

    it("throws up if it finds non-format characters in the middle", function(){
      $("#value").text("767");
      expect(function () {$("#value").format({format: "## AND ##"})}).to(throw_object, "invalid number format ## AND ##");
    });

    it("default to not show decimal for whole numbers", function(){
      $("#value").text("15");
      $("#value").format({format: "#.##"});
      expect($("#value").text()).to(equal, "15");
    });

    it("shows decimal for whole numbers if forced", function(){
      $("#value").text("15");
      $("#value").format({format: "#.##", decimalSeparatorAlwaysShown: true});
      expect($("#value").text()).to(equal, "15.");
    });

    it("handles negative numbers", function(){
      $("#value").text("-700");
      $("#value").format();
      expect($("#value").text()).to(equal, "-700.00");
    });

    it("rounds positive numbers up", function(){
      $("#value").text("11.125");
      $("#value").format();
      expect($("#value").text()).to(equal, "11.13");
    });

    it("rounds negative numbers down", function(){
      $("#value").text("-11.125");
      $("#value").format();
      expect($("#value").text()).to(equal, "-11.13");
    });

    it("handles numbers that already contain formatting", function(){
      $("#value").text("123,456,789");
      $("#value").format({format: "#"});
      expect($("#value").text()).to(equal, "123456789");
    });

    it("handles numbers that already contain *bad* formatting", function(){
      $("#value").text("1,2,3,4,5");
      $("#value").format({format: "#"});
      expect($("#value").text()).to(equal, "12345");
    });

  });
});
