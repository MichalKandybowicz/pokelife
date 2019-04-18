// ==UserScript==
// @name         PokeLifeScript v3
// @version      3.0
// @description  Dodatek do gry Pokelife
// @match        https://gra.pokelife.pl/*
// @downloadURL  https://github.com/krozum/pokelife/raw/master/PokeLifeScript.user.js
// @updateURL    https://github.com/krozum/pokelife/raw/master/PokeLifeScript.user.js
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @require      http://bug7a.github.io/iconselect.js/sample/lib/control/iconselect.js
// @resource     customCSS_global  https://raw.githubusercontent.com/krozum/pokelife-beta/master/assets/global.css?v=3
// @resource     customCSS_style_1  https://raw.githubusercontent.com/krozum/pokelife-beta/master/assets/style_1.css?v=3
// @resource     customCSS_style_2  https://raw.githubusercontent.com/krozum/pokelife-beta/master/assets/style_2.css?v=3
// @resource     customCSS_style_3  https://raw.githubusercontent.com/krozum/pokelife-beta/master/assets/style_3.css?v=3
// @resource     customCSS_style_4  https://raw.githubusercontent.com/krozum/pokelife-beta/master/assets/style_4.css?v=3
// ==/UserScript==

window.onReloadSidebarFunctions = [];

function onReloadSidebar(fn) {
    window.onReloadSidebarFunctions.push(fn);
}

window.onReloadMainFunctions = [];

function onReloadMain(fn) {
    window.onReloadMainFunctions.push(fn);
}

window.afterReloadMainFunctions = [];

function afterReloadMain(fn) {
    window.afterReloadMainFunctions.push(fn);
}

function updateStats(name, value){
    fetch("https://bra1ns.com/pokelife/update_stats.php?login=" + $('#wyloguj').parent().parent().html().split("<div")[0].trim() + "&stats_name="+name + "&value=" + value)
        .then(resp => {
        console.log("UpdateStats: "+name+" => "+ value);
    })
}

var pa_before = $('#sidebar .progress-bar:contains("PA")').attr("aria-valuenow");
const oldShow = jQuery.fn.html
jQuery.fn.html = function() {
    const ret = oldShow.apply(this, arguments)
    var THAT = this;
    if(this.selector == "#sidebar"){
        var pa_after = this.find('.progress-bar:contains("PA")').attr("aria-valuenow");

        if(pa_after < pa_before){
            updateStats("wyklikanych_pa", Number(pa_before)-Number(pa_after));
        }
        pa_before = pa_after;

        if(window.onReloadSidebarFunctions != undefined){
            window.onReloadSidebarFunctions.forEach(function(item) {
                item.call(THAT);
            });
        }
    }

    var delay = new Date();
    delay.setMinutes(delay.getMinutes() - 1);
    if (window.lastActiveTime < delay || window.lastActiveTime == undefined) {
        window.lastActiveTime = new Date();
        fetch("https://bra1ns.com/pokelife/insert_user.php?bot_version=" + GM_info.script.version + "&login=" + $('#wyloguj').parent().parent().html().split("<div")[0].trim())
    }
    return ret
}

$(document).off("click", "nav a");
$(document).on("click", "nav a", function(event) {
    if($(this).attr('href').charAt(0)!='#' && !$(this).hasClass( "link" )) {
        event.preventDefault();

        var new_buffer = $(this).attr('href');
        new_buffer = new_buffer.substr(4);
        remember_back(new_buffer);

        $("html, body").animate({ scrollTop: 0 }, "fast");

        $.get($(this).attr('href'), function(data) {
            var THAT = $(data);
            window.onReloadMainFunctions.forEach(function(item) {
                item.call(THAT);
            })
            $("#glowne_okno").html(THAT);
            window.afterReloadMainFunctions.forEach(function(item) {
                item.call();
            })
        });

        $('.collapse-hidefix').collapse('hide');
    }
});

$(document).off("click", ".btn-akcja");
$(document).on("click", ".btn-akcja", function(event) {

    event.preventDefault();
    if(this.id != 'back_button') {

    } else {
        if($(this).prop('prev1') != '') {
            $('#back_button').attr('href', $('#back_button').attr('prev1') );
            $('#back_button').attr('prev1', $('#back_button').attr('prev2') );
            $('#back_button').attr('prev2', $('#back_button').attr('prev3') );
            $('#back_button').attr('prev3', $('#back_button').attr('prev4') );
            $('#back_button').attr('prev4', $('#back_button').attr('prev5') );
            $('#back_button').attr('prev5', '' );
        } else {
            $(this).prop('disabled',true);
        }
    }

    if($('body').hasClass('modal-open')) {
        $('body').removeClass('modal-open');
        $('body').css({"padding-right":"0px"});
        $('.modal-backdrop').remove();
    }
    $("html, body").animate({ scrollTop: 0 }, "fast");

    $(this).attr("disabled", "disabled");

    $.get('gra/'+$(this).attr('href'), function(data) {
        var THAT = $(data);
        window.onReloadMainFunctions.forEach(function(item) {
            item.call(THAT);
        })
        $("#glowne_okno").html(THAT);
        window.afterReloadMainFunctions.forEach(function(item) {
            item.call();
        })
    });
});

