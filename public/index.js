$(document).ready(function() {
    const $hamburger = $('#hamburger');
    const $mobileMenu = $('#mobile-menu');
    const $gallery = $('#gallery');
    const $prevBtn = $('#prevBtn');
    const $nextBtn = $('#nextBtn');
    const $closeButton = $('#close-button');

    let currentIndex = 0;
    const totalItems = $gallery.children().length;

    function updateGalleryPosition() {
        const offset = currentIndex * -100;  
        $gallery.css('transform', `translateX(${offset}vw)`);
    }

    $hamburger.on('click', function() {
        $mobileMenu.toggleClass('hidden');
        $hamburger.toggleClass('hidden');
    });

    $nextBtn.on('click', function() {
        currentIndex = (currentIndex + 1) % totalItems;  
        updateGalleryPosition();
    });

    $prevBtn.on('click', function() {
        currentIndex = (currentIndex - 1 + totalItems) % totalItems;  
        updateGalleryPosition();
    });

    $closeButton.on('click', function() {
        $mobileMenu.addClass('hidden');
        $hamburger.removeClass('hidden');
    });

    $('.login').on('click', function() {
        window.location.href = "/login";
    });

    var topMenu = $(".links"),
        topMenuHeight = topMenu.outerHeight() + 15,
        menuItems = topMenu.find("a"),
        scrollItems = menuItems.map(function() {
            var item = $($(this).attr("href"));
            if (item.length) {
                return item;
            }
        });

    $(window).scroll(function() {
        var scroll = $(window).scrollTop();

        if (scroll >= 150) {
            $(".navbar_bs").removeClass("navbar_bs").addClass("navbar_as");
            $(".logo_bs").removeClass("logo_bs").addClass("logo_as");
            $(".links").removeClass("links").addClass("links_as");
            $(".bt").removeClass("bt").addClass("bt_as");
            $("body").css("background-color", "#002124");
        } else {
            $(".navbar_as").removeClass("navbar_as").addClass("navbar_bs");
            $(".logo_as").removeClass("logo_as").addClass("logo_bs");
            $(".links_as").removeClass("links_as").addClass("links");
            $(".bt_as").removeClass("bt_as").addClass("bt");
            $("body").css("background-color", " #001d21");
        }

        var fromTop = $(this).scrollTop() + topMenuHeight;

        var cur = scrollItems.map(function() {
            if ($(this).offset().top <= fromTop)
                return this;
        });
        cur = cur[cur.length - 1];
        var id = cur && cur.length ? cur[0].id : "";

        if (id) {
            menuItems.removeClass("active").filter("[href='#" + id + "']").addClass("active");
        }
    });
});