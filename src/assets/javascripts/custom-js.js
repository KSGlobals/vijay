$(window).scroll(function () { $(".clsNav").toggleClass("scrolled", $(this).scrollTop() > 75) });

$(document).ready(function () {
    $("#openPositionBtn").click(function () {

        $('html, body').animate({
            scrollTop: $("#openPositionDiv").offset().top
        }, 2000);
    });
    $("#openDirectorsBtn").click(function () {
        $('html, body').animate({
            scrollTop: $("#openDirectorsDiv").offset().top
        }, 2000);
    });
    $("#openLeadershipBtn").click(function () {
        $('html, body').animate({
            scrollTop: $("#openLeadershipDiv").offset().top
        }, 2000);
    });
    $("#openAdvisorBtn").click(function () {
        $('html, body').animate({
            scrollTop: $("#openAdvisorDiv").offset().top
        }, 2000);
    });
    $("#openAwardsBtn").click(function () {
        $('html, body').animate({
            scrollTop: $("#openAwardsDiv").offset().top
        }, 2000);
    });
    $("#openCardyFamilyBtn").click(function () {
        $('html, body').animate({
            scrollTop: $("#openCardyFamilyDiv").offset().top
        }, 2000);
    });
    $("#openCardyFiscalBtn").click(function () {
        $('html, body').animate({
            scrollTop: $("#openCardyFiscalDiv").offset().top
        }, 2000);
    });
    $("#openCardyHealthBtn").click(function () {
        $('html, body').animate({
            scrollTop: $("#openCardyHealthDiv").offset().top
        }, 2000);
    });
    $("#openCardyWorkBtn").click(function () {
        $('html, body').animate({
            scrollTop: $("#openCardyWorkDiv").offset().top
        }, 2000);
    });
    $("#openCardyPicBtn").click(function () {
        $('html, body').animate({
            scrollTop: $("#openCardyPicDiv").offset().top
        }, 2000);
    });

    $(".openPositionBtn1").click(function () {
        $('html, body').animate({
            scrollTop: $("#openPositionDiv1").offset().top
        }, 2000);
    });
    $(".openDirectorsBtn1").click(function () {
        $('html, body').animate({
            scrollTop: $("#openDirectorsDiv1").offset().top
        }, 2000);
    });
    $(".openLeadershipBtn1").click(function () {
        $('html, body').animate({
            scrollTop: $("#openLeadershipDiv1").offset().top
        }, 2000);
    });
    $(".openAdvisorBtn1").click(function () {
        $('html, body').animate({
            scrollTop: $("#openAdvisorDiv1").offset().top
        }, 2000);
    });
    $(".openAwardsBtn1").click(function () {
        $('html, body').animate({
            scrollTop: $("#openAwardsDiv1").offset().top
        }, 2000);
    });
    $(".openCardyFamilyBtn1").click(function () {
        $('html, body').animate({
            scrollTop: $("#openCardyFamilyDiv1").offset().top
        }, 2000);
    });
    $(".openCardyFiscalBtn1").click(function () {
        $('html, body').animate({
            scrollTop: $("#openCardyFiscalDiv1").offset().top
        }, 2000);
    });
    $(".openCardyHealthBtn1").click(function () {
        $('html, body').animate({
            scrollTop: $("#openCardyHealthDiv1").offset().top
        }, 2000);
    });
    $(".openCardyWorkBtn1").click(function () {
        $('html, body').animate({
            scrollTop: $("#openCardyWorkDiv1").offset().top
        }, 2000);
    });
    $(".openCardyPicBtn1").click(function () {
        $('html, body').animate({
            scrollTop: $("#openCardyPicDiv1").offset().top
        }, 2000);
    });
});

// $( document ).ready(function() {
//     var btn = $("#scroll-top");
//     $(window).scroll(function () {
//         $(window).scrollTop() > 300 ? btn.addClass("show") : btn.removeClass("show");
//     });

//     btn.on("click", function (e) {
//         e.preventDefault(), $("html, body").animate({ scrollTop: 0 }, "300");
//     });
// });


$(document).ready(function(){
	"use strict";
  var offSetTop = 100;
  var $scrollToTopButton = $('.showArrow');
	$(window).scroll(function(){
		if ($(this).scrollTop() > offSetTop) {
			$scrollToTopButton.fadeIn('slow');
		} else {
			$scrollToTopButton.fadeOut('slow');
		}
	});

	//Click event to scroll to top
	$scrollToTopButton.click(function(){
		$('html, body').animate({scrollTop : 0},800);
		return false;
	});

});