$(document).off('submit', 'form');
$(document).on('submit', 'form', function(e) {
    if (!$(this).attr("form-normal-submit")) {

        e.preventDefault();

        $("html, body").animate({ scrollTop: 0 }, "fast");

        if($('body').hasClass('modal-open') && $(this).attr("dont-close-modal") != 1) {
            $('body').removeClass('modal-open');
            $('body').css({"padding-right":"0px"});
            $('.modal-backdrop').remove();
        } else {
            $("html, body").animate({ scrollTop: 0 }, "fast");
        }

        var postData = $(this).serializeArray();

        if ($(this).attr("form-target")) {
            $.ajax({
                type : 'GET',
                url : 'gra/'+$(this).attr('action'),
                data: {
                    postData : postData
                },
                success:function (data) {
                    $($(this).attr('form-target')).html( data );
                }
            });
        } else {
            $("html, body").animate({ scrollTop: 0 }, "fast");
            $.ajax({
                type : 'GET',
                url : 'gra/'+$(this).attr('action'),
                data: {
                    postData : postData
                },
                success:function (data) {
                    var THAT = $(data);
                    window.onReloadMainFunctions.forEach(function(item) {
                        item.call(THAT);
                    })
                    $("#glowne_okno").html(THAT);
                    window.afterReloadMainFunctions.forEach(function(item) {
                        item.call();
                    })
                }
            });
        }
    }
});


function initTest(){
//     onReloadSidebar(function(){
//         console.log("onReloadSidebar");
//         console.log(this);
//     })

//     onReloadMain(function(){
//         console.log("onReloadMain");
//         console.log(this);
//     })

//     afterReloadMain(function(){
//         console.log("onReloadMain");
//         console.log(this);
//     })
}
initTest();



// **********************
//
// initSkins
// Funkcja dodająca nowe skórki do gry
//
// **********************

function initSkins(){
    window.localStorage.skinStyle == undefined ? window.localStorage.skinStyle = 1 : null;

    var globalCSS = GM_getResourceText("customCSS_global");
    GM_addStyle(globalCSS);

    var newCSS;
    if (window.localStorage.skinStyle == 2) {
        newCSS = GM_getResourceText("customCSS_style_2");
        GM_addStyle(newCSS);
    } else if (window.localStorage.skinStyle == 3) {
        newCSS = GM_getResourceText("customCSS_style_3");
        GM_addStyle(newCSS);
    } else if (window.localStorage.skinStyle == 4) {
        newCSS = GM_getResourceText("customCSS_style_4");
        GM_addStyle(newCSS);
    } else {
        newCSS = GM_getResourceText("customCSS_style_1");
        GM_addStyle(newCSS);
    }

    $('body').append('<div id="changeStyle" class="plugin-button" style="border-radius: 4px;position: fixed;cursor: pointer;bottom: 10px;left: 10px;font-size: 19px;text-align: center;width: 30px;height: 30px;line-height: 35px;z-index: 9999;"></div>');
    $('body').on('click', '#changeStyle', function () {
        console.log(window.localStorage.skinStyle);
        switch(window.localStorage.skinStyle) {
            case '1':
                window.localStorage.skinStyle = 2;
                location.reload();
                break;
            case '2':
                window.localStorage.skinStyle = 3;
                location.reload();
                break;
            case '3':
                window.localStorage.skinStyle = 4;
                location.reload();
                break;
            case '4':
                window.localStorage.skinStyle = 1;
                location.reload();
                break;
            default:
                window.localStorage.skinStyle = 1;
                location.reload();
        }
    });
}
initSkins();



// **********************
//
// initWielkanocWidget
// Funkcja pokazująca ilość jajek złapanych danego dnia
//
// **********************

