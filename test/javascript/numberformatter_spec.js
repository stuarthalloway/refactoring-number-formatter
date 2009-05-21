require("spec_helper.js");
require("../../public/javascripts/jquery-1.3.2.js");
require("../../public/javascripts/jquery.numberformatter-1.1.2.js");

Screw.Unit(function(){
  describe("formatNumber", function(){
    it("defaults to us #,###.00", function(){
      expect(formatNumber(1999).to(equal, "boom"));
    });
  });
});
