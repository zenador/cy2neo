function Neod3Renderer() {
    const DIFF_COLOUR_EDGES = false;

    var styleContents =
        "node {\
          diameter: 40px;\
          color: #DFE1E3;\
          border-color: #D4D6D7;\
          border-width: 2px;\
          text-color-internal: #000000;\
          text-color-external: #000000;\
          caption: '{name}';\
          font-size: 12px;\
          font-weight: bold;\
        }\
        relationship {\
          color: #4356C0;\
          shaft-width: 3px;\
          font-size: 9px;\
          padding: 3px;\
          text-color-external: #000000;\
          text-color-internal: #FFFFFF;\
        }\n";

    var skip = ["id", "start", "end", "source", "target", "labels", "type", "selected", "properties"];
    var prio_props = ["eid", "name", "title", "tag", "username", "lastname", "caption"];

    var serializer = null;

    var $downloadSvgLink = $('<a href="#" class="btn btn-success visualization-download" target="_blank"><i class="icon-download-alt"></i> Download SVG</a>').hide().click(function () {
        $downloadSvgLink.hide();
    });
    var downloadSvgLink = $downloadSvgLink[0];
    var blobSupport = 'Blob' in window;
    var URLSupport = 'URL' in window && 'createObjectURL' in window.URL;
    var msBlobSupport = typeof window.navigator.msSaveOrOpenBlob !== 'undefined';
    var svgStyling = '<style>\ntext{font-family:sans-serif}\n</style>';
    // var stylingUrl = window.location.hostname === 'www.neo4j.org' ? 'http://gist.neo4j.org/css/neod3' : 'styles/neod3';
    var stylingUrl = window.location.hostname === 'www.neo4j.org' ? 'http://gist.neo4j.org/css/neod3' : '/static/styles/neod3';
    if (window.isInternetExplorer) {
        stylingUrl += '-ie.css';
    } else {
        stylingUrl += '.css';
    }

    function dummyFunc() {
    }

    function render(id, $container, visualization) {
        function extract_props(pc) {
            var p = {};
            for (var key in pc) {
                if (!pc.hasOwnProperty(key) || skip.indexOf(key) != -1) continue;
                p[key] = pc[key];
            }
            return p;
        }

        function node_styles(nodes) {
            function label(n) {
                var labels = n["labels"];
                if (labels && labels.length) {
                    return labels[labels.length - 1];
                }
                return "";
            }

            var style = {};
            for (var i = 0; i < nodes.length; i++) {
                var props= nodes[i].properties = extract_props(nodes[i]);
                var keys = Object.keys(props);
                if (label(nodes[i]) !== "" && keys.length > 0) {
                    var selected_keys = prio_props.filter(function (k) {
                        return keys.indexOf(k) !== -1
                    });
                    selected_keys = selected_keys.concat(keys).concat(['id']);
                    var selector = "node." + label(nodes[i]);
                    var selectedKey = selected_keys[0];
                    if (typeof(props[selectedKey]) === "string" && props[selectedKey].length > 30) {
                        //props[selectedKey] = props[selectedKey].substring(0,30)+" ...";
                    } else if (props[selectedKey] == 0) {
                        props[selectedKey] = "0";
                    }
                    style[selector] = style[selector] || selectedKey;
                }
            }
            return style;
        }
        function link_styles(links) {
            var style = {};
            for (var i = 0; i < links.length; i++) {
                var selector = "relationship." + links[i]["type"];
                style[selector] = "";
            }
            return style;
        }
        function style_sheet(styles, styleContents) {
            function format(key) {
                var item=styles[key];
                return item.selector +
                    " {caption: '{" + item.caption +
                    "}'; color: " + item.color +
                    "; border-color: " + item['border-color'] +
                    "; text-color-internal: " +  item['text-color-internal'] +
                    "; text-color-external: " +  item['text-color-external'] +
                    "; }"
            }
            return styleContents + Object.keys(styles).map(format).join("\n");
        }
        function style_sheet_links(styles, styleContents) {
            function format(key) {
                return key + " {color: " + styles[key].color + "; }"
            }
            return styleContents + Object.keys(styles).map(format).join("\n");
        }
        function create_styles(styleCaptions) {
            var styles = {};
            var currentColor = 1;
            var colors = neo.style.defaults.colors;
            //for (var selector in styleCaptions) {
            var sorted_keys = Object.keys(styleCaptions).sort();
            for (var key in sorted_keys) {
                var selector = sorted_keys[key];
                if (!(selector in styles)) {
                    var color = colors[currentColor];
                    currentColor = (currentColor + 1) % colors.length;
                    var textColor = window.isInternetExplorer ? '#000000' : color['text-color-internal'];
                    var style = {selector:selector, caption:styleCaptions[selector], color:color.color, 
                         "border-color":color['border-color'], "text-color-internal":textColor,"text-color-external": textColor }
                    styles[selector] = style;
                }
            }
            return styles;
        }
        function create_styles_links(styleCaptions) {
            var styles = {};
            var currentColor = 0;
            var colors = neo.style.defaults.colorsLinks;
            var sorted_keys = Object.keys(styleCaptions).sort();
            for (var key in sorted_keys) {
                var selector = sorted_keys[key];
                if (!(selector in styles)) {
                    var color = colors[currentColor];
                    currentColor = (currentColor + 1) % colors.length;
                    var style = {color:color.color};
                    styles[selector] = style;
                }
            }
            return styles;
        }

        function applyZoom(event) {
            // if (event.sourceEvent.target.tagName == "circle")
            //     return;
            renderer.select(".nodes").attr("transform", event.transform);
            renderer.select(".relationships").attr("transform", event.transform);
            $('[data-toggle=popover]').popover('hide');
        }

        function enableZoomHandlers() {
            renderer.on("wheel.zoom",zoomHandlers.wheel);
            renderer.on("mousewheel.zoom",zoomHandlers.mousewheel);
            renderer.on("mousedown.zoom",zoomHandlers.mousedown);
            renderer.on("DOMMouseScroll.zoom",zoomHandlers.DOMMouseScroll);
            renderer.on("touchstart.zoom",zoomHandlers.touchstart);
            renderer.on("touchmove.zoom",zoomHandlers.touchmove);
            renderer.on("touchend.zoom",zoomHandlers.touchend);
        }

        function disableZoomHandlers() {
            renderer.on("wheel.zoom",null);
            renderer.on("mousewheel.zoom",null);
            renderer.on("mousedown.zoom", null);
            renderer.on("DOMMouseScroll.zoom", null);
            renderer.on("touchstart.zoom",null);
            renderer.on("touchmove.zoom",null);
            renderer.on("touchend.zoom",null);
        }

        function legend(svg, styles) {
          var keys = Object.keys(styles).sort();
          var circles = svg.selectAll('circle.legend').data(keys);
          var r=20;
          circles = circles.enter().append('circle').classed('legend', true).attrs({
            cx: 2*r,
            r : r
          })
          .merge(circles)
          .attrs({
            class: function(node) {
              return "legend " + node.replace(/node\./g, 'ntype-');
            },
            cy: function(node) {
              return (keys.indexOf(node)+1)*2.2*r;
            },
            fill: function(node) {
              return styles[node]['color'];
            },
            stroke: function(node) {
              return styles[node]['border-color'];
            },
            'stroke-width': function(node) {
              return "2px";
            }
          });
          var text = svg.selectAll('text.legend').data(keys);
          text = text.enter().append('text').classed('legend',true).attrs({
            'text-anchor': 'left',
            'font-weight': 'bold',
            'stroke-width' : '0',
            'stroke-color' : 'black',
            'fill' : 'black',
            'x' : 3.2*r,
            'font-size' : "12px"
          })
          .merge(text)
          .text(function(node) {
            var label = styles[node].selector;
            return label ? label.substring(5) : "";
          }).attr('y', function(node) {
              return (keys.indexOf(node)+1)*2.2*r+6;
          })
/*
          .attr('stroke', function(node) {
            return styles[node]['color'];
          })
         .attr('fill', function(node) {
              return styles[node]['text-color-internal'];
          });
*/
          return circles.exit().remove();
        }

        function legendLinks(svg, styles, offset) {
          var keys = Object.keys(styles).sort();
          var arrows = svg.selectAll('path.legendLink').data(keys);
          var r=20;
          var shaftRadius=1, headRadius=4, shaftLength=26, arrowLength=34;
          arrows = arrows.enter().append('path').classed('legendLink', true).attrs({
            d: ['M', 0, shaftRadius, 'L', shaftLength, shaftRadius, 'L', shaftLength, headRadius, 'L', arrowLength, 0, 'L', shaftLength, -headRadius, 'L', shaftLength, -shaftRadius, 'L', 0, -shaftRadius, 'Z'].join(' '),
          })
          .merge(arrows)
          .attrs({
            class: function(link) {
              return "legendLink " + link.replace(/relationship\./g, 'rtype-');
            },
            transform: function(link) {
              var x = 2*r - 15;
              var y = (offset+keys.indexOf(link)+1)*2.2*r + 2;
              return "translate("+x+","+y+")";
            },
            fill: function(link) {
              return styles[link]['color'];
            }
          });
          var text = svg.selectAll('text.legendLink').data(keys);
          text = text.enter().append('text').classed('legendLink',true).attrs({
            'text-anchor': 'left',
            'font-weight': 'bold',
            'stroke-width' : '0',
            'stroke-color' : 'black',
            'fill' : 'black',
            'x' : 3.2*r,
            'font-size' : "12px"
          })
          .merge(text)
          .text(function(link) {
            var label = link;
            return label ? label.substring(13) : "";
          }).attr('y', function(link) {
              return (offset+keys.indexOf(link)+1)*2.2*r+6;
          });
          return arrows.exit().remove();
        }
/*
        function keyHandler(event) {
            if (event.altKey || event.shiftKey) {
                enableZoomHandlers();
            }
            else {
                disableZoomHandlers();
            }
        }
*/
        var links = visualization.links;
        var nodes = visualization.nodes;
        for (var i = 0; i < links.length; i++) {
            links[i].source = links[i].start;
            links[i].target = links[i].end;
           //  links[i].properties = props(links[i]);
        }
        var nodeStyles = node_styles(nodes);
        var existingStyles = create_styles(nodeStyles);
        var styleSheet = style_sheet(existingStyles, styleContents);
        if (DIFF_COLOUR_EDGES) {
            var linkStyles = link_styles(links);
            var existingStylesLinks = create_styles_links(linkStyles);
            styleSheet = style_sheet_links(existingStylesLinks, styleSheet);
        }
        var graphModel = neo.graphModel()
            .nodes(nodes)
            .relationships(links);
        var graphView = neo.graphView()
            .style(styleSheet)
            .width($container.width()).height($container.height()).on('nodeClicked', dummyFunc).on('relationshipClicked', dummyFunc).on('nodeDblClicked', dummyFunc);
        var svg = d3.select("#" + id).append("svg");

        var filterDef = svg.append("defs");
        var glowDefs = [["glowc", "#00FFFF"]];
        glowDefs.forEach(function([filterName, colorCode], index) {
            var newFilter = filterDef.append("filter")
                .attr("id", filterName)
                .attr("x", "-50%")
                .attr("y", "-50%")
                .attr("width", "200%")
                .attr("height", "200%");
            newFilter
                .append("feDropShadow")
                .attr("dx", 0)
                .attr("dy", 0)
                .attr("stdDeviation", 10)
                .attr("flood-color", colorCode)
                .attr("flood-opacity", 1);
            // newFilter
            //     .append("feFlood")
            //     .attr("flood-color", "green");
        });
        /*
        var shadowDefs = [["shadowr", "#FF0000"]];
        shadowDefs.forEach(function([filterName, colorCode], index) {
            var newFilter = filterDef.append("filter")
                .attr("id", filterName)
                .attr("x", "-50%")
                .attr("y", "-50%")
                .attr("width", "200%")
                .attr("height", "200%");
            newFilter
                .append("feDropShadow")
                .attr("dx", "3")
                .attr("dy", "3")
                .attr("stdDeviation", 0)
                .attr("flood-color", colorCode)
                .attr("flood-opacity", 1);
        });
        var strokeDefs = [["strokeo", "#FF9300"]];
        strokeDefs.forEach(function([filterName, colorCode], index) {
            var newFilter = filterDef.append("filter")
                .attr("id", filterName)
                .attr("x", "-100%")
                .attr("y", "-100%")
                .attr("width", "250%")
                .attr("height", "250%");
            newFilter
                .append("feFlood")
                .attr("flood-color", colorCode)
                .attr("result", "outside-color");
            newFilter
                .append("feMorphology")
                .attr("in", "SourceAlpha")
                .attr("operator", "dilate")
                .attr("radius", 3)
                .attr("result", "expanded");
            newFilter
                .append("feComposite")
                .attr("in", "outside-color")
                .attr("in2", "expanded")
                .attr("operator", "in");
            newFilter
                .append("feComposite")
                .attr("in", "SourceGraphic");
        });
        */
        var gradientDefs = [["gradientyo", "radial", "#000000", "#FF9300"]];
        gradientDefs.forEach(function([filterName, gradientType, colorCode, colorCode2], index) {
            var newFilter, startOffset, stopOffset, startOpacity, stopOpacity;
            if (gradientType == "linear") {
                newFilter = filterDef.append("linearGradient")
                    .attr("id", filterName)
                    .attr("x1", "0%")
                    .attr("y1", "0%")
                    .attr("x2", "100%")
                    .attr("y2", "100%");
                startOffset = "0%", stopOffset = "100%";
                startOpacity = 1.0, stopOpacity = 1.0;
            } else {
                newFilter = filterDef.append("radialGradient")
                    .attr("id", filterName)
                    .attr("cx", "50%")
                    .attr("cy", "50%")
                    .attr("r", "60%")
                    .attr("fx", "50%")
                    .attr("fy", "50%");
                startOffset = "70%", stopOffset = "90%";
                startOpacity = 1.0, stopOpacity = 1.0;
            }
            newFilter
                .append("stop")
                .attr("offset", startOffset)
                .attr("stop-color", colorCode)
                .attr("stop-opacity", startOpacity);
            newFilter
                .append("stop")
                .attr("offset", stopOffset)
                .attr("stop-color", colorCode2)
                .attr("stop-opacity", stopOpacity);
        });
        /*
        var patternDefs = [];
        patternDefs.forEach(function([nodeType, imgName, colorCode], index) {
            var side = "40px";
            // var newPattern = filterDef.append("pattern")
            //     .attr("id", "img-"+nodeType)
            //     .attr("width", "100%")
            //     .attr("height", "100%");
            // newPattern
            //     .append("image")
            //     .attr("width", side)
            //     .attr("height", side)
            //     .attr("xlink:href", "/static/assets/icons/"+imgName+".png");
            var newMask = filterDef.append("mask")
                .attr("id", "mask-"+nodeType);
            newMask
                .append("image")
                .attr("width", side)
                .attr("height", side)
                .attr("xlink:href", "/static/assets/icons/"+imgName+".png");
            var newPattern = filterDef.append("pattern")
                .attr("id", "img-"+nodeType)
                .attr("width", "100%")
                .attr("height", "100%");
            newPattern
                .append("rect")
                .attr("width", side)
                .attr("height", side)
                .attr("fill", "white");
            newPattern
                .append("rect")
                .attr("width", side)
                .attr("height", side)
                .attr("fill", colorCode)
                .attr("mask", "url(#mask-"+nodeType+")");
        });
        */

        var renderer = svg.data([graphModel]);
        legend(svg,existingStyles);
        if (DIFF_COLOUR_EDGES)
            legendLinks(svg,existingStylesLinks,Object.keys(existingStyles).length);
        var zoomHandlers = {};
        /*
        function zoomFilter(event) {
            // allow click to trigger popover for relationship on mouseup instead of being consumed by zoom event. however this doesn't allow panning on the relationship
            var defaultFilter = (!event.ctrlKey || event.type === 'wheel') && !event.button; // from d3 source
            var myFilter = !(event.type === 'mousedown' && $(event.target).is("rect[data-toggle='popover']"));
            return defaultFilter && myFilter;
        }
        */
        var zoomBehavior = d3.zoom().on("zoom", applyZoom).on("end", triggerMouseup).scaleExtent([0.2, 8]);


        renderer.call(graphView);
        renderer.call(zoomBehavior).on("dblclick.zoom", null);

        zoomHandlers.wheel = renderer.on("wheel.zoom");
        zoomHandlers.mousewheel = renderer.on("mousewheel.zoom");
        zoomHandlers.mousedown = renderer.on("mousedown.zoom");
        zoomHandlers.DOMMouseScroll = renderer.on("DOMMouseScroll.zoom");
        zoomHandlers.touchstart = renderer.on("touchstart.zoom");
        zoomHandlers.touchmove = renderer.on("touchmove.zoom")
        zoomHandlers.touchend = renderer.on("touchend.zoom");
        // disableZoomHandlers();

        // d3.select('body').on("keydown", keyHandler).on("keyup", keyHandler);

        function refresh() {
            graphView.height($container.height());
            graphView.width($container.width());
            renderer.call(graphView);
        }

        function saveToSvg() {
            var svgElement = $('#' + id).children('svg').first()[0];
            var xml = serializeSvg(svgElement, $container);
            if (!msBlobSupport && downloadSvgLink.href !== '#') {
                window.URL.revokeObjectURL(downloadSvgLink.href);
            }
            var blob = new window.Blob([xml], {
                'type': 'image/svg+xml'
            });
            var fileName = id + '.svg';
            if (!msBlobSupport) {
                downloadSvgLink.href = window.URL.createObjectURL(blob);
                $downloadSvgLink.appendTo($container).show();
                $downloadSvgLink.attr('download', fileName);
            } else {
                window.navigator.msSaveOrOpenBlob(blob, fileName);
            }
        }

        function getFunctions() {
            var funcs = {};
            if (blobSupport && (URLSupport || msBlobSupport)) {
                funcs['icon-download-alt'] = {'title': 'Save as SVG', 'func':saveToSvg};
            }
            return funcs;
        }

        return  {
            'subscriptions': {
                'expand': refresh,
                'contract': refresh,
                'sizeChange': refresh
            },
            'actions': getFunctions()
        };
    }

    function serializeSvg(element, $container) {
        if (serializer === null) {
            if (typeof window.XMLSerializer !== 'undefined') {
                var xmlSerializer = new XMLSerializer();
                serializer = function (emnt) {
                    return xmlSerializer.serializeToString(emnt);
                };
            } else {
                serializer = function (emnt) {
                    return '<svg xmlns="http://www.w3.org/2000/svg">' + $(emnt).html() + '</svg>';
                }
            }
        }
        var svg = serializer(element);
        svg = svg.replace('<svg ', '<svg height="' + $container.height() + '" width="' + $container.width() + '" ')
            .replace(/<g/, '\n' + svgStyling + '\n<g');
        return svg;
    }
    /*
    $.get(stylingUrl, function (data) {
        svgStyling = '<style type="text/css">\n' + data + '\n</style>';
        $(svgStyling).appendTo('head');
    });
    */
    var svgStyling2 = '<link rel="stylesheet" href="'+stylingUrl+'"></a>'
    $(svgStyling2).appendTo('head');

    return {'render': render};
}
