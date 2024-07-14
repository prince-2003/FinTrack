$(document).ready(function() {
    $('.login').on('click', function() {
        // $.get( "/dashboard",function( data ) {
        //     alert( "Data Loaded: " + data );}); works fine but it cant render the page in the window
        window.location.href = "/dashboard";
        
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
            $(".logo").removeClass("logo").addClass("logo_as");
            $(".links").removeClass("links").addClass("links_as");
            $(".bt").removeClass("bt").addClass("bt_as");
            $("body").css("background-color", "#002124");
        } else {
            $(".navbar_as").removeClass("navbar_as").addClass("navbar_bs");
            $(".logo_as").removeClass("logo_as").addClass("logo");
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
