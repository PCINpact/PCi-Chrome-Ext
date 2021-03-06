(function () {
    var c = [], b = [];
    c[0] = "Dimanche";
    c[1] = "Lundi";
    c[2] = "Mardi";
    c[3] = "Mercredi";
    c[4] = "Jeudi";
    c[5] = "Vendredi";
    c[6] = "Samedi";
    b[0] = "janvier";
    b[1] = "f\u00e9vrier";
    b[2] = "mars";
    b[3] = "avril";
    b[4] = "mai";
    b[5] = "juin";
    b[6] = "juillet";
    b[7] = "ao\u00fbt";
    b[8] = "septembre";
    b[9] = "octobre";
    b[10] = "novembre";
    b[11] = "d\u00e9cembre";
    Date.prototype.daysArray = c;
    Date.prototype.monthsArray = b;
    String.prototype.dateFromDotNet = function () {
        var a = this.substring(6, this.length - 2);
        return new Date(parseInt(a))
    };
    Date.prototype.toTimeString =
        function (a, b) {
            var e = 10 > this.getHours() ? "0" + this.getHours() : this.getHours(), d = 10 > this.getMinutes() ? "0" + this.getMinutes() : this.getMinutes(), c = 10 > this.getSeconds() ? "0" + this.getSeconds() : this.getSeconds(), e = [e, d];
            b && e.push(c);
            return e.join(a)
        };
    Date.prototype.toFR = function (a) {
        var b = ["Le", this.daysArray[this.getDay()], this.getDate(), this.monthsArray[this.getMonth()], this.getFullYear()];
        a && b.push("\u00e0", this.toTimeString(":"));
        return b.join(" ")
    };
    Date.prototype.toIlya = function () {
        var a = new Date - this, b =
            [], e, d;
        6E4 > a ? b.push("Il y a quelques secondes") : 36E5 > a ? (a = Math.round(a / 1E3 / 60), b.push("Il y a", a), b.push(1 < a ? "minutes" : "minute")) : 72E5 > a ? b.push("Il y a environ une heure") : 864E5 > a ? (a = this.toFR(!0), e = a.indexOf("\u00e0"), b.push("Hier,", a.substr(e))) : 6048E5 > a ? (a = this.toFR(!0), e = a.indexOf("\u00e0"), d = [a.split(" ")[1], ","], b.push(d.join(""), a.substr(e))) : b.push(this.toFR(!0));
        return b.join(" ")
    }
})();
(function () {
    var c = {actus:{get:function (b, a) {
        if ("string" != typeof b || "number" != typeof a)throw"Impossible de rappatrier les actualit\u00e9s. Un des param\u00e8tres indiqu\u00e9 n'\u00e9tait pas valide";
        var f = !1, e = [];
        if ("" != b || 0 < a)"" != b && e.push("redacteur=", encodeURIComponent(b), "&"), 0 < a && e.push("nb_news=", a), f = !0;
        var f = JSON.parse(c.tools.executeSyncRequest("POST", "http://www.pcinpact.com/ReadApi/ListActu", e.join(""), f)), d;
        for (d in f.List) {
            var e = f.List[d].PublishDate.dateFromDotNet(), g = e.toFR(!1);
            f.List[d].PublishDate =
            {date:g, time:e.toTimeString(":"), old_format:f.List[d].PublishDate}
        }
        f.lastUpdateDate = (new Date).toString();
        return f
    }, check:function () {
        var b = c.actus.get("", 0), a = {};
        if (localStorage.PCiActusLastCheck) {
            var a = JSON.parse(localStorage.PCiActusLastCheck), f = [];
            if (b.List[0].Id != a.List[0].Id || b.NbNews != a.NbNews)for (var e in b.List) {
                var d = b.List[e], g = a.List, h = !0, i = void 0;
                for (i in g)if (g[i].Id == d.Id && g[i].PublishDate.old_format == d.PublishDate.old_format) {
                    h = !1;
                    break
                }
                h && f.push(b.List[e])
            }
            a = {List:f}
        } else c.tools.logMessage("Premi\u00e8re v\u00e9rification des actualit\u00e9s",
            !1);
        localStorage.PCiActusLastCheck = JSON.stringify(b);
        a.lastUpdateDate = (new Date).toString();
        return a
    }}, emploi:{get:function (b) {
        c.tools.executeAsyncRequestV2("GET", "http://www.pcinpact.com/rss/emplois.xml", "document", function (a) {
            var a = a.response.getElementsByTagName("item"), f = [], e = {};
            console.log(a);
            for (var d = 0; d < a.length; d++) {
                var c = {};
                c.title = a[d].getElementsByTagName("title")[0].childNodes[0].nodeValue;
                c.url = a[d].getElementsByTagName("link")[0].childNodes[0].nodeValue;
                c.description = a[d].getElementsByTagName("description")[0].childNodes[0].nodeValue;
                console.log(c);
                f.push(c)
            }
            e.list = f;
            e.lastUpdateDate = (new Date).toString();
            e.error = !1;
            b(e)
        })
    }}, forum:{get:function (b) {
        c.tools.executeAsyncRequestV2("GET", "http://forum.pcinpact.com/", "document", function (a) {
            var f = a.response.getElementById("user_link"), e = a.response.getElementById("index_stats").getElementsByClassName("bbc_member")[0], d = {};
            d.last_update_date = (new Date).toString();
            e && (d.gagnant = {name:e.innerText, url:e.href});
            if (null != f) {
                e = a.response.getElementById("inbox_link");
                a = a.response.getElementById("notify_link");
                "%C2%A0" == encodeURIComponent(e.innerText) && (e.innerText = "0");
                "%C2%A0" == encodeURIComponent(a.innerText) && (a.innerText = "0");
                var c = e.href, h = a.href;
                d.messages = {count:parseInt(e.innerText), url:c};
                d.notifications = {count:parseInt(a.innerText), url:h};
                d.user = {name:f.innerText, url:f.href};
                d.isLoggedIn = !0
            } else d.isLoggedIn = !1;
            b(d)
        })
    }}, user:{getInfos:function () {
        var b = JSON.parse(c.tools.executeSyncRequest("POST", "http://www.pcinpact.com/ReadApi/UserInfo", "", !1));
        b.lastUpdateDate = (new Date).toString();
        return b
    }}};
    window.PCi || (window.PCi = c)
})();
(function () {
    var c = {getBonsPlans:function (b) {
        PCi.tools.executeAsyncRequestV2("GET", "http://www.prixdunet.com/bon-plan.html?motcle=&type=0&order=nb_lectures&way=desc", "document", function (a) {
            for (var c = {}, e = [], d = a.response.getElementById("list_bp").getElementsByClassName("bp_table"), a = a.response.getElementById("list_bp").getElementsByClassName("bp_titre"), g = 0; g < a.length; g++)c = {titre:a[g].getElementsByTagName("a")[0].innerText, date:a[g].getElementsByTagName("span")[0].innerText, categorie:{img:d[g].getElementsByTagName("img")[0].src,
                url:d[g].getElementsByTagName("a")[0].href}, url:a[g].getElementsByTagName("a")[0].href}, e.push(c), c = {list:e, lastUpdateDate:(new Date).toString(), error:!1};
            b(c)
        })
    }};
    window.PdN || (window.PdN = c)
})();
(function () {
    var c;
    c = {getQRCodeURL:function (b, a) {
        return["http://api.qrserver.com/v1/create-qr-code/?size=", a, "x", a, "&data=", encodeURI(b)].join("")
    }, getSocialCount:function (b) {
        var a = JSON.parse(c.executeSyncRequest("GET", "https://graph.facebook.com/?ids=" + b, !1)).shares, b = JSON.parse(c.executeSyncRequest("GET", "http://urls.api.twitter.com/1/urls/count.json?url=" + b, !1)).count, f = c.stringToInt(a) + c.stringToInt(b);
        return{facebook:a, twitter:b, total:f}
    }, executeSyncRequest:function (b, a, c, e) {
        var d = new XMLHttpRequest;
        e && d.setRequestHeader("Content-Type', 'application/x-www-form-urlencoded");
        d.open(b, a, !1);
        d.send(c);
        return d.responseText
    }, executeAsyncRequestV2:function (b, a, c, e) {
        var d = new XMLHttpRequest;
        d.open(b, a, !0);
        d.responseType = c;
        d.onload = function () {
            200 == this.status && e(this)
        };
        d.send(null)
    }, logMessage:function (b, a) {
        if (localStorage.PCiEnableLog || a) {
            var c = [];
            a && c.push("### Erreur ###");
            c.push((new Date).toFR(!0), "-", b);
            console.log(c.join(" "))
        }
    }, stringToInt:function (b) {
        var a = 0;
        b && (a = parseInt(b));
        return a
    }, urlToLocalBlob:function (b, a) {
        c.executeAsyncRequestV2("GET", b, "arraybuffer", function (b) {
            var c = new FileReader, d = new WebKitBlobBuilder;
            d.append(b.response);
            c.readAsDataURL(d.getBlob("image/png"));
            c.onload = function (b) {
                a(b.target.result)
            }
        })
    }};
    window.PCi && !window.PCi.tools && (window.PCi.tools = c)
})();
