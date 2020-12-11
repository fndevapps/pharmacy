$(function () {

    var kbHeight = 0;

    console.log("KeyboardFix:: Setting up...");
    console.log("KeyboardFix:: Window height " + $(window).height());

    document.addEventListener("deviceready", function () {
        console.log("KeyboardFix:: deviceready");
        if (device.isVirtual) {
            //navigator.simulator = true;
        }
        var isAndroid = device.platform.toLowerCase() === "android";
        if (navigator.simulator) {
            return;
        }

        console.log("KeyboardFix:: Disabling scroll...");
        cordova.plugins.Keyboard.disableScroll(isAndroid);

        if (isAndroid) {
            console.log("KeyboardFix:: Is Android");
            window.addEventListener("native.keyboardshow", function (e) {
                console.log("KeyboardFix:: Keyboard Show");
                kbHeight = e.keyboardHeight;
                handleKeyboard();

                $(document).on("focus", function(event) {
                    console.log(event);
                    console.log(event.target);
                })

                $(document).on("focus", "input", function () {
                    console.log("Focused on input!");
                    handleKeyboard();
                });
            }, false);

            window.addEventListener("native.keyboardhide", function () {
                console.log("KeyboardFix:: Keyboard Hide");
                kbHeight = 0;

                $(window).off("focus", "input, textarea");
                app.view().element.find(".content").data("kendoMobileScroller").element.fixScroll();

                if ($(":focus").length > 0) {
                    $(":focus").blur();
                }
            }, false);

            function handleKeyboard() {
                var input = $(":focus");

                if (input.length === 0) {
                    console.log("Nothing is focused!");
                    return;
                }

                var iTop = input[0].getClientRects()[0].top;
                var iHeight = input.outerHeight(true);
                var kbOffset = $(window).height() - kbHeight - (iTop + iHeight + 20);

                console.log("KeyboardFix:: iTop " + iTop);
                console.log("KeyboardFix:: iHeight " + iHeight);
                console.log("KeyboardFix:: kbHeight " + kbHeight);
                console.log("KeyboardFix:: $(window).height() " + $(window).height());
                console.log("KeyboardFix:: kbOffset " + kbOffset);

                if (kbOffset > 0) {
                    console.log("KeyboardFix:: Not Scrolling");
                    return;
                }

                var currentScroll = app.view().element.find(".content").data("kendoMobileScroller").scrollTop;
                app.view().element.find(".content").data("kendoMobileScroller").scrollTo(0, -(Math.abs(currentScroll) + Math.abs(kbOffset)));
            }
        }
        else {

        }

    }, false);

    $.prototype.fixScroll = function () {
        try {
            var scroll = $(this);
            var scroller = scroll.data("kendoMobileScroller");

            if (!scroller) {
                return;
            }

            var scrollTop = scroller.scrollTop;
            var maxScrollTop = scroller.scrollHeight() - scroll.height();
            if (maxScrollTop < 0) {
                maxScrollTop = 0;
            }

            if (scrollTop > maxScrollTop) {
                scroller.animatedScrollTo(0, -maxScrollTop);
            } else if (scrollTop < 0) {
                scroller.animatedScrollTo(0, 0);
            }
        } catch (ex) {
        }
    };
});