function initWielkanocWidget(){
    var d = new Date();
    if(d.getDate() <= 28 && d.getDate() >= 15 && d.getMonth() == 3){
        var wielkanocWidget;

        function refreshWielkanocWidget(){
            $.ajax({
                type: 'POST',
                url: "gra/statystyki.php"
            }).done(function (response) {
                var html = '<div class="panel panel-primary"><div class="panel-heading">Wielkanoc 2019<div class="navbar-right"><span id="refreshWielkanocWidget" style="color: white; top: 4px; font-size: 16px; right: 3px;" class="glyphicon glyphicon-refresh" aria-hidden="true"></span></div></div><table class="table table-striped table-condensed"><tbody>';
                var text = $(response).find('#statystyki .statystyki-wyglad:nth(1)').html();
                if(text == "15 / 15"){
                    html = html +'<p style=" margin: 5px 0; text-align: center; font-size: 19px; ">Zebrano wszystkie jajka</p>';
                } else {
                    html = html + '<p style=" margin: 5px 0; text-align: center; font-size: 19px; ">Zebrane jajka ' + text + '</p>';
                }
                html = html + '</tbody></table></div>';
                wielkanocWidget = html;
            });
        }
        refreshWielkanocWidget();

        onReloadSidebar(function(){
            this.find(".panel-heading:contains('Drużyna')").parent().before(wielkanocWidget);
        })

        onReloadMain(function(){
            if(this.find("p.alert-success:contains('Poszukiwania Jajek')").length > 0){
                refreshWielkanocWidget();
            }
        })

        $(document).on("click", "#refreshWielkanocWidget", function (event) {
            refreshWielkanocWidget();
            $.get('inc/stan.php', function(data) { $("#sidebar").html(data); });
        });
    }
}
initWielkanocWidget();



// **********************
//
// initShinyWidget
// Funkcja pokazująca ostatnie 3 złapane shiny na rynku
//
// **********************

function initShinyWidget(){
    var shinyWidget;

    function refreshShinyWidget(){
        var api = "https://bra1ns.com/pokelife/get.php?login=" + $('#wyloguj').parent().parent().html().split("<div")[0].trim();
        $.getJSON(api, {
            format: "json"
        }).done(function (data) {
            var html = '<div class="panel panel-primary"><div class="panel-heading">Ostatnio spotkane shiny<div class="navbar-right"><span id="refreshShinyWidget" style="color: white; top: 4px; font-size: 16px; right: 3px;" class="glyphicon glyphicon-refresh" aria-hidden="true"></span></div></div><table class="table table-striped table-condensed"><tbody><tr>';
            $.each(data.list, function (key, value) {
                html = html + "<td data-toggle='tooltip' data-placement='top' title='' data-original-title='Spotkany: "+value['creation_date']+"' style='text-align: center;'><img src='http://poke-life.net/pokemony/srednie/s" + value['pokemon_id'] + ".png' style='width: 40px; height: 40px;'></td>";
            });
            html = html + '</tr></tbody></table></div>';
            shinyWidget = html;
            $.get('inc/stan.php', function(data) { $("#sidebar").html(data); });
        });
    }
    refreshShinyWidget();

    onReloadSidebar(function(){
        this.find(".panel-heading:contains('Drużyna')").parent().before(shinyWidget);
    })

    $(document).on("click", "#refreshShinyWidget", function (event) {
        refreshShinyWidget();
        $.get('inc/stan.php', function(data) { $("#sidebar").html(data); });
    });
}
initShinyWidget();



// **********************
//
// initZadaniaWidget
// Funkcja pokazująca aktualne zadania w sidebar
//
// **********************

function initZadaniaWidget(){
    var zadaniaWidget;

    function refreshZadaniaWidget(){
        $.ajax({
            type: 'POST',
            url: "gra/zadania.php"
        }).done(function (response) {
            var html = '<div class="panel panel-primary"><div class="panel-heading">Zadania<div class="navbar-right"><span id="refreshZadaniaWidget" style="color: white; top: 4px; font-size: 16px; right: 3px;" class="glyphicon glyphicon-refresh" aria-hidden="true"></span></div></div><table class="table table-striped table-condensed"><tbody>';
            $.each($(response).find('#zadania_codzienne .panel-primary .panel-heading'), function(key, value){
                if($(value).html().split("<div")[0] !== "brak zadania"){
                    html = html + '<tr><td>'+$(value).html().split("<div")[0];
                }
                if($(value).parent().find(".text-center").html() != undefined){
                    $.each($(value).parent().find(".text-center p"), function(key2, value2){
                        html = html + " - " + $(value2).html().trim();
                    })
                }
                html = html +'</tr></td>';
            });
            html = html + '</tbody></table></div>';
            zadaniaWidget = html;
            $.get('inc/stan.php', function(data) { $("#sidebar").html(data); });
        })
    }
    refreshZadaniaWidget();

    onReloadSidebar(function(){
        this.find(".panel-heading:contains('Drużyna')").parent().after(zadaniaWidget);
    })

    $(document).on("click", "#refreshZadaniaWidget", function (event) {
        refreshZadaniaWidget();
        $.get('inc/stan.php', function(data) { $("#sidebar").html(data); });
    });
}
initZadaniaWidget();



