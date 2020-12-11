function Banner(element, options) {
    this.element = element;
    this.options = options;

    this.loopInterval = null;
    this.currentPage = 0;
    this.numberOfPages = this.options.slides.length;

    this._isPlaying = false;

    var setupBanner = function (self) {
        var element = self.element;

        if (element.data("banner")) {
            return;
        }

        var content = "";
        self.options.slides.forEach(function (slide, index) {
            content += "<div style='height:" + self.options.contentHeight + "px'>";
            content += "<div class='banner-background' slide-index='" + index + "' style='background-image:url(\"" + slide.image + "\");height:" + self.options.contentHeight + "px'></div>";
            content += "</div>";
        });

        element.html(content);

        element.slick({
            infinite: true,
            slidesToShow: 1,
            centerMode: true,
            centerPadding: 0,//($(window).width() * (isTablet ? 0.15 : 0.1)) + 'px',
            adaptiveHeight: true,
            autoplay: true,
            autoplaySpeed: self.options.delay,
            arrows: false,
            dots: false,
            mobileFirst: true,
            touchThreshold: 30
        });

        element.on("touchmove", function (e) {
            try {
                e.preventDefault();
                e.stopPropagation();
            }
            catch (ex) { }
        });

        self._isPlaying = true;
    }

    var setupBanner_kendo = function (self) {
        var element = self.element;

        if (element.data("kendoMobileScrollView")) {
            return;
        }

        element.addClass("banner");

        var content = "";
        self.options.slides.forEach(function (slide, index) {
            content += "<div data-role='page' style='height:100%'>";
            content += "<div class='banner-background' slide-index='" + index + "' style='background-image:url(\"" + slide.image + "\")'></div>";
            content += "</div>";
        });

        element.html(content);

        console.log(content);

        element.kendoMobileScrollView({
            /* dataSource: new kendo.data.DataSource({
                transport: {
                    read: function (options) {
                        options.success(self.options.slides.map(function (item, index) {
                            item._index = index;
                            return item;
                        }));
                    }
                }
            }),
            template: "<div class='banner-background' slide-index='#=_index#' style='background-image:url(\"#=Image#\")'></div>", */
            contentHeight: self.options.contentHeight + "px",
            velocityThreshold: 0.1,
            pageSize: 0.5,
            //enablePager: false,
            change: function (e) {
                self.currentPage = e.page;
                var scrollView = this.element;
                /* scrollView.find(".banner-background:not([slide-index='" + e.page + "'])").removeClass("visible");
                setTimeout(function () {
                    scrollView.find(".banner-background[slide-index='" + e.page + "']").addClass("visible");
                }, 100); */

                if (self.loopInterval) {
                    clearTimeout(self.loopInterval);
                    self.loopInterval = null;
                }

                self.loopInterval = setTimeout(function () {
                    try {
                        if (self.currentPage < self.numberOfPages - 1) {
                            //scrollView.data("kendoMobileScrollView").scrollTo(self.currentPage + 1);
                            scrollView.data("kendoMobileScrollView").next();
                        }
                        else {
                            scrollView.data("kendoMobileScrollView").scrollTo(0);
                        }
                    }
                    catch (ex) { }

                }, self.options.delay);
            },
            changing: function (e) {
                //Stop user from swiping
                //e.preventDefault();
            }
        });
        element.data("kendoMobileScrollView").refresh();
    };

    var setupLooper = function (self) {
        var scrollView = self.element.data("kendoMobileScrollView");
        if (!scrollView) {
            return;
        }

        self.loopInterval = setInterval(function () {

            if (self.currentPage < self.numberOfPages - 1) {
                scrollView.scrollTo(self.currentPage + 1, false);
            }
            else {
                scrollView.scrollTo(0, false);
            }

        }, self.options.delay);
    };

    setupBanner(this);
    //setupLooper(this);

    return this;
}
Banner.prototype.pause = function () {
    var self = this;

    var element = self.element;

    if (self._isPlaying) {
        element.slick('slickPause');
        self._isPlaying = false;
    }
}
Banner.prototype.play = function () {
    var self = this;

    var element = self.element;

    if (!self._isPlaying) {
        element.slick('slickPlay');
        self._isPlaying = true;
    }
}

$.prototype.Banner = function (options) {
    var element = $(this);

    options = Object.assign({
        slides: [],
        contentHeight: 150,
        delay: 3000
    }, options);

    element.data("banner", new Banner(element, options));
}