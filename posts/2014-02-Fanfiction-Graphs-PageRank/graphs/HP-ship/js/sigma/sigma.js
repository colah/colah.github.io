/* sigmajs.org - an open-source light-weight JavaScript graph drawing library - Facenuke - Author:  Alexis Jacomy - License: MIT */
var sigma = {
    tools: {},
    classes: {},
    instances: {}
};
(function () {
    Array.prototype.some || (Array.prototype.some = function (g, n) {
        var i = this.length;
        if ("function" != typeof g) throw new TypeError;
        for (var k = 0; k < i; k++) if (k in this && g.call(n, this[k], k, this)) return !0;
        return !1
    });
    Array.prototype.forEach || (Array.prototype.forEach = function (g, n) {
        var i = this.length;
        if (typeof g != "function") throw new TypeError;
        for (var k = 0; k < i; k++) k in this && g.call(n, this[k], k, this)
    });
    Array.prototype.map || (Array.prototype.map = function (g, n) {
        var i = this.length;
        if (typeof g != "function") throw new TypeError;
        for (var k = Array(i), o = 0; o < i; o++) o in this && (k[o] = g.call(n, this[o], o, this));
        return k
    });
    Array.prototype.filter || (Array.prototype.filter = function (g, n) {
        var i = this.length;
        if (typeof g != "function") throw new TypeError;
        for (var k = [], o = 0; o < i; o++) if (o in this) {
            var t = this[o];
            g.call(n, t, o, this) && k.push(t)
        }
        return k
    });
    Array.prototype.indexOf || (Array.prototype.indexOf = function (g) {
        for (var n = 0; n < this.length; n++) if (this[n] === g) return n;
        return -1
    });
    Object.keys || (Object.keys = function () {
        var g = Object.prototype.hasOwnProperty,
            n = !{
                toString: null
            }.propertyIsEnumerable("toString"),
            i = ["toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "constructor"],
            k = i.length;
        return function (o) {
            if (typeof o !== "object" && typeof o !== "function" || o === null) throw new TypeError("Object.keys called on non-object");
            var t = [],
                s;
            for (s in o) g.call(o, s) && t.push(s);
            if (n) for (s = 0; s < k; s++) g.call(o, i[s]) && t.push(i[s]);
            return t
        }
    }())
})();
sigma.classes.Cascade = function () {
    this.p = {};
    this.config = function (g, n) {
        if ("string" == typeof g && void 0 == n) return this.p[g];
        var i = "object" == typeof g && void 0 == n ? g : {};
        "string" == typeof g && (i[g] = n);
        for (var k in i) void 0 != this.p[k] && (this.p[k] = i[k]);
        return this
    }
};
sigma.classes.EventDispatcher = function () {
    var g = {},
        n = this;
    this.one = function (i, k) {
        if (!k || !i) return n;
        ("string" == typeof i ? i.split(" ") : i).forEach(function (i) {
            g[i] || (g[i] = []);
            g[i].push({
                h: k,
                one: !0
            })
        });
        return n
    };
    this.bind = function (i, k) {
        if (!k || !i) return n;
        ("string" == typeof i ? i.split(" ") : i).forEach(function (i) {
            g[i] || (g[i] = []);
            g[i].push({
                h: k,
                one: !1
            })
        });
        return n
    };
    this.unbind = function (i, k) {
        i || (g = {});
        var o = "string" == typeof i ? i.split(" ") : i;
        k ? o.forEach(function (i) {
            g[i] && (g[i] = g[i].filter(function (i) {
                return i.h != k
            }));
            g[i] && 0 == g[i].length && delete g[i]
        }) : o.forEach(function (i) {
            delete g[i]
        });
        return n
    };
    this.dispatch = function (i, k) {
        sigma.action = i;
        g[i] && (g[i].forEach(function (g) {
            g.h({
                type: i,
                content: k,
                target: n
            })
        }), g[i] = g[i].filter(function (i) {
            return !i.one
        }));
        return n
    }
};
(function () {
    var g;

    function n() {
        function b(d) {
            return {
                x: d.x,
                y: d.y,
                size: d.size,
                degree: d.degree,
                inDegree: d.inDegree,
                outDegree: d.outDegree,
                displayX: d.displayX,
                displayY: d.displayY,
                displaySize: d.displaySize,
                label: d.label,
                id: d.id,
                color: d.color,
                fixed: d.fixed,
                active: d.active,
                hidden: d.hidden,
                attr: d.attr
            }
        }
        function i(d) {
            return {
                source: d.source.id,
                target: d.target.id,
                size: d.size,
                type: d.type,
                weight: d.weight,
                displaySize: d.displaySize,
                label: d.label,
                hidden: d.hidden,
                id: d.id,
                attr: d.attr,
                color: d.color
            }
        }
        function h() {
            c.nodes = [];
            c.nodesBG = [];
            c.nodesIndex = {};
            c.nodesBGIndex = {};
            c.edges = [];
            c.edgesIndex = {};
            return c
        }
        sigma.classes.Cascade.call(this);
        sigma.classes.EventDispatcher.call(this);
        var c = this;
        this.p = {
            minNodeSize: 0,
            maxNodeSize: 0,
            minEdgeSize: 0,
            maxEdgeSize: 0,
            minBGSize: 0,
            maxBGSize: 0,
            scalingMode: "inside",
            nodesPowRatio: 0.5,
            edgesPowRatio: 0
        };
        this.borders = {};
        h();
        this.addNode = function (d, b) {
            if (c.nodesIndex[d]) throw Error('Node "' + d + '" already exists.');
            var b = b || {},
                a = {
                    x: 0,
                    y: 0,
                    size: 1,
                    degree: 0,
                    inDegree: 0,
                    outDegree: 0,
                    fixed: !1,
                    active: !1,
                    hidden: !1,
                    label: d.toString(),
                    id: d.toString(),
                    attr: {}
                },
                f;
            for (f in b) switch (f) {
            case "id":
                break;
            case "x":
            case "y":
            case "size":
                a[f] = +b[f];
                break;
            case "fixed":
            case "active":
            case "hidden":
                a[f] = !! b[f];
                break;
            case "color":
            case "label":
                a[f] = b[f];
                break;
            default:
                a.attr[f] = b[f]
            }
            c.nodes.push(a);
            c.nodesIndex[d.toString()] = a;
            return c
        };
        this.addNodeBG = function (d, b) {
            if (c.nodesBGIndex[d]) throw Error('NodeBG "' + d + '" already exists.');
            var b = b || {},
                a = {
                    x: 0,
                    y: 0,
                    size: 1,
                    fixed: !1,
                    active: !1,
                    hidden: !1,
                    label: d.toString(),
                    id: d.toString(),
                    attr: {}
                },
                f;
            for (f in b) switch (f) {
            case "id":
                break;
            case "x":
            case "y":
            case "size":
                a[f] = +b[f];
                break;
            case "fixed":
            case "active":
            case "hidden":
                a[f] = !! b[f];
                break;
            case "color":
            case "label":
                a[f] = b[f];
                break;
            default:
                a.attr[f] = b[f]
            }
            c.nodesBG.push(a);
            c.nodesBGIndex[d.toString()] = a;
            return c
        };
        this.addEdge = function (d, b, a, f) {
            if (c.edgesIndex[d]) throw Error('Edge "' + d + '" already exists.');
            if (!c.nodesIndex[b]) throw Error("Edge's source \"" + b + '" does not exist yet.');
            if (!c.nodesIndex[a]) throw Error("Edge's target \"" + a + '" does not exist yet.');
            f = f || {};
            b = {
                source: c.nodesIndex[b],
                target: c.nodesIndex[a],
                size: 1,
                weight: 1,
                displaySize: 0.5,
                label: d.toString(),
                id: d.toString(),
                hidden: !1,
                attr: {}
            };
            b.source.degree++;
            b.source.outDegree++;
            b.target.degree++;
            b.target.inDegree++;
            for (var h in f) switch (h) {
            case "id":
            case "source":
            case "target":
                break;
            case "hidden":
                b[h] = !! f[h];
                break;
            case "size":
            case "weight":
                b[h] = +f[h];
                break;
            case "color":
                b[h] = f[h].toString();
                break;
            case "type":
                b[h] = f[h].toString();
                break;
            case "label":
                b[h] = f[h];
                break;
            default:
                b.attr[h] = f[h]
            }
            c.edges.push(b);
            c.edgesIndex[d.toString()] = b;
            return c
        };
        this.dropNode = function (b) {
            ((b instanceof Array ? b : [b]) || []).forEach(function (b) {
                if (c.nodesIndex[b]) {
                    var a = null;
                    c.nodes.some(function (d, c) {
                        return d.id == b ? (a = c, !0) : !1
                    });
                    null != a && c.nodes.splice(a, 1);
                    delete c.nodesIndex[b];
                    c.edges = c.edges.filter(function (a) {
                        return a.source.id == b ? (delete c.edgesIndex[a.id], a.target.degree--, a.target.inDegree--, !1) : a.target.id == b ? (delete c.edgesIndex[a.id], a.source.degree--, a.source.outDegree--, !1) : !0
                    })
                } else sigma.log('Node "' + b + '" does not exist.')
            });
            return c
        };
        this.dropEdge = function (b) {
            ((b instanceof Array ? b : [b]) || []).forEach(function (b) {
                if (c.edgesIndex[b]) {
                    c.edgesIndex[b].source.degree--;
                    c.edgesIndex[b].source.outDegree--;
                    c.edgesIndex[b].target.degree--;
                    c.edgesIndex[b].target.inDegree--;
                    var a = null;
                    c.edges.some(function (d, c) {
                        return d.id == b ? (a = c, !0) : !1
                    });
                    null != a && c.edges.splice(a, 1);
                    delete c.edgesIndex[b]
                } else sigma.log('Edge "' + b + '" does not exist.')
            });
            return c
        };
        this.iterEdges = function (b, h) {
            var a = h ? h.map(function (a) {
                return c.edgesIndex[a]
            }) : c.edges,
                f = a.map(i);
            f.forEach(b);
            a.forEach(function (a, b) {
                var d = f[b],
                    j;
                for (j in d) switch (j) {
                case "id":
                case "displaySize":
                    break;
                case "weight":
                case "size":
                    a[j] = +d[j];
                    break;
                case "source":
                case "target":
                    a[j] = c.nodesIndex[j] || a[j];
                    break;
                case "hidden":
                    a[j] = !! d[j];
                    break;
                case "color":
                case "label":
                case "type":
                    a[j] = (d[j] || "").toString();
                    break;
                default:
                    a.attr[j] = d[j]
                }
            });
            return c
        };
        this.iterNodes = function (d, h) {
            var a = h ? h.map(function (a) {
                return c.nodesIndex[a]
            }) : c.nodes,
                f = a.map(b);
            f.forEach(d);
            a.forEach(function (a, b) {
                var d = f[b],
                    c;
                for (c in d) switch (c) {
                case "id":
                case "attr":
                case "degree":
                case "inDegree":
                case "outDegree":
                case "displayX":
                case "displayY":
                case "displaySize":
                    break;
                case "x":
                case "y":
                case "size":
                    a[c] = +d[c];
                    break;
                case "fixed":
                case "active":
                case "hidden":
                    a[c] = !! d[c];
                    break;
                case "color":
                case "label":
                    a[c] = d[c].toString();
                    break;
                default:
                    a.attr[c] = d[c]
                }
            });
            return c
        };
        this.getEdges = function (b) {
            var h = ((b instanceof Array ? b : [b]) || []).map(function (a) {
                return i(c.edgesIndex[a])
            });
            return b instanceof Array ? h : h[0]
        };
        this.getNodes = function (d) {
            var h = ((d instanceof Array ? d : [d]) || []).map(function (a) {
                return b(c.nodesIndex[a])
            });
            return d instanceof Array ? h : h[0]
        };
        this.empty = h;
        this.rescale = function (b, h, a, f, i) {
            var l = 0,
                m = 0,
                j = 0,
                g = Math;
            a && c.nodes.forEach(function (a) {
                m = g.max(a.size, m)
            });
            f && c.edges.forEach(function (a) {
                l = g.max(a.size, l)
            });
            i && c.nodesBG.forEach(function (a) {
                j = g.max(a.size, j)
            });
            var m = m || 1,
                j = j || 1,
                l = l || 1,
                v, q, A, w;
            a && c.nodes.forEach(function (a) {
                q = g.max(a.x, q || a.x);
                v = g.min(a.x, v || a.x);
                w = g.max(a.y, w || a.y);
                A = g.min(a.y, A || a.y)
            });
            var u = "outside" == c.p.scalingMode ? g.max(b / g.max(q - v, 1), h / g.max(w - A, 1)) : g.min(b / g.max(q - v, 1), h / g.max(w - A, 1)),
                u = u - u / 20,
                x, k;
            !c.p.maxNodeSize && !c.p.minNodeSize ? (x = 1, k = 0) : c.p.maxNodeSize == c.p.minNodeSize ? (x = 0, k = c.p.maxNodeSize) : (x = (c.p.maxNodeSize - c.p.minNodeSize) / m, k = c.p.minNodeSize);
            var p, r;
            !c.p.maxEdgeSize && !c.p.minEdgeSize ? (p = 1, r = 0) : (p = c.p.maxEdgeSize == c.p.minEdgeSize ? 0 : (c.p.maxEdgeSize - c.p.minEdgeSize) / l, r = c.p.minEdgeSize);
            a && c.nodes.forEach(function (a) {
                a.displaySize = a.size * x + k;
                if (!a.fixed) {
                    a.displayX = (a.x - (q + v) / 2) * u + b / 2;
                    a.displayY = (a.y - (w + A) / 2) * u + h / 2
                }
            });
            i && c.nodesBG.forEach(function (a) {
                a.displaySize = a.size * g.sqrt(sigInst._core.mousecaptor.ratio * u);
                if (!a.fixed) {
                    a.displayX = (a.x - (q + v) / 2) * u + b / 2;
                    a.displayY = (a.y - (w + A) / 2) * u + h / 2
                }
            });
            f && c.edges.forEach(function (a) {
                a.displaySize = a.size * p + r
            });
            return c
        };
        this.translate = function (b, h, a, f, i, g) {
            var m = Math.pow(a, c.p.nodesPowRatio);
            f && c.nodes.forEach(function (c) {
                c.fixed || (c.displayX = c.displayX * a + b, c.displayY = c.displayY * a + h);
                c.displaySize *= m
            });
            g && c.nodesBG.forEach(function (c) {
                c.fixed || (c.displayX = c.displayX * a + b, c.displayY = c.displayY * a + h);
                c.displaySize *= m
            });
            m = Math.pow(a, c.p.edgesPowRatio);
            i && c.edges.forEach(function (a) {
                a.displaySize *= m
            });
            return c
        };
        this.setBorders = function () {
            c.borders = {};
            c.nodes.forEach(function (b) {
                c.borders.minX = Math.min(void 0 == c.borders.minX ? b.displayX - b.displaySize : c.borders.minX, b.displayX - b.displaySize);
                c.borders.maxX = Math.max(void 0 == c.borders.maxX ? b.displayX + b.displaySize : c.borders.maxX, b.displayX + b.displaySize);
                c.borders.minY = Math.min(void 0 == c.borders.minY ? b.displayY - b.displaySize : c.borders.minY, b.displayY - b.displaySize);
                c.borders.maxY = Math.max(void 0 == c.borders.maxY ? b.displayY - b.displaySize : c.borders.maxY, b.displayY - b.displaySize)
            })
        };
        this.checkHover = function (b, h) {
            var a, f, i, g = [],
                m = [];
            c.nodes.forEach(function (c) {
                if (c.hidden) c.hover = !1;
                else {
                    a = Math.abs(c.displayX - b);
                    f = Math.abs(c.displayY - h);
                    i = c.displaySize;
                    var v = c.hover,
                        k = a < i && f < i && Math.sqrt(a * a + f * f) < i;
                    v && !k ? (c.hover = !1, m.push(c.id)) : k && !v && (c.hover = !0, g.push(c.id))
                }
            });
            g.length && c.dispatch("overnodes", g);
            m.length && c.dispatch("outnodes", m);
            return c
        }
    }
    function i(b, i) {
        function h() {
            var b;
            b = "<p>GLOBAL :</p>";
            for (var h in c.p.globalProbes) b += "<p>" + h + " : " + c.p.globalProbes[h]() + "</p>";
            b += "<br><p>LOCAL :</p>";
            for (h in c.p.localProbes) b += "<p>" + h + " : " + c.p.localProbes[h]() + "</p>";
            c.p.dom.innerHTML = b;
            return c
        }
        sigma.classes.Cascade.call(this);
        var c = this;
        this.instance = b;
        this.monitoring = !1;
        this.p = {
            fps: 40,
            dom: i,
            globalProbes: {
                "Time (ms)": sigma.chronos.getExecutionTime,
                Queue: sigma.chronos.getQueuedTasksCount,
                Tasks: sigma.chronos.getTasksCount,
                FPS: sigma.chronos.getFPS
            },
            localProbes: {
                "Nodes count": function () {
                    return c.instance.graph.nodes.length
                },
                "Edges count": function () {
                    return c.instance.graph.edges.length
                }
            }
        };
        this.activate = function () {
            c.monitoring || (c.monitoring = window.setInterval(h, 1E3 / c.p.fps));
            return c
        };
        this.desactivate = function () {
            c.monitoring && (window.clearInterval(c.monitoring), c.monitoring = null, c.p.dom.innerHTML = "");
            return c
        }
    }
    function k(b) {
        function i(a) {
            f.mouseX = void 0 != a.offsetX && a.offsetX || void 0 != a.layerX && a.layerX || void 0 != a.clientX && a.clientX;
            f.mouseY = void 0 != a.offsetY && a.offsetY || void 0 != a.layerY && a.layerY || void 0 != a.clientY && a.clientY;
            if (f.isMouseDown) {
                var b = f.mouseX - k + m,
                    c = f.mouseY - l + j;
                if (b != f.stageX || c != f.stageY) w = A, x = u, A = b, u = c, f.stageX = b, f.stageY = c, f.dispatch("drag")
            }
            f.dispatch("move");
            a.preventDefault ? a.preventDefault() : a.returnValue = !1
        }
        function h(a) {
            f.p.mouseEnabled && f.isMouseDown && (f.isMouseDown = !1, f.dispatch("mouseup"), (m != f.stageX || j != f.stageY) && g(f.stageX + f.p.inertia * (f.stageX - w), f.stageY + f.p.inertia * (f.stageY - x)), a.preventDefault ? a.preventDefault() : a.returnValue = !1)
        }
        function c(a) {
            f.p.mouseEnabled && (f.isMouseDown = !0, f.dispatch("mousedown"), m = f.stageX, j = f.stageY, k = f.mouseX, l = f.mouseY, w = A = f.stageX, x = u = f.stageY, f.dispatch("startdrag"), a.preventDefault ? a.preventDefault() : a.returnValue = !1)
        }
        function d(a) {
            f.p.mouseEnabled && (g(f.mouseX, f.mouseY, f.ratio * (0 < (void 0 != a.wheelDelta && a.wheelDelta || void 0 != a.detail && -a.detail) ? f.p.zoomMultiply : 1 / f.p.zoomMultiply)), f.p.blockScroll && (a.preventDefault ? a.preventDefault() : a.returnValue = !1))
        }
        function g(b, c, d) {
            if (!f.isMouseDown && (window.clearInterval(f.interpolationID), p = void 0 != d, m = f.stageX, y = b, j = f.stageY, q = c, n = d || f.ratio, n = Math.min(Math.max(n, f.p.minRatio), f.p.maxRatio), B = f.p.directZooming ? 1 - (p ? f.p.zoomDelta : f.p.dragDelta) : 0, f.ratio != n || f.stageX != y || f.stageY != q)) a(), f.interpolationID = window.setInterval(a, 50), f.dispatch("startinterpolate")
        }
        function a() {
            B += p ? f.p.zoomDelta : f.p.dragDelta;
            B = Math.min(B, 1);
            var a = sigma.easing.quadratic.easeout(B),
                b = f.ratio;
            f.ratio = b * (1 - a) + n * a;
            p ? (f.stageX = y + (f.stageX - y) * f.ratio / b, f.stageY = q + (f.stageY - q) * f.ratio / b) : (f.stageX = m * (1 - a) + y * a, f.stageY = j * (1 - a) + q * a);
            f.dispatch("interpolate");
            1 <= B && (window.clearInterval(f.interpolationID), a = f.ratio, p ? (f.ratio = n, f.stageX = y + (f.stageX - y) * f.ratio / a, f.stageY = q + (f.stageY - q) * f.ratio / a) : (f.stageX = y, f.stageY = q), f.dispatch("stopinterpolate"))
        }
        sigma.classes.Cascade.call(this);
        sigma.classes.EventDispatcher.call(this);
        var f = this;
        this.p = {
            minRatio: 1,
            maxRatio: 32,
            marginRatio: 1,
            zoomDelta: 0.1,
            dragDelta: 0.3,
            zoomMultiply: 2,
            directZooming: !1,
            blockScroll: !0,
            inertia: 1.1,
            mouseEnabled: !0
        };
        var k = 0,
            l = 0,
            m = 0,
            j = 0,
            n = 1,
            y = 0,
            q = 0,
            A = 0,
            w = 0,
            u = 0,
            x = 0,
            B = 0,
            p = !1;
        this.stageY = this.stageX = 0;
        this.ratio = 1;
        this.mouseY = this.mouseX = 0;
        this.isMouseDown = !1;
        b.addEventListener && document.addEventListener ? (b.addEventListener("DOMMouseScroll", d, !0), b.addEventListener("mousewheel", d, !0), b.addEventListener("mousemove", i, !0), b.addEventListener("mousedown", c, !0), document.addEventListener("mouseup", h, !0)) : (b.attachEvent("onDOMMouseScroll", d), b.attachEvent("onmousewheel", d), b.attachEvent("onmousemove", i), b.attachEvent("onmousedown", c), document.attachEvent("onmouseup", h));
        this.checkBorders = function () {
            return f
        };
        this.interpolate = g
    }
    function o(b, i, h, c, d, g, a, f, k) {
        function l(a) {
            var b = c,
                d = Math.round,
                f = "fixed" == j.p.labelSize ? j.p.defaultLabelSize : j.p.labelSizeRatio * a.displaySize;
            b.font = (j.p.hoverFontStyle || j.p.fontStyle || "") + " " + f + "px " + (j.p.hoverFont || j.p.font || "");
            b.fillStyle = "node" == j.p.labelHoverBGColor ? a.color || j.p.defaultNodeColor : j.p.defaultHoverLabelBGColor;
            j.p.labelHoverShadow && (b.shadowOffsetX = 0, b.shadowOffsetY = 0, b.shadowBlur = 4, b.shadowColor = j.p.labelHoverShadowColor);
            var h = d(a.displayX + 10),
                g = d(a.displayY - f / 2 - 2),
                i = d(b.measureText(a.label).width + 6),
                m = d(f + 4);
            d(f / 2 + 2);
            b.fillRect(h, g, i, m);
            b.shadowOffsetX = 0;
            b.shadowOffsetY = 0;
            b.shadowBlur = 0;
            b.fillStyle = "node" == j.p.labelHoverColor ? a.color || j.p.defaultNodeColor : j.p.defaultLabelHoverColor;
            b.fillText(a.label, h + 4, g + m - 3);
            return j
        }
        function m(a) {
            if (isNaN(a.x) || isNaN(a.y)) throw Error("A node's coordinate is not a number (id: " + a.id + ")");
            return !a.hidden && a.displayX + a.displaySize > -n / 3 && a.displayX - a.displaySize < 4 * n / 3 && a.displayY + a.displaySize > -y / 3 && a.displayY - a.displaySize < 4 * y / 3
        }
        sigma.classes.Cascade.call(this);
        var j = this;
        this.contexts = {
            node: b,
            edge: i,
            label: h,
            hover: c,
            bg: d,
            bg2: g
        };
        this.p = {
            labelColor: "default",
            defaultLabelColor: "#fff",
            labelHoverBGColor: "default",
            defaultHoverLabelBGColor: "#fff",
            labelHoverShadow: !0,
            labelHoverShadowColor: "#000",
            labelHoverColor: "default",
            defaultLabelHoverColor: "#000",
            labelActiveBGColor: "default",
            defaultActiveLabelBGColor: "#fff",
            labelActiveShadow: !0,
            labelActiveShadowColor: "#000",
            labelActiveColor: "default",
            defaultLabelActiveColor: "#000",
            labelSize: "fixed",
            defaultLabelSize: 12,
            labelSizeRatio: 2,
            labelThreshold: 6,
            font: "Arial",
            hoverFont: "",
            activeFont: "",
            fontStyle: "",
            hoverFontStyle: "",
            activeFontStyle: "",
            edgeColor: "source",
            defaultEdgeColor: "#aaa",
            defaultEdgeType: "line",
            defaultNodeColor: "#aaa",
            nodeHoverColor: "node",
            defaultNodeHoverColor: "#fff",
            nodeActiveColor: "node",
            defaultNodeActiveColor: "#fff",
            borderSize: 0,
            nodeBorderColor: "node",
            defaultNodeBorderColor: "#fff",
            edgesSpeed: 200,
            nodesSpeed: 200,
            nodesBGSpeed: 200,
            labelsSpeed: 200
        };
        var n = f,
            y = k;
        this.currentBGIndex = this.currentLabelIndex = this.currentBGIndex = this.currentNodeIndex = this.currentEdgeIndex = 0;
        this.task_drawLabel = function () {
            for (var b = a.nodes.length, c = 0; c++ < j.p.labelsSpeed && j.currentLabelIndex < b;) if (j.isOnScreen(a.nodes[j.currentLabelIndex])) {
                var d = a.nodes[j.currentLabelIndex++],
                    f = h;
                if (d.displaySize >= j.p.labelThreshold) {
                    var g = "fixed" == j.p.labelSize ? j.p.defaultLabelSize : j.p.labelSizeRatio * d.displaySize;
                    f.font = (j.p.hoverFontStyle || j.p.fontStyle || "") + " " + g + "px " + (j.p.hoverFont || j.p.font || "");
                    var i = Math.round,
                        m = i(d.displayX + 10),
                        l = i(d.displayY + g / 2 - 2),
                        k = i(f.measureText(d.label).width + 6),
                        v = i(g + 4);
                    i(g / 2 + 2);
                    f.font = j.p.fontStyle + g + "px " + j.p.font;
                    f.fillStyle = "#258EA4";
                    f.fillRect(m, l - v + 3, k, v);
                    f.fillStyle = "#fff";
                    f.fillText(d.label, m + 4, l)
                }
            } else j.currentLabelIndex++;
            return j.currentLabelIndex < b
        };
        this.task_drawEdge = function () {
            for (var b = a.edges.length, c, d, f = 0, h; f++ < j.p.edgesSpeed && j.currentEdgeIndex < b;) if (h = a.edges[j.currentEdgeIndex], c = h.source, d = h.target, h.hidden || c.hidden || d.hidden || !j.isOnScreen(c) && !j.isOnScreen(d)) j.currentEdgeIndex++;
            else {
                c = a.edges[j.currentEdgeIndex++];
                d = c.source.displayX;
                h = c.source.displayY;
                var g = c.target.displayX,
                    m = c.target.displayY,
                    l = void 0;
                   // l = c.attr.color ? c.attr.color : "rgba(255, 0, 0, .6)";
                if (!l) switch (j.p.edgeColor) {
                case "source":
                    l = c.source.color || j.p.defaultNodeColor;
                    break;
                case "target":
                    l = c.target.color || j.p.defaultNodeColor;
                    break;
                default:
                    l = j.p.defaultEdgeColor
                }
                var k = i;
                k.strokeStyle = l;
                k.lineWidth = c.attr.lineWidth ? c.attr.lineWidth : 0.2;
                switch (c.type || j.p.defaultEdgeType) {
                case "curve":
                    k.beginPath();
                    k.moveTo(d, h);
                    k.quadraticCurveTo((d + g) / 2 + (m - h) / 4, (h + m) / 2 + (d - g) / 4, g, m);
                    k.stroke();
                    break;
                default:
                    k.beginPath(), k.moveTo(d, h), k.lineTo(g, m), k.stroke()
                }
            }
            return j.currentEdgeIndex < b
        };
        this.task_drawNode = function () {
            for (var b = a.nodes.length, c = 0; c++ < j.p.nodesSpeed && j.currentNodeIndex < b;) j.isOnScreen(a.nodes[j.currentNodeIndex]) ? j.drawNode(a.nodes[j.currentNodeIndex++]) : j.currentNodeIndex++;
            return j.currentNodeIndex < b
        };
        this.task_drawBG = function () {
            for (var b = a.nodesBG.length, c = 0; c++ < j.p.nodesBGSpeed && j.currentBGIndex < b;) j.drawBG(a.nodesBG[j.currentBGIndex++]);
            return j.currentBGIndex < b
        };
        this.drawBG = function (a) {
            var b = Math,
                c = b.round(10 * a.displaySize) / 10,
                f = a.displayX,
                h = a.displayY;
            d.fillStyle = "#fff";
            d.beginPath();
            d.arc(f, h, c, 0, 2 * b.PI, !0);
            d.closePath();
            d.fill();
            var g = "fixed" == j.p.labelSize ? j.p.defaultLabelSize : j.p.labelSizeRatio * a.displaySize,
                b = b.round,
                i, m, l;
            i = d.measureText(a.label).width;
            l = c * a.attr.deltaX / 100;
            var k = c * a.attr.deltaY / 100;
            switch (a.attr.position) {
                default: c = b(f - l - c - i - 13);
                l = b(h + k);
                i = c;
                m = l - 3;
                f = b(f);
                h = b(h + k);
                break;
            case "right":
                c = b(f + l + a.displaySize + 8 + i), l = b(h + k), i = c - i, m = l - 3, f = b(f), h = b(h + k)
            }
            d.font = g + "px sans-serif";
            d.fillStyle = "#fff";
            d.fillText(a.label, i, m);
            d.strokeStyle = "#fff";
            d.lineWidth = 0.7;
            d.save();
            d.moveTo(c, l);
            d.lineTo(f, h);
            d.stroke();
            d.restore();
            return j
        };
        this.drawNode = function (a) {
            var c = Math.round(10 * a.displaySize) / 10;
            b.fillStyle = a.attr.color ? a.attr.color : "#ff0000"; 
            b.strokeStyle = a.attr.strokeStyle ? a.attr.strokeStyle : "#000";
            a.attr.lineWidth && (b.lineWidth = a.attr.lineWidth);
            var d = 2 * Math.PI;
            1 > c && (c = 1);
            var f = a.displayX,
                h = a.displayY,
                i = 9 * c;
                // m = b.createRadialGradient(f, h, i - 7, f, h, i);
            // m.addColorStop(0, "#ff0000");
            //          m.addColorStop(1, "rgba(255, 255, 255, 0)");
            //g.fillStyle = m;
            b.beginPath();
            b.arc(f, h, 1.4 * c, 0, d, !0);
            b.closePath();
            a.attr.lineWidth && b.stroke();
            b.fill();
            a.hover && l(a);
            return j
        };
        this.getCtx = function (a) {
            return j.contexts[a] ? j.contexts[a] : !1
        };
        this.drawActiveNode = function (a) {
            var b = c;
            if (!m(a)) return j;
            var d = "fixed" == j.p.labelSize ? j.p.defaultLabelSize : j.p.labelSizeRatio * a.displaySize;
            b.font = (j.p.activeFontStyle || j.p.fontStyle || "") + " " + d + "px " + (j.p.activeFont || j.p.font || "");
            b.fillStyle = "node" == j.p.labelHoverBGColor ? a.color || j.p.defaultNodeColor : j.p.defaultActiveLabelBGColor;
            b.beginPath();
            j.p.labelActiveShadow && (b.shadowOffsetX = 0, b.shadowOffsetY = 0, b.shadowBlur = 4, b.shadowColor = j.p.labelActiveShadowColor);
            sigma.tools.drawRoundRect(b, Math.round(a.displayX - d / 2 - 2), Math.round(a.displayY - d / 2 - 2), Math.round(b.measureText(a.label).width + 1.5 * a.displaySize + d / 2 + 4), Math.round(d + 4), Math.round(d / 2 + 2), "left");
            b.closePath();
            b.fill();
            b.shadowOffsetX = 0;
            b.shadowOffsetY = 0;
            b.shadowBlur = 0;
            b.beginPath();
            b.fillStyle = "node" == j.p.nodeBorderColor ? a.color || j.p.defaultNodeColor : j.p.defaultNodeBorderColor;
            b.arc(Math.round(a.displayX), Math.round(a.displayY), a.displaySize + j.p.borderSize, 0, 2 * Math.PI, !0);
            b.closePath();
            b.fill();
            b.beginPath();
            b.fillStyle = "node" == j.p.nodeActiveColor ? a.color || j.p.defaultNodeColor : j.p.defaultNodeActiveColor;
            b.arc(Math.round(a.displayX), Math.round(a.displayY), a.displaySize, 0, 2 * Math.PI, !0);
            b.closePath();
            b.fill();
            b.fillStyle = "node" == j.p.labelActiveColor ? a.color || j.p.defaultNodeColor : j.p.defaultLabelActiveColor;
            b.fillText(a.label, Math.round(a.displayX + 1.5 * a.displaySize), Math.round(a.displayY + d / 2 - 3));
            return j
        };
        this.drawHoverNode = l;
        this.isOnScreen = m;
        this.resize = function (a, b) {
            n = a;
            y = b;
            return j
        }
    }
    function t(b, v) {
        function h() {
            sigma.chronos.removeTask("node_" + a.id, 2).removeTask("edge_" + a.id, 2).removeTask("label_" + a.id, 2).stopTasks();
            return a
        }
        function c(b, c) {
            var d = document.createElement(c);
            d.style.position = "absolute";
            d.setAttribute("id", "sigma_" + b + "_" + a.id);
            d.setAttribute("class", "sigma_" + b + "_" + c);
	        d.setAttribute("width", a.width);
	        d.setAttribute("height", a.height);
            a.domRoot.appendChild(d);
            "undefined" != typeof G_vmlCanvasManager && "canvas" == c && (d = G_vmlCanvasManager.initElement(d));
            a.domElements[b] = d;
            d.getContext && (a.contexts[b] = d.getContext("2d"));
            return a
        }

        function d() {
            a.p.drawHoverNodes && (a.graph.checkHover(a.mousecaptor.mouseX, a.mousecaptor.mouseY), a.domElements.mouse.style.cursor = "default", a.graph.nodes.forEach(function (b) {
                b.hover && !b.active && (a.domElements.mouse.style.cursor = "pointer", a.plotter.drawHoverNode(b))
            }));
            return a
        }
        function s() {
            a.p.drawActiveNodes && a.graph.nodes.forEach(function (b) {
                b.active && a.plotter.drawActiveNode(b)
            });
            return a
        }
        sigma.classes.Cascade.call(this);
        sigma.classes.EventDispatcher.call(this);
        var a = this;
        this.id = v.toString();
        this.p = {
            auto: !0,
            drawNodes: 2,
            drawEdges: 1,
            drawLabels: 2,
            drawBG: 2,
            lastNodes: 2,
            lastEdges: 0,
            lastLabels: 2,
            lastBG: 2,
            drawHoverNodes: !0,
            drawActiveNodes: !0
        };
        this.domRoot = b;
        this.width = this.domRoot.offsetWidth;
        this.height = this.domRoot.offsetHeight;
        this.graph = new n;
        this.domElements = {};
        this.contexts = {};
        c("bg", "canvas");
        c("bg2", "canvas");
        c("edges", "canvas");
        c("nodes", "canvas");
        c("labels", "canvas");
        c("hover", "canvas");
        c("monitor", "div");
        c("mouse", "canvas");
        this.plotter = new o(this.contexts.nodes, this.contexts.edges, this.contexts.labels, this.contexts.hover, this.contexts.bg, this.contexts.bg2, this.graph, this.width, this.height);
        this.monitor = new i(this, this.domElements.monitor);
        this.mousecaptor = new k(this.domElements.mouse, this.id);
        this.mousecaptor.bind("drag interpolate", function () {
            a.draw(a.p.auto ? 2 : a.p.drawNodes, a.p.auto ? 0 : a.p.drawEdges, a.p.auto ? 2 : a.p.drawLabels, a.p.auto ? 2 : a.p.drawBG, !0)
        }).bind("stopdrag stopinterpolate", function () {
            a.draw(a.p.auto ? 2 : a.p.drawNodes, a.p.auto ? 1 : a.p.drawEdges, a.p.auto ? 2 : a.p.drawLabels, a.p.auto ? 2 : a.p.drawBG, !0)
        }).bind("mousedown mouseup", function (b) {
            var c = a.graph.nodes.filter(function (a) {
                return !!a.hover
            }).map(function (a) {
                return a.id
            });
            a.dispatch("mousedown" == b.type ? "downgraph" : "upgraph");
            c.length && a.dispatch("mousedown" == b.type ? "downnodes" : "upnodes", c)
        }).bind("move", function () {
            a.contexts.hover.clearRect(0, 0, a.domElements.hover.width, a.domElements.hover.height);
            d();
            s()
        });
        sigma.chronos.bind("startgenerators", function () {
            sigma.chronos.getGeneratorsIDs().some(function (b) {
                return !!b.match(RegExp("_ext_" + a.id + "$", ""))
            }) && a.draw(a.p.auto ? 2 : a.p.drawNodes, a.p.auto ? 0 : a.p.drawEdges, a.p.auto ? 2 : a.p.drawLabels)
        }).bind("stopgenerators", function () {
            a.draw()
        });
        for (var f = 0; f < g.length; f++) g[f](this);
        this.draw = function (b, c, d, f, i) {
            if (i && sigma.chronos.getGeneratorsIDs().some(function (b) {
                return !!b.match(RegExp("_ext_" + a.id + "$", ""))
            })) return a;
            b = void 0 == b ? a.p.drawNodes : b;
            c = void 0 == c ? a.p.drawEdges : c;
            d = void 0 == d ? a.p.drawLabels : d;
            f = void 0 == f ? a.p.drawBG : f;
            i = {
                nodes: b,
                edges: c,
                labels: d,
                bg: f
            };
            a.p.lastNodes = b;
            a.p.lastEdges = c;
            a.p.lastLabels = d;
            a.p.lastBG = f;
            h();
            a.graph.rescale(a.width, a.height, 0 < b, 0 < c, 0 < f).setBorders();
            a.mousecaptor.checkBorders(a.graph.borders, a.width, a.height);
            a.graph.translate(a.mousecaptor.stageX, a.mousecaptor.stageY, a.mousecaptor.ratio, 0 < b, 0 < c, 0 < f);
            a.dispatch("graphscaled");
            for (var g in a.domElements) "canvas" == a.domElements[g].nodeName.toLowerCase() && (void 0 == i[g] || 0 <= i[g]) && a.contexts[g].clearRect(0, 0, a.domElements[g].width, a.domElements[g].height);
            a.plotter.currentEdgeIndex = 0;
            a.plotter.currentNodeIndex = 0;
            a.plotter.currentLabelIndex = 0;
            a.plotter.currentBGIndex = 0;
            g = null;
            i = !1;
            if (f) if (1 < f) for (; a.plotter.task_drawBG(););
            else sigma.chronos.addTask(a.plotter.task_drawBG, "bg_" + a.id, !1), i = !0, g = "bg_" + a.id;
            if (b) if (1 < b) for (; a.plotter.task_drawNode(););
            else sigma.chronos.addTask(a.plotter.task_drawNode, "node_" + a.id, !1), i = !0, g = "node_" + a.id;
            if (d) if (1 < d) for (; a.plotter.task_drawLabel(););
            else g ? sigma.chronos.queueTask(a.plotter.task_drawLabel, "label_" + a.id, g) : sigma.chronos.addTask(a.plotter.task_drawLabel, "label_" + a.id, !1), i = !0, g = "label_" + a.id;
            if (c) if (1 < c) for (; a.plotter.task_drawEdge(););
            else g ? sigma.chronos.queueTask(a.plotter.task_drawEdge, "edge_" + a.id, g) : sigma.chronos.addTask(a.plotter.task_drawEdge, "edge_" + a.id, !1), i = !0, g = "edge_" + a.id;
            a.dispatch("draw");
            a.refresh();
            i && sigma.chronos.runTasks();
            return a
        };
        this.resize = function (b, c) {
            var d = a.width,
                f = a.height;
            void 0 != b && void 0 != c ? (a.width = b, a.height = c) : (a.width = a.domRoot.offsetWidth, a.height = a.domRoot.offsetHeight);
            if (d != a.width || f != a.height) {
                for (var h in a.domElements) a.domElements[h].setAttribute("width", a.width + "px"), a.domElements[h].setAttribute("height", a.height + "px");
                a.plotter.resize(a.width, a.height);
                a.draw(a.p.lastNodes, a.p.lastEdges, a.p.lastLabels, a.p.drawBG, !0)
            }
            return a
        };
        this.refresh = function () {
            a.contexts.hover.clearRect(0, 0, a.domElements.hover.width, a.domElements.hover.height);
            d();
            s();
            return a
        };
        this.drawHover = d;
        this.drawActive = s;
        this.clearSchedule = h;
        window.addEventListener ? window.addEventListener("resize", function () {
            a.resize()
        }, !1) : window.attachEvent("onresize", function () {
            a.resize()
        })
    }
    function s(b) {
        var g = this;
        sigma.classes.EventDispatcher.call(this);
        this._core = b;
        this.kill = function () {};
        this.getID = function () {
            return b.id
        };
        this.configProperties = function (h, c) {
            var d = b.config(h, c);
            return d == b ? g : d
        };
        this.drawingProperties = function (h, c) {
            var d = b.plotter.config(h, c);
            return d == b.plotter ? g : d
        };
        this.mouseProperties = function (h, c) {
            var d = b.mousecaptor.config(h, c);
            return d == b.mousecaptor ? g : d
        };
        this.graphProperties = function (h, c) {
            var d = b.graph.config(h, c);
            return d == b.graph ? g : d
        };
        this.getMouse = function () {
            return {
                mouseX: b.mousecaptor.mouseX,
                mouseY: b.mousecaptor.mouseY,
                down: b.mousecaptor.isMouseDown
            }
        };
        this.position = function (h, c, d) {
            if (0 == arguments.length) return {
                stageX: b.mousecaptor.stageX,
                stageY: b.mousecaptor.stageY,
                ratio: b.mousecaptor.ratio
            };
            b.mousecaptor.stageX = void 0 != h ? h : b.mousecaptor.stageX;
            b.mousecaptor.stageY = void 0 != c ? c : b.mousecaptor.stageY;
            b.mousecaptor.ratio = void 0 != d ? d : b.mousecaptor.ratio;
            return g
        };
        this.goTo = function (h, c, d) {
            b.mousecaptor.interpolate(h, c, d);
            return g
        };
        this.zoomTo = function (h, c, d) {
            d = Math.min(Math.max(b.mousecaptor.config("minRatio"), d), b.mousecaptor.config("maxRatio"));
            d == b.mousecaptor.ratio ? b.mousecaptor.interpolate(h - b.width / 2 + b.mousecaptor.stageX, c - b.height / 2 + b.mousecaptor.stageY) : b.mousecaptor.interpolate((d * h - b.mousecaptor.ratio * b.width / 2) / (d - b.mousecaptor.ratio), (d * c - b.mousecaptor.ratio * b.height / 2) / (d - b.mousecaptor.ratio), d);
            return g
        };
        this.resize = function (h, c) {
            b.resize(h, c);
            return g
        };
        this.draw = function (h, c, d, i, a) {
            b.draw(h, c, d, i, a);
            return g
        };
        this.refresh = function () {
            b.refresh();
            return g
        };
        this.addGenerator = function (h, c, d) {
            sigma.chronos.addGenerator(h + "_ext_" + b.id, c, d);
            return g
        };
        this.removeGenerator = function (h) {
            sigma.chronos.removeGenerator(h + "_ext_" + b.id);
            return g
        };
        this.addNode = function (h, c) {
            b.graph.addNode(h, c);
            return g
        };
        this.addNodeBG = function (h, c) {
            b.graph.addNodeBG(h, c);
            return g
        };
        this.addEdge = function (h, c, d, i) {
            b.graph.addEdge(h, c, d, i);
            return g
        };
        this.dropNode = function (h) {
            b.graph.dropNode(h);
            return g
        };
        this.dropEdge = function (h) {
            b.graph.dropEdge(h);
            return g
        };
        this.pushGraph = function (h, c) {
            h.nodes && h.nodes.forEach(function (d) {
                d.id && (!c || !b.graph.nodesIndex[d.id]) && g.addNode(d.id, d)
            });
            h.edges && h.edges.forEach(function (d) {
                (validID = d.source && d.target && d.id) && (!c || !b.graph.edgesIndex[d.id]) && g.addNode(d.id, d.source, d.target, d)
            });
            return g
        };
        this.emptyGraph = function () {
            b.graph.empty();
            return g
        };
        this.getNodesCount = function () {
            return b.graph.nodes.length
        };
        this.getEdgesCount = function () {
            return b.graph.edges.length
        };
        this.iterNodes = function (h, c) {
            b.graph.iterNodes(h, c);
            return g
        };
        this.iterEdges = function (h, c) {
            b.graph.iterEdges(h, c);
            return g
        };
        this.getNodes = function (h) {
            return b.graph.getNodes(h)
        };
        this.getEdges = function (h) {
            return b.graph.getEdges(h)
        };
        this.activateMonitoring = function () {
            return b.monitor.activate()
        };
        this.desactivateMonitoring = function () {
            return b.monitor.desactivate()
        };
        b.bind("downnodes upnodes downgraph upgraph", function (b) {
            g.dispatch(b.type, b.content)
        });
        b.graph.bind("overnodes outnodes", function (b) {
            g.dispatch(b.type, b.content)
        })
    }
    var C = 0;
    g = void 0;
    g = [];
    sigma.init = function (b) {
        b = new t(b, (++C).toString());
        sigma.instances[C] = new s(b);
        return sigma.instances[C]
    };
    sigma.addPlugin = function (b, i, h) {
        s.prototype[b] = i;
        g.push(h)
    };
    sigma.chronos = new function () {
        function b(a) {
            window.setTimeout(a, 0);
            return l
        }
        function g() {
            for (l.dispatch("frameinserted"); m && r.length && h(););
            !m || !r.length ? d() : (x = (new Date).getTime(), o++, B = w - q, s = q - B, l.dispatch("insertframe"), b(g))
        }
        function h() {
            t %= r.length;
            if (!r[t].task()) {
                var a = r[t].taskName;
                z = z.filter(function (b) {
                    b.taskParent == a && r.push({
                        taskName: b.taskName,
                        task: b.task
                    });
                    return b.taskParent != a
                });
                l.dispatch("killed", r.splice(t--, 1)[0])
            }
            t++;
            w = (new Date).getTime() - x;
            return w <= s
        }
        function c() {
            m = !0;
            o = t = 0;
            u = x = (new Date).getTime();
            l.dispatch("start");
            l.dispatch("insertframe");
            b(g);
            return l
        }
        function d() {
            l.dispatch("stop");
            m = !1;
            return l
        }
        function i(a, b, d) {
            if ("function" != typeof a) throw Error('Task "' + b + '" is not a function');
            r.push({
                taskName: b,
                task: a
            });
            m = !(!m && !(d && c() || 1));
            return l
        }
        function a(a) {
            return a ? Object.keys(p).filter(function (a) {
                return !!p[a].on
            }).length : Object.keys(p).length
        }
        function f() {
            Object.keys(p).length ? (l.dispatch("startgenerators"), l.unbind("killed", k), b(function () {
                for (var a in p) p[a].on = !0, i(p[a].task, a, !1)
            }), l.bind("killed", k).runTasks()) : l.dispatch("stopgenerators");
            return l
        }
        function k(b) {
            void 0 != p[b.content.taskName] && (p[b.content.taskName].del || !p[b.content.taskName].condition() ? delete p[b.content.taskName] : p[b.content.taskName].on = !1, 0 == a(!0) && f())
        }
        sigma.classes.EventDispatcher.call(this);
        var l = this,
            m = !1,
            j = 80,
            n = 0,
            o = 0,
            q = 1E3 / j,
            s = q,
            w = 0,
            u = 0,
            x = 0,
            B = 0,
            p = {},
            r = [],
            z = [],
            t = 0;
        this.frequency = function (a) {
            return void 0 != a ? (j = Math.abs(1 * a), q = 1E3 / j, o = 0, l) : j
        };
        this.runTasks = c;
        this.stopTasks = d;
        this.insertFrame = b;
        this.addTask = i;
        this.queueTask = function (a, b, c) {
            if ("function" != typeof a) throw Error('Task "' + b + '" is not a function');
            if (!r.concat(z).some(function (a) {
                return a.taskName == c
            })) throw Error('Parent task "' + c + '" of "' + b + '" is not attached.');
            z.push({
                taskParent: c,
                taskName: b,
                task: a
            });
            return l
        };
        this.removeTask = function (a, b) {
            if (void 0 == a) r = [], 1 == b ? z = [] : 2 == b && (r = z, z = []), d();
            else {
                var c = "string" == typeof a ? a : "";
                r = r.filter(function (b) {
                    return ("string" == typeof a ? b.taskName == a : b.task == a) ? (c = b.taskName, !1) : !0
                });
                0 < b && (z = z.filter(function (a) {
                    1 == b && a.taskParent == c && r.push(a);
                    return a.taskParent != c
                }))
            }
            m = !(r.length && (!d() || 1));
            return l
        };
        this.addGenerator = function (b, c, d) {
            if (void 0 != p[b]) return l;
            p[b] = {
                task: c,
                condition: d
            };
            0 == a(!0) && f();
            return l
        };
        this.removeGenerator = function (a) {
            p[a] && (p[a].on = !1, p[a].del = !0);
            return l
        };
        this.startGenerators = f;
        this.getGeneratorsIDs = function () {
            return Object.keys(p)
        };
        this.getFPS = function () {
            m && (n = Math.round(1E4 * (o / ((new Date).getTime() - u))) / 10);
            return n
        };
        this.getTasksCount = function () {
            return r.length
        };
        this.getQueuedTasksCount = function () {
            return z.length
        };
        this.getExecutionTime = function () {
            return x - u
        };
        return this
    };
    sigma.debugMode = 0;
    sigma.log = function () {
        if (1 == sigma.debugMode) for (var b in arguments) console.log(arguments[b]);
        else if (1 < sigma.debugMode) for (b in arguments) throw Error(arguments[b]);
        return sigma
    };
    sigma.easing = {
        linear: {},
        quadratic: {}
    };
    sigma.easing.linear.easenone = function (b) {
        return b
    };
    sigma.easing.quadratic.easein = function (b) {
        return b * b
    };
    sigma.easing.quadratic.easeout = function (b) {
        return -b * (b - 2)
    };
    sigma.easing.quadratic.easeinout = function (b) {
        return 1 > (b *= 2) ? 0.5 * b * b : -0.5 * (--b * (b - 2) - 1)
    };
    sigma.tools.drawRoundRect = function (b, g, h, c, d) {
        b.fillStyle = "#009BE1";
        b.fillRect(g + e, h + e, c, d)
    };
    sigma.tools.getRGB = function (b, g) {
        var b = b.toString(),
            h = {
                r: 0,
                g: 0,
                b: 0
            };
        if (3 <= b.length && "#" == b.charAt(0)) {
            var c = b.length - 1;
            6 == c ? h = {
                r: parseInt(b.charAt(1) + b.charAt(2), 16),
                g: parseInt(b.charAt(3) + b.charAt(4), 16),
                b: parseInt(b.charAt(5) + b.charAt(5), 16)
            } : 3 == c && (h = {
                r: parseInt(b.charAt(1) + b.charAt(1), 16),
                g: parseInt(b.charAt(2) + b.charAt(2), 16),
                b: parseInt(b.charAt(3) + b.charAt(3), 16)
            })
        }
        g && (h = [h.r, h.g, h.b]);
        return h
    };
    sigma.tools.rgbToHex = function (b, g, h) {
        return sigma.tools.toHex(b) + sigma.tools.toHex(g) + sigma.tools.toHex(h)
    };
    sigma.tools.toHex = function (b) {
        b = parseInt(b, 10);
        if (isNaN(b)) return "00";
        b = Math.max(0, Math.min(b, 255));
        return "0123456789ABCDEF".charAt((b - b % 16) / 16) + "0123456789ABCDEF".charAt(b % 16)
    };
    sigma.publicPrototype = s.prototype
})();