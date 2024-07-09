$(document).ready(function() {
    $(window).scroll(function() {
        var scroll = $(window).scrollTop();
        if (scroll >= 150) {
            $(".navbar_bs").removeClass("navbar_bs").addClass("navbar_as");
            $(".logo").removeClass("logo").addClass("logo_as");
            $(".links").removeClass("links").addClass("links_as");
            $(".bt").removeClass("bt").addClass("bt_as");
        } else {
            $(".navbar_as").removeClass("navbar_as").addClass("navbar_bs");
            $(".logo_as").removeClass("logo_as").addClass("logo");
            $(".links_as").removeClass("links_as").addClass("links");
            $(".bt_as").removeClass("bt_as").addClass("bt");
        }
        $('section').each(function() {
            var sectionTop = $(this).offset().top;
            var sectionId = $(this).attr('id');

            if (scroll >= sectionTop && scroll < sectionTop + $(this).outerHeight()) {
                $('.links a').removeClass('active');
                $('.links a[href="#' + sectionId + '"]').addClass('active');
            }
        });
    });
});