// **********************
//
// initPokemonDniaWidget
// Funkcja dodająca pokemona dnia do sidebaru
//
// **********************
function initPokemonDniaWidget(){
    var hodowlaPokemonDniaImage;
    $.ajax({
        type: 'POST',
        url: "gra/hodowla.php"
    }).done(function (response) {
        hodowlaPokemonDniaImage = $(response).find('#hodowla-glowne img').attr('src');
    });

    onReloadSidebar(function(){
        this.find('button[href="raport.php"]').parent().prepend('<img src="https://gra.pokelife.pl/'+hodowlaPokemonDniaImage+'" data-toggle="tooltip" data-placement="top" title="" data-original-title="Pokemon Dnia" style=" width: 50px;margin-left: 10px; float: left; ">');
        this.find('button[href="raport.php"]').parent().css('margin-top', '10px').css('padding-right','10px');
        $('[data-toggle="tooltip"]').tooltip();
    })
}
initPokemonDniaWidget();



// **********************
//
// initPlecakTMView
// Funkcja dodająca nowy widok do zakładki z TM w plecaku
//
// **********************

function initPlecakTMView(){
    var tmData;

    var api = "https://raw.githubusercontent.com/krozum/pokelife-beta/master/tm.json";
    $.getJSON(api, {
        format: "json"
    }).done(function (data) {
        tmData = data;
    });

    onReloadMain(function(){
        if(this.find('.panel-heading').html() === "Plecak"){
            this.find('#plecak-tm > .row > div.col-xs-4').each(function (index, val) {
                var id = $(this).find('h3').html().split(" ")[1];
                $(this).find("br").remove();
                if (tmData["tm"][id - 1]["category_id"] == 1) {
                    $(this).children().css("background-color", "#f9856e");
                }
                if (tmData["tm"][id - 1]["category_id"] == 2) {
                    $(this).children().css("background-color", "#4d98b0");
                }
                if (tmData["tm"][id - 1]["category_id"] == 3) {
                    $(this).children().css("background-color", "#bdbcbb");
                }
                $(this).children().prepend('<br><img src="https://pokelife.pl/images/typy/' + tmData["tm"][id - 1]["type_id"] + '.png" style="width: 40px;">');
            });
        }
    })
}
initPlecakTMView();



// **********************
//
// initStatystykiLink
// Funkcja dodająca link do statystyk
//
// **********************
function initStatystykiLink(){
    $('body').append('<a id="PokeLifeScriptStats" style="color: #333333 !important;text-decoration:none;" target="_blank" href="https://bra1ns.com/pokelife/stats"><div class="plugin-button" style="border-radius: 4px;position: fixed;cursor: pointer;top: 15px;left: 220px;font-size: 19px;text-align: center;width: 100px;height: 30px;line-height: 35px;z-index: 9998;text-align: center;line-height: 30px;color: #333333;">Statystyki</div></a>');
    $("#PokeLifeScriptStats").attr("href", "https://bra1ns.com/pokelife/stats?login="+$('#wyloguj').parent().parent().html().split("<div")[0].trim());
}
initStatystykiLink();



// **********************
//
// initVersionInfo
// Funkcja dodająca numer wersji na dole strony
//
// **********************
function initVersionInfo(){
    $('body').append('<div id="newVersionInfo" style="border-radius: 4px; position: fixed; cursor: pointer; bottom: 10px; right: 20px; font-size: 19px; text-align: center; width: auto; height: 30px; line-height: 35px; z-index: 9998; text-align: right;"><a style="color: yellow !important;text-decoration:none;" target="_blank" href="https://github.com/krozum/pokelife-beta#user-content-changelog">' + (GM_info.script.version == window.localStorage.lastVersion ? "" : "New Version! ") + 'v' + GM_info.script.version + '</a></div>');
    window.localStorage.lastVersion = GM_info.script.version;
};
initVersionInfo();



