//      Datawrapper
(function(){

    // Initial Setup
    // -------------
    var root = this;

    // The top-level namespace. All public Backbone classes and modules will be
    // attached to this. Exported for both CommonJS and the browser.
    var Datawrapper;
    if (typeof exports !== 'undefined') {
        Datawrapper = exports;
    } else {
        Datawrapper = root.Datawrapper = {  };
    }


}).call(this);(function(){

    // Datawrapper.Theme
    // -----------------

    // Every theme will inherit the properties of this
    // theme. They can override everything or just a bit
    // of them. Also, every theme can extend any other
    // existing theme.

    Datawrapper.Themes = {};

    Datawrapper.Themes.Base = {

        /*
         * colors used in the theme
         */
        colors: {
            palette: ['#6E7DA1', '#64A4C4', '#53CCDD',  '#4EF4E8'],
            secondary: ["#000000", '#777777', '#cccccc', '#ffd500', '#6FAA12'],

            positive: '#85B4D4',
            negative: '#E31A1C',
            // colors background and text needs to be set in CSS as well!
            background: '#ffffff',
            text: '#000000'
        },

        /*
         * padding around the chart area
         */
        padding: {
            left: 0,
            right: 20,
            bottom: 30,
            top: 10
        },

        /*
         * custom properties for line charts
         */
        lineChart: {
            // stroke width used for lines, in px
            strokeWidth: 3,
            // the maximum width of direct labels, in px
            maxLabelWidth: 80,
            // the opacity used for fills between two lines
            fillOpacity: 0.2,
            // distance between labels and x-axis
            xLabelOffset: 20
        },

        /*
         * custom properties for column charts
         */
        columnChart: {
            // if set to true, the horizontal grid lines are cut
            // so that they don't overlap with the grid label.
            cutGridLines: false,
            // you can customize bar attributes
            barAttrs: {
                'stroke-width': 1
            },
            // make strokes a little darker than the fill
            darkenStroke: 18
        },

        /*
         * custom properties for bar charts
         */
        barChart: {
            // you can customize bar attributes
            barAttrs: {
                'stroke-width': 1
            }
        },

        /*
         * attributes of x axis, if there is any
         */
        xAxis: {
            stroke: '#333'
        },

        /*
         * attributes of y-axis if there is any shown
         */
        yAxis: {
            strokeWidth: 1
        },


        /*
         * attributes applied to horizontal grids if displayed
         * e.g. in line charts, column charts, ...
         *
         * you can use any property that makes sense on lines
         * such as stroke, strokeWidth, strokeDasharray,
         * strokeOpacity, etc.
         */
        horizontalGrid: {
            stroke: '#d9d9d9'
        },

        /*
         * just like horizontalGrid. used in line charts only so far
         *
         * you can define the grid line attributes here, e.g.
         * verticalGrid: { stroke: 'black', strokeOpacity: 0.4 }
         */
        verticalGrid: false,

        /*
         * draw a frame around the chart area (only in line chart)
         *
         * you can define the frame attributes here, e.g.
         * frame: { fill: 'white', stroke: 'black' }
         */
        frame: false,

        /*
         * if set to true, the frame border is drawn separately above
         * the other chart elements
         */
        frameStrokeOnTop: false,

        /*
         * probably deprecated
         */
        yTicks: false,


        hover: true,
        tooltip: true,

        hpadding: 0,
        vpadding: 10,

        /*
         * some chart types (line chart) go into a 'compact'
         * mode if the chart width is below this value
         */
        minWidth: 400,

        /*
         * theme locale, probably unused
         */
        locale: 'de_DE',

        /*
         * duration for animated transitions (ms)
         */
        duration: 1000,

        /*
         * easing for animated transitions
         */
         easing: 'expoInOut'

    };

}).call(this);(function(){

    // Datawrapper.Visualization.Base
    // ------------------------------

    // Every visualization should extend this class.
    // It provides the basic API between the chart template
    // page and the visualization class.

    Datawrapper.Visualizations = {
        Base: (function() {}).prototype
    };

    _.extend(Datawrapper.Visualizations.Base, {

        render: function(el) {
            $(el).html('implement me!');
        },

        setTheme: function(theme) {
            if (!theme) return this;
            this.theme = theme;
            var attr_properties = ['horizontalGrid', 'verticalGrid', 'yAxis', 'xAxis'];
            _.each(attr_properties, function(prop) {
                // convert camel-case to dashes
                if (theme.hasOwnProperty(prop)) {
                    for (var key in theme[prop]) {
                        // dasherize
                        var lkey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
                        if (!theme[prop].hasOwnProperty(lkey)) {
                            theme[prop][lkey] = theme[prop][key];
                        }
                    }
                }
            });
            return this;
        },

        setSize: function(width, height) {
            var me = this;
            me.__w = width;
            me.__h = height;
            return me;
        },

        /**
         * short-cut for this.chart.get('metadata.visualize.*')
         */
        get: function(str, _default) {
            return this.chart.get('metadata.visualize.'+str, _default);
        },

        warn: function(str) {
            var warning = $('<div>' + str + '</div>');
            warning.css({
                'background-color': '#FCF8E3',
                'border': '1px solid #FBEED5',
                'border-radius': '4px 4px 4px 4px',
                'color': '#a07833',
                'margin-bottom': '18px',
                'padding': '8px 35px 8px 14px',
                'text-shadow': '0 1px 0 rgba(255, 255, 255, 0.5)',
                'left': '10%',
                'right': '10%',
                'z-index': 1000,
                'text-align': 'center',
                position: 'absolute'
            });
            $('body').prepend(warning);
            warning.hide();
            warning.fadeIn();
        },

        /**
         * returns a signature for this visualization which will be used
         * to test correct rendering of the chart in different browsers.
         * See raphael-chart.js for example implementation.
         */
        signature: function() {
            // nothing here, please overload
        },

        translate: function(str) {
            var locale = this.meta.locale, lang = this.lang;
            return locale[str] ? locale[str][lang] || locale[str] : str;
        },

        checkBrowserCompatibility: function(){
            return true;
        },

        setChart: function(chart) {
            var me = this;
            me.dataset = chart.dataset();
            me.setTheme(chart.theme());
            me.chart = chart;
            me.dataset.filterSeries(chart.get('metadata.data.ignore-columns', {}));
        },

        axes: function(returnAsColumns) {
            var me = this,
                dataset = me.dataset,
                usedColumns = {},
                defAxes = {},
                errors = [];
            _.each(me.meta.axes, function(axisDef, key) {
                function checkColumn(col) {
                    return !usedColumns[col.name()] &&
                        _.indexOf(axisDef.accepts, col.type()) >= 0;
                }
                if (!axisDef.optional) {
                    if (!axisDef.multiple) {
                        // find first colulmn accepted by axis
                        var c = _.find(dataset.columns(), checkColumn);
                        if (c) {
                            usedColumns[c.name()] = true; // mark column as used
                            defAxes[key] = c.name();
                        } else {
                            errors.push('Error: Could not populate axis <b>'+key+'</b> a data column of the type '+axisDef.accepts);
                        }
                    } else {
                        defAxes[key] = [];
                        dataset.eachColumn(function(c) {
                            if (checkColumn(c)) {
                                usedColumns[c.name()] = true;
                                defAxes[key].push(c.name());
                            }
                        });
                        if (!defAxes[key].length) {
                            errors.push('Error: Could not populate axis <b>'+key+'</b> with a column of the type '+axisDef.accepts);
                        }
                    }
                } else {
                    defAxes[key] = false;
                }
            });
            if (errors.length) {
                me.warn(errors.join('<br/>'));
                return false;
            }
            defAxes = me.chart.get('metadata.axes', defAxes);
            if (returnAsColumns) {
                _.each(defAxes, function(columns, key) {
                    if (!_.isArray(columns)) {
                        defAxes[key] = columns !== false ? me.dataset.column(columns) : null;
                    } else {
                        _.each(columns, function(column, i) {
                            defAxes[key][i] = column !== false ? me.dataset.column(column) : null;
                        });
                    }
                });
            }
            return defAxes;
        },

        keys: function() {
            var me = this,
                axesDef = me.axes();
            if (axesDef.labels) {
                var lblCol = me.dataset.column(axesDef.labels),
                    fmt = dw.utils.longDateFormat(lblCol),
                    keys = [];
                lblCol.each(function(val) {
                    keys.push(fmt(val));
                });

                return keys;
            }
            return [];
        },

        /*
         * called by the core whenever the chart is re-drawn
         * without reloading the page
         */
        reset: function() {
            this.clear();
            $('#chart').html('').off('click').off('mousemove').off('mouseenter').off('mouseover');
            $('#header .legend').remove();
        },

        clear: function() {

        }

    });

}).call(this);