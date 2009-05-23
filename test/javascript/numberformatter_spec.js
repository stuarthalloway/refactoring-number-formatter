require("spec_helper.js");
require("../../public/javascripts/jquery.numberformatter-1.1.2.js");

Screw.Unit(function(){        
  describe("numberFormatter.normalizeOptions", function() {

    it("detects required decimal zeros", function() {
      var options = {format: "##.###0CRAP"}
      expect($.numberFormatter.normalizeOptions(options).decimalDigits).to(equal, 4);
    });

    it("ignores pure optional zeros", function() {
      var options = {format: "##.###"}
      expect($.numberFormatter.normalizeOptions(options).decimalDigits).to(equal, 0);
    });

    it("detects absence digit groups", function() {
      var options = {format: "##"}
      expect($.numberFormatter.normalizeOptions(options).digitsPerGroup).to(equal, null);
    });

    it("detects presence of digit groups", function() {
      var options = {format: "#,#####"}
      expect($.numberFormatter.normalizeOptions(options).digitsPerGroup).to(equal, 5);
    });

  });
     
  describe("times100",function() {

    it ("works without decimal point", function() {
      expect($.numberFormatter.times100("10")).to(equal, "1000");
    });

    it ("works with decimal point", function() {
      expect($.numberFormatter.times100("3.14159")).to(equal, "314.15900");
    });

  });
  
  describe("numberFormatter.bump", function() {

    it("bumps", function() {
      expect($.numberFormatter.bump("123.45")).to(equal, "123.46");
    });

    it("carries", function() {
      expect($.numberFormatter.bump("129.99")).to(equal, "130.00");
    });
    
  });

  describe("numberFormatter.formatNumber", function() {
    
    it("handles zero format digits", function() {
      expect($.numberFormatter.formatNumber("123.45", {decimalDigits: 0, dec: "."})).to(equal, "123");
    });

    it("handles a few format digits", function() {
      expect($.numberFormatter.formatNumber("0.0136", {decimalDigits: 2, dec: "."})).to(equal, "0.01");
    });

    it("handles a lot of format digits", function() {
      expect($.numberFormatter.formatNumber("1.01234567890001", {decimalDigits: 14, dec: "."})).to(equal, "1.01234567890001");
    });

    it("handles more format digits than actual digits", function() {
      expect($.numberFormatter.formatNumber("1.5", {decimalDigits: 8, dec: "."})).to(equal, "1.50000000");
    });

    it("rounds correctly", function() {
      expect($.numberFormatter.formatNumber("1.875", {decimalDigits: 2, dec: "."})).to(equal, "1.88");
    });
    
  });
  
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
      $("#value").text("444.555.666");
      expect($("#value").parse({locale: "de"})).to(equal, [444555666]);
    });

    it("knows all the valid number characters", function(){
      $("#value").text("-123,456.789");
      expect($("#value").parse()).to(equal, [-123456.789]);
    });

    it("ignores junk at the end", function(){
      $("#value").text("36XL");
      expect($("#value").parse()[0]).to(equal, 36);
    });

    it("ignores everything after the first non-number character", function(){
      $("#value").text("14 to 16");
      expect($("#value").parse()[0]).to(equal, 14);
    });
  });
  
  describe("format", function(){
    it("works with numbers with higher precision than floats", function(){
      $("#value").text("123456789.9876543210123456789");
      $("#value").format({format: "##.0000000000000000000"});
      expect($("#value").text()).to(equal, "123456789.9876543210123456789");
    });

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

    it("defaults to not show decimal for whole numbers", function(){
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

    it("handles numbers that already contain non-us formatting", function(){
      $("#value").text("987.654.321");
      $("#value").format({locale: "de"});
      expect($("#value").text()).to(equal, "987.654.321,00");
    });

    it("handles numbers that already contain *bad* formatting", function(){
      $("#value").text("1,2,3,4,5");
      $("#value").format({format: "#"});
      expect($("#value").text()).to(equal, "12345");
    });

  });
});