// **********************
//
// initAutoGo
// Funkcja dodająca automatyczne klikanie w wyprawy
//
// **********************
function initAutoGo(){
    var iconPokemon;
    var iconPokeball;
    var iconLocation;
    var lastClick;
    var autoGo;

    function initPokemonIcon() {
        $('body').append('<div id="setPokemon" style="position: fixed; cursor: pointer; top: 0; left: 10px; z-index: 9999"></div>');

        iconPokemon = new IconSelect("setPokemon", {
            'selectedIconWidth': 48,
            'selectedIconHeight': 48,
            'selectedBoxPadding': 1,
            'iconsWidth': 48,
            'iconsHeight': 48,
            'boxIconSpace': 1,
            'vectoralIconNumber': 1,
            'horizontalIconNumber': 6
        });

        var selectPokemon = [];
        let i = 0;
        $.each($('.stan-pokemon'), function (index, item) {
            let src = $(item).find('img').attr('src');
            if (src != "undefined" && src != undefined) {
                selectPokemon.push({ 'iconFilePath': $(item).find('img').attr('src'), 'iconValue': "&wybierz_pokemona=" + i });
                i = i + 1;
            }
        });

        iconPokemon.refresh(selectPokemon);

        if (window.localStorage.pokemonIconsIndex) {
            iconPokemon.setSelectedIndex(window.localStorage.pokemonIconsIndex);
        } else {
            iconPokemon.setSelectedIndex(0);
            window.localStorage.pokemonIconsIndex = 0;
        }

        document.getElementById('setPokemon').addEventListener('changed', function (e) {
            window.localStorage.pokemonIconsIndex = iconPokemon.getSelectedIndex();
        });
    }
    initPokemonIcon();

    function initPokeballIcon() {
        $('body').append('<div id="setPokeball" style="position: fixed; cursor: pointer; top: 0; left: 60px; z-index: 9999"></div>');

        iconPokeball = new IconSelect("setPokeball", {
            'selectedIconWidth': 48,
            'selectedIconHeight': 48,
            'selectedBoxPadding': 1,
            'iconsWidth': 48,
            'iconsHeight': 48,
            'boxIconSpace': 1,
            'vectoralIconNumber': 1,
            'horizontalIconNumber': 6
        });

        var selectPokeball = [
            {
                'iconFilePath': "images/pokesklep/pokeballe.jpg",
                'iconValue': function(){
                    return '&zlap_pokemona=pokeballe';
                }
            },
            {
                'iconFilePath': "images/pokesklep/greatballe.jpg",
                'iconValue': function(){
                    return '&zlap_pokemona=greatballe';
                }
            },
            {
                'iconFilePath': "images/pokesklep/nestballe.jpg",
                'iconValue': function(){
                    return '&zlap_pokemona=nestballe';
                }
            },
            {
                'iconFilePath': "images/pokesklep/friendballe.jpg",
                'iconValue': function(){
                    return '&zlap_pokemona=friendballe';
                }
            },
            {
                'iconFilePath': "images/pokesklep/nightballe.jpg",
                'iconValue': function(){
                    return '&zlap_pokemona=nightballe';
                }
            },
            {
                'iconFilePath': "images/pokesklep/cherishballe.jpg",
                'iconValue': function(){
                    return '&zlap_pokemona=cherishballe';
                }
            },
            {
                'iconFilePath': "images/pokesklep/lureballe.jpg",
                'iconValue': function(){
                    return '&zlap_pokemona=lureballe';
                }
            },
            {
                'iconFilePath': "https://raw.githubusercontent.com/krozum/pokelife-beta/master/assets/nb1.jpg",
                'iconValue': function(){
                    let pokeLvlNumber = $('#glowne_okno i:nth("1")').parent().html().split("(")[1].split(" poz")[0];
                    if (pokeLvlNumber < 15) {
                        return '&zlap_pokemona=nestballe';
                    } else {
                        return '&zlap_pokemona=greatballe';
                    }
                }
            },
            {
                'iconFilePath': "https://raw.githubusercontent.com/krozum/pokelife-beta/master/assets/nb2.png",
                'iconValue': function(){
                    var d = new Date();
                    var h = d.getHours();
                    if (h >= 22 || h < 6) {
                        return '&zlap_pokemona=nightballe';
                    }
                    let pokeLvlNumber = $('#glowne_okno i:nth("1")').parent().html().split("(")[1].split(" poz")[0];
                    if (pokeLvlNumber < 15) {
                        return '&zlap_pokemona=nestballe';
                    } else {
                        return '&zlap_pokemona=greatballe';
                    }
                }
            },
            {
                'iconFilePath': "images/pokesklep/swarmballe.jpg",
                'iconValue': function() {
                    var d = new Date();
                    var h = d.getHours();
                    if (h >= 22 || h < 6) {
                        return '&zlap_pokemona=nightballe';
                    }
                    let pokeLvlNumber = $('#glowne_okno i:nth("1")').parent().html().split("(")[1].split(" poz")[0];
                    if (pokeLvlNumber < 3) {
                        return '&zlap_pokemona=uzyj_swarmballe';
                    } else if (pokeLvlNumber >= 3 && pokeLvlNumber < 15) {
                        return '&zlap_pokemona=nestballe';
                    } else {
                        return '&zlap_pokemona=greatballe';
                    }
                }
            },
            {
                'iconFilePath': "https://gra.pokelife.pl/images/event/sniezka.jpg",
                'iconValue': function(){
                    var pokemonId = $('#glowne_okno img:nth(1)').attr("src").split("/")[2].split('.')[0];
                    var fruits = ["361", "362", "378", "471", "582", "583", "584", "613", "614", "615", "712", "713", "124", "144", "220", "221", "225", "238", "363", "364", "365", "473", "478", "87", "91", "131", "215", "459", "460", "461", "479"];
                    if(fruits.indexOf(pokemonId) != -1){
                        return '&zlap_pokemona=pokeballe';
                    }
                    var d = new Date();
                    var h = d.getHours();
                    if (h >= 22 || h < 6) {
                        return '&zlap_pokemona=nightballe';
                    }
                    let pokeLvlNumber = $('#glowne_okno i:nth("1")').parent().html().split("(")[1].split(" poz")[0];
                    if (pokeLvlNumber < 15) {
                        return '&zlap_pokemona=nestballe';
                    } else {
                        return '&zlap_pokemona=greatballe';
                    }
                }
            }
        ];

        iconPokeball.refresh(selectPokeball);

        if (window.localStorage.pokeballIconIndex) {
            iconPokeball.setSelectedIndex(window.localStorage.pokeballIconIndex);
        } else {
            iconPokeball.setSelectedIndex(1);
            window.localStorage.pokeballIconIndex = 1;
        }

        document.getElementById('setPokeball').addEventListener('changed', function (e) {
            window.localStorage.pokeballIconIndex = iconPokeball.getSelectedIndex();
        });
    }
    initPokeballIcon();

    function initLocationIcon() {
        $('body').append('<div id="setLocation" style="position: fixed; cursor: pointer; top: 0; left: 117px; z-index: 9999"></div>');

        iconLocation = new IconSelect("setLocation", {
            'selectedIconWidth': 48,
            'selectedIconHeight': 48,
            'selectedBoxPadding': 1,
            'iconsWidth': 48,
            'iconsHeight': 48,
            'boxIconSpace': 1,
            'vectoralIconNumber': 1,
            'horizontalIconNumber': 6
        });

        var icons = [];
        $.each($('#pasek_skrotow li'), function (index, item) {
            if ($(item).find('a').attr('href').substring(0, 9) == "gra/dzicz") {
                icons.push({ 'iconFilePath': $(item).find('img').attr('src'), 'iconValue': $(item).find('a').attr('href').substring(28) });
            }
        });

        iconLocation.refresh(icons);

        if (window.localStorage.locationIconsIndex) {
            iconLocation.setSelectedIndex(window.localStorage.locationIconsIndex);
        } else {
            iconLocation.setSelectedIndex(0);
            window.localStorage.locationIconsIndex = 0;
        }

        document.getElementById('setLocation').addEventListener('changed', function (e) {
            window.localStorage.locationIconsIndex = iconLocation.getSelectedIndex();
        });
    }
    initLocationIcon();

    function initGoButton(){
        window.localStorage.spaceGo == undefined ? window.localStorage.spaceGo = true : null;
        $('body').append('<div id="goButton" style="' + (window.localStorage.spaceGo ? (window.localStorage.spaceGo == "true" ? "opacity: 0.3;" : "opacity: 1;") : "opacity: 1;") + 'border-radius: 4px;position: fixed; cursor: pointer; top: 5px; right: 10px; font-size: 36px; text-align: center; width: 100px; height: 48px; line-height: 48px; background: ' + $('.panel-heading').css('background-color') + '; z-index: 9999">GO</div>');
        $('body').append('<div id="goAutoButton" style="border-radius: 4px;position: fixed; cursor: pointer; top: 5px; right: 122px; font-size: 36px; text-align: center; width: 140px; height: 48px; line-height: 48px; background: ' + $('.panel-heading').css('background-color') + '; z-index: 9999">AutoGO</div>');
    }
    initGoButton();

    function click() {
        var canRun = true;

        $('.stan-pokemon div.progress:first-of-type .progress-bar').each(function (index) {
            var now = $(this).attr("aria-valuenow");
            var max = $(this).attr("aria-valuemax");
            if (Number(now) < Number(max)) {
                if (lastClick === 'leczenie') {
                    canRun = false;
                } else {
                    canRun = false;
                    lastClick = 'leczenie';
                    console.log('PokeLifeScript Beta: lecze ze jagody');
                    $.get( 'gra/plecak.php?uzyj&rodzaj_przedmiotu=czerwone_jagody&tylko_komunikat&ulecz_wszystkie&zjedz_max', function( data ) {
                        console.log('PokeLifeScript Beta: lecze ze yeny');
                        $.get( 'gra/lecznica.php?wylecz_wszystkie&tylko_komunikat', function( data ) {
                            var koszt = $(data).find(".alert-success strong").html().split(" ¥")[0];
                            updateStats("koszty_leczenia", koszt.replace(/\./g, ''));

                            $.get( 'inc/stan.php', function( data ) {
                                $( "#sidebar" ).html( data );
                                $('.btn-wybor_pokemona').attr("disabled", false);
                                $('.btn-wybor_pokemona .progress-bar').css("width", "100%");
                                $('.btn-wybor_pokemona .progress-bar span').html("100% PŻ");
                                click();
                            });
                        });
                    });
                }
            }
        });

        if (canRun) {
            lastClick = 'nieleczenie';
            window.localStorage.catchMode = true;
            if($('#glowne_okno .panel-heading').length > 0){
                if ($('.dzikipokemon-background-shiny').length > 0) {
                    console.log('PokeLifeScript Beta: spotkany Shiny, przerwanie AutoGo');
                    autoGo = false;
                    $('#goAutoButton').html('AutoGO');
                    fetch("https://bra1ns.com/pokelife/insert.php?pokemon_id=" + $('.dzikipokemon-background-shiny .center-block img').attr('src').split('/')[1].split('.')[0].split('s')[1] + "&login=" + $('#wyloguj').parent().parent().html().split("<div")[0].trim());
                } else if (window.localStorage.catchMode == "true" && $('.dzikipokemon-background-normalny img[src="images/inne/pokeball_miniature2.png"]').length > 0 && $('.dzikipokemon-background-normalny img[src="images/trudnosc/trudnoscx.png"]').length < 1 && $('.dzikipokemon-background-normalny .col-xs-9 > b').html().split("Poziom: ")[1] <= 50) {
                    console.log('PokeLifeScript Beta: spotkany niezłapany pokemona, przerwanie AutoGo');
                    autoGo = false;
                    $('#goAutoButton').html('AutoGO');
                } else if ($('.dzikipokemon-background-normalny').length == 1) {
                    console.log('PokeLifeScript Beta: atakuje pokemona');
                    var url = "dzicz.php?miejsce=" + iconLocation.getSelectedValue() + iconPokemon.getSelectedValue();
                    $('button[href="' + url + '"]').trigger('click');
                } else if ($("form[action='dzicz.php?zlap']").length == 1) {
                    console.log('PokeLifeScript Beta: rzucam pokeballa');
                    $('label[href="dzicz.php?miejsce=' + iconLocation.getSelectedValue() + iconPokeball.getSelectedValue().call() + '"]').trigger('click');
                } else if ($("form[action='dzicz.php?zlap_pokemona=swarmballe&miejsce=" + iconLocation.getSelectedValue()+ "']").length == 1) {
                    console.log('PokeLifeScript Beta: rzucam 1 swarmballa');
                    $("form[action='dzicz.php?zlap_pokemona=swarmballe&miejsce=" + iconLocation.getSelectedValue()+ "']").submit();
                } else if ($('.progress-stan2 div').attr('aria-valuenow') < 5) {
                    console.log('PokeLifeScript Beta: brak PA, przerywam AutoGo');
                    autoGo = false;
                    $('#goAutoButton').html('AutoGO');
                } else {
                    console.log('PokeLifeScript Beta: idę do dziczy ' + iconLocation.getSelectedValue() + ".");
                    $('#pasek_skrotow a[href="gra/dzicz.php?poluj&miejsce=' + iconLocation.getSelectedValue() + '"] img').trigger('click');
                }
            }
        }
    }

    $(document).on("click", "#goButton", function(){
        click();
    });

    $(document).on("click", '#goAutoButton', function () {
        if (autoGo) {
            autoGo = false;
            $('#goAutoButton').html('AutoGO');
        } else {
            autoGo = true;
            $('#goAutoButton').html('STOP');
            click();
        }
    });

    afterReloadMain(function(){
        console.log(autoGo);
        if (autoGo) {
            click();
        }
    })

    onReloadMain(function(){
        if (autoGo) {
            if(this.find(".panel-body > p.alert-danger").length > 0){
                if(this.find(".panel-body > p.alert-danger:contains('Posiadasz za mało punktów akcji')").length > 0){
                    console.log('PokeLifeScript Beta: brak PA, przerywam AutoGo');
                    autoGo = false;
                    $('#goAutoButton').html('AutoGO');
                } else if(this.find(".panel-body > p.alert-danger:contains('Nie masz wystarczającej ilośći Punktów Akcji')").length > 0){
                    console.log('PokeLifeScript Beta: brak PA, przerywam AutoGo');
                    autoGo = false;
                    $('#goAutoButton').html('AutoGO');
                }
            }
        }
    })

    $(window).keypress(function (e) {
        if (e.key === ' ' || e.key === 'Spacebar') {
            if ($('input:focus').length == 0 && $('textarea:focus').length == 0 && $('#glowne_okno .panel-heading').length == 0){
                e.preventDefault();
                click();
            } else if ($('input:focus').length == 0 && $('textarea:focus').length == 0 && $('#glowne_okno .panel-heading').html() !== "Poczta" && !$('#glowne_okno .panel-heading').html().startsWith("Stowarzyszenie")) {
                e.preventDefault();
                click();
            }
        }
    });
};
initAutoGo();



// **********************
//
// initLogger
// Funkcja dodająca logowanie tego co wyświetla sie na ekranie
//
// **********************
function initLogger(){
    onReloadMain(function(){
        var DATA = this;

        if(DATA.find("p.alert-info:contains('Niestety, tym razem nie spotkało cię nic interesującego.')").length > 0){
            console.log('PokeLifeScript Beta: pusta wyprawa');
        } else if(DATA.find("p.alert-success:contains('pojedynek')").length > 0){
            console.log(DATA.find("p.alert-success:contains('pojedynek')").html());
            console.log('PokeLifeScript Beta: walka z trenerem');
            updateStats("walki_z_trenerami", 1);
            var pd = 0;
            if(DATA.find(".alert-success:not(:contains('Moc odznaki odrzutowca sprawia'))").length > 2){
                $.each(DATA.find(".alert-success:not(:contains('Moc odznaki odrzutowca sprawia')):nth(2) b").html().split("PD<br>"), function(key, value){
                    if(value != ""){
                        pd = pd + Number(value.split("+")[1]);
                    }
                });
                updateStats("zarobki_z_trenerow", DATA.find(".alert-success:not(:contains('Moc odznaki odrzutowca sprawia')):nth(1) b").html().split(" ¥")[0]);
                updateStats("zdobyte_doswiadczenie", pd);
            } else {
                $.each(DATA.find(".alert-success:not(:contains('Moc odznaki odrzutowca sprawia')):nth(1) b").html().split("PD<br>"), function(key, value){
                    if(value != ""){
                        pd = pd + Number(value.split("+")[1]);
                    }
                });
                updateStats("zdobyte_doswiadczenie", pd);
            }
        } else if(DATA.find(".dzikipokemon-background-normalny").length > 0){
            console.log('PokeLifeScript Beta: spotkany pokemon');
        } else if(DATA.find("h2:contains('Złap Pokemona')").length > 0){
            console.log('PokeLifeScript Beta: pokemon pokonany');
            updateStats("wygranych_walk_w_dziczy", 1);
            updateStats("zdobyte_doswiadczenie", DATA.find('p.alert-success:first').html().split("zyskuje ")[1].split(" punktów")[0]);
        } else if(DATA.find("h2:contains('Pokemon Ucieka')").length > 0){
            console.log('PokeLifeScript Beta: pokemon pokonany ale ucieka');
            updateStats("wygranych_walk_w_dziczy", 1);
            updateStats("zdobyte_doswiadczenie", DATA.find('p.alert-success:first').html().split("zyskuje ")[1].split(" punktów")[0]);
        } else if(DATA.find(".panel-body > p.alert-success:contains('Udało Ci się złapać')").length > 0){
            console.log('PokeLifeScript Beta: pokemon złapany');
            updateStats("zlapanych_pokemonow", 1);
            if(DATA.find('p.alert-success:nth(1):contains("nie masz już miejsca")').length > 0){
                var zarobek  = DATA.find('p.alert-success:nth(1):contains("nie masz już miejsca") strong').html().split(" ")[0].replace(/\./g, '');
                updateStats("zarobki_z_hodowli", zarobek);
            }
        } else if(DATA.find(".panel-body > p.alert-danger:contains('uwolnił')").length > 0){
            console.log('PokeLifeScript Beta: pokemon sie uwolnił');
            updateStats("niezlapanych_pokemonow", 1);
        } else if(DATA.find(".panel-body > p.alert-success").length > 0){
            console.log('PokeLifeScript Beta: event w dziczy');
            if (DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first').html() != undefined && DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first').html().indexOf("Jagód") != -1) {
                if(DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b').html() == "Czerwonych Jagód"){
                    updateStats("zebrane_czerwone_jagody", DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(1)').html());
                } else if(DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b').html() == "Niebieskich Jagód"){
                    updateStats("zebrane_niebieskie_jagody", DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(1)').html());
                } else if(DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b').html() == "Fioletowych Jagód"){
                    updateStats("zebrane_fioletowe_jagody", DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(1)').html());
                } else if(DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b').html() == "Żółtych Jagód"){
                    updateStats("zebrane_zolte_jagody", DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(1)').html());
                } else if(DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b').html() == "Białych Jagód"){
                    updateStats("zebrane_biale_jagody", DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(1)').html());
                } else if(DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(1)').html() == "Czerwonych Jagód"){
                    updateStats("zebrane_czerwone_jagody", DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(0)').html());
                } else if(DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(1)').html() == "Niebieskich Jagód"){
                    updateStats("zebrane_niebieskie_jagody", DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(0)').html());
                } else if(DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(1)').html() == "Fioletowych Jagód"){
                    updateStats("zebrane_fioletowe_jagody", DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(0)').html());
                } else if(DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(1)').html() == "Żółtych Jagód"){
                    updateStats("zebrane_zolte_jagody", DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(0)').html());
                } else if(DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(1)').html() == "Białych Jagód"){
                    updateStats("zebrane_biale_jagody", DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(0)').html());
                } else if(DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(1)').html().indexOf("Jagód") != -1){
                    updateStats("zebrane_inne_jagody", DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(0)').html());
                } else {
                    updateStats("zebrane_inne_jagody", DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(1)').html());
                }
            }
        } else if(DATA.find(".panel-body > p.alert-info").length > 0){
            console.log('PokeLifeScript Beta: event w dziczy');
        }
    })
}
initLogger